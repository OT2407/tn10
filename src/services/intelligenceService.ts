import { PrismaClient, Prisma } from '@prisma/client';
import { computeScore } from '../ranking/scoring';
import type { LayerBreakdown } from '../ranking/types';
import { getSnapshot, setSnapshot } from '../cache/feedSnapshot';
import { logRankingTelemetry } from '../telemetry/rankingTelemetry';
import { DIVERSITY } from '../ranking/diversity';

const prisma = new PrismaClient();

const LIKE_TAG_WEIGHT = 1;
const SAVE_TAG_WEIGHT = 3;
const FOLLOW_DESIGNER_WEIGHT = 2;
const PURCHASE_CATEGORY_WEIGHT = 4;

export interface ExplorePageInput {
  userId: string;
  limit: number;
  cursor?: string;
}

export interface ExploreScoredItem {
  itemId: string;
  score: number;
  title: string | null;
  category: string | null;
  sellerId: string | null;
  createdAt: Date;
}

export interface ExplorePage {
  items: ExploreScoredItem[];
  nextCursor: string | null;
}

type WeightMap = Record<string, number>;

interface RankedSnapshot {
  rankedItems: ExploreScoredItem[];
  breakdownByItemId: Map<string, LayerBreakdown>;
  expiresAt: number;
}

const rankingDetailStore = new Map<string, RankedSnapshot>();

function normalizeWeightMap(value: Prisma.JsonValue): WeightMap {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }
  const output: WeightMap = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      output[key] = raw;
    }
  }
  return output;
}

function mergeWeight(base: WeightMap, key: string, increment: number): WeightMap {
  return {
    ...base,
    [key]: (base[key] ?? 0) + increment,
  };
}

async function getOrCreatePreferenceTx(tx: Prisma.TransactionClient, userId: string) {
  const existing = await tx.userPreference.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }
  return tx.userPreference.create({
    data: {
      userId,
      tagWeights: {},
      categoryWeights: {},
      designerWeights: {},
    },
  });
}

function invalidateUserSnapshot(userId: string): void {
  rankingDetailStore.delete(userId);
  setSnapshot(userId, []);
}

export async function applyLikePreferenceBoost(userId: string, itemId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: itemId },
      include: { tags: { include: { tag: true } } },
    });
    if (!item) {
      return;
    }

    const preference = await getOrCreatePreferenceTx(tx, userId);
    let tagWeights = normalizeWeightMap(preference.tagWeights);

    for (const relation of item.tags) {
      tagWeights = mergeWeight(tagWeights, relation.tag.name, LIKE_TAG_WEIGHT);
    }

    await tx.userPreference.update({
      where: { userId },
      data: { tagWeights },
    });
  });

  invalidateUserSnapshot(userId);
}

export async function applySavePreferenceBoost(userId: string, itemId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: itemId },
      include: { tags: { include: { tag: true } } },
    });
    if (!item) {
      return;
    }

    const preference = await getOrCreatePreferenceTx(tx, userId);
    let tagWeights = normalizeWeightMap(preference.tagWeights);

    for (const relation of item.tags) {
      tagWeights = mergeWeight(tagWeights, relation.tag.name, SAVE_TAG_WEIGHT);
    }

    await tx.userPreference.update({
      where: { userId },
      data: { tagWeights },
    });
  });

  invalidateUserSnapshot(userId);
}

export async function applyFollowPreferenceBoost(userId: string, followingId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const preference = await getOrCreatePreferenceTx(tx, userId);
    const designerWeights = normalizeWeightMap(preference.designerWeights);

    await tx.userPreference.update({
      where: { userId },
      data: {
        designerWeights: mergeWeight(designerWeights, followingId, FOLLOW_DESIGNER_WEIGHT),
      },
    });
  });

  invalidateUserSnapshot(userId);
}

export async function applyPurchasePreferenceBoost(userId: string, itemId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item || item.category === null) {
      return;
    }

    const preference = await getOrCreatePreferenceTx(tx, userId);
    const categoryWeights = normalizeWeightMap(preference.categoryWeights);

    await tx.userPreference.update({
      where: { userId },
      data: {
        categoryWeights: mergeWeight(categoryWeights, item.category, PURCHASE_CATEGORY_WEIGHT),
      },
    });
  });

  invalidateUserSnapshot(userId);
}

async function buildSnapshot(userId: string): Promise<RankedSnapshot> {
  const preference = await prisma.userPreference.findUnique({ where: { userId } });
  const tagWeights = normalizeWeightMap(preference?.tagWeights ?? {});
  const categoryWeights = normalizeWeightMap(preference?.categoryWeights ?? {});
  const designerWeights = normalizeWeightMap(preference?.designerWeights ?? {});

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const items = await prisma.item.findMany({
    include: {
      tags: { include: { tag: true } },
      likes: {
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true },
      },
      saves: {
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true },
      },
    },
  });

  const sellerIds = Array.from(
    new Set(items.map((item) => item.sellerId).filter((value): value is string => value !== null))
  );

  const [followerCounts, itemCounts] = await Promise.all([
    prisma.follow.groupBy({
      by: ['followingId'],
      where: { followingId: { in: sellerIds } },
      _count: { followingId: true },
    }),
    prisma.item.groupBy({
      by: ['sellerId'],
      where: { sellerId: { in: sellerIds } },
      _count: { sellerId: true },
    }),
  ]);

  const followerMap = new Map<string, number>();
  for (const row of followerCounts) {
    followerMap.set(row.followingId, row._count.followingId);
  }

  const itemCountMap = new Map<string, number>();
  for (const row of itemCounts) {
    if (row.sellerId !== null) {
      itemCountMap.set(row.sellerId, row._count.sellerId);
    }
  }

  const rankedWithBreakdown = await Promise.all(
    items.map(async (item) => {
      const createdAtMs = item.createdAt.getTime();
      const ageHours = Math.max(0, (Date.now() - createdAtMs) / (1000 * 60 * 60));
      const ageInDays = ageHours / 24;

      const input = {
        tagWeight: item.tags.reduce((sum, relation) => sum + (tagWeights[relation.tag.name] ?? 0), 0),
        categoryWeight: item.category === null ? 0 : categoryWeights[item.category] ?? 0,
        designerWeight: item.sellerId === null ? 0 : designerWeights[item.sellerId] ?? 0,
        likes7d: item.likes.length,
        saves7d: item.saves.length,
        ageInHours: ageHours,
        ageInDays,
        followerCount: item.sellerId === null ? 0 : followerMap.get(item.sellerId) ?? 0,
        itemCount: item.sellerId === null ? 0 : itemCountMap.get(item.sellerId) ?? 0,
      };

      const breakdown = computeScore(input);

      await logRankingTelemetry(
        userId,
        item.id,
        breakdown,
        process.env.RANKING_DEBUG === 'true'
      );

      return {
        item,
        breakdown,
        score: breakdown.totalScore,
      };
    })
  );

  rankedWithBreakdown.sort((a, b) => b.score - a.score);

  const seenDesigners = new Set<string>();
  const diversityAdjusted = rankedWithBreakdown.map((entry) => {
    if (entry.item.sellerId === null) {
      return entry;
    }

    if (seenDesigners.has(entry.item.sellerId)) {
      const diversityPenalty = DIVERSITY.softRepeatPenalty;
      return {
        ...entry,
        score: entry.score - diversityPenalty,
        breakdown: {
          ...entry.breakdown,
          diversityPenalty,
          totalScore: entry.breakdown.totalScore - diversityPenalty,
        },
      };
    }

    seenDesigners.add(entry.item.sellerId);
    return entry;
  });

  diversityAdjusted.sort((a, b) => b.score - a.score);

  const rankedItems: ExploreScoredItem[] = diversityAdjusted.map((entry) => ({
    itemId: entry.item.id,
    score: entry.score,
    title: entry.item.title,
    category: entry.item.category,
    sellerId: entry.item.sellerId,
    createdAt: entry.item.createdAt,
  }));

  const breakdownByItemId = new Map<string, LayerBreakdown>();
  for (const entry of diversityAdjusted) {
    breakdownByItemId.set(entry.item.id, entry.breakdown);
  }

  const orderedIds = diversityAdjusted.map((entry) => entry.item.id);
  setSnapshot(userId, orderedIds);

  const ttlMs = 5 * 60 * 1000;

  return {
    rankedItems,
    breakdownByItemId,
    expiresAt: Date.now() + ttlMs,
  };
}

async function getOrBuildSnapshot(userId: string): Promise<RankedSnapshot> {
  const cachedIds = getSnapshot(userId);
  const cached = rankingDetailStore.get(userId);

  if (
    cachedIds !== null &&
    cached !== undefined &&
    Date.now() <= cached.expiresAt &&
    cachedIds.length === cached.rankedItems.length
  ) {
    return cached;
  }

  const built = await buildSnapshot(userId);
  rankingDetailStore.set(userId, built);
  return built;
}

export async function getRankedExplorePage(input: ExplorePageInput): Promise<ExplorePage> {
  const snapshot = await getOrBuildSnapshot(input.userId);

  let startIndex = 0;
  if (input.cursor !== undefined) {
    const cursorIndex = snapshot.rankedItems.findIndex((item) => item.itemId === input.cursor);
    startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  }

  const pageItems = snapshot.rankedItems.slice(startIndex, startIndex + input.limit);
  const nextCursor =
    startIndex + input.limit < snapshot.rankedItems.length
      ? pageItems[pageItems.length - 1]?.itemId ?? null
      : null;

  return {
    items: pageItems,
    nextCursor,
  };
}

export async function getExploreItemScoreBreakdown(
  userId: string,
  itemId: string
): Promise<LayerBreakdown | null> {
  const snapshot = await getOrBuildSnapshot(userId);
  return snapshot.breakdownByItemId.get(itemId) ?? null;
}
