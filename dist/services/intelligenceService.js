"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyLikePreferenceBoost = applyLikePreferenceBoost;
exports.applySavePreferenceBoost = applySavePreferenceBoost;
exports.applyFollowPreferenceBoost = applyFollowPreferenceBoost;
exports.applyPurchasePreferenceBoost = applyPurchasePreferenceBoost;
exports.getRankedExplorePage = getRankedExplorePage;
exports.getExploreItemScoreBreakdown = getExploreItemScoreBreakdown;
const client_1 = require("@prisma/client");
const env_1 = require("../infrastructure/env");
const prisma = new client_1.PrismaClient();
const LIKE_TAG_WEIGHT = 1;
const SAVE_TAG_WEIGHT = 3;
const FOLLOW_DESIGNER_WEIGHT = 2;
const PURCHASE_CATEGORY_WEIGHT = 4;
const PERSONALIZATION_TAG_MULTIPLIER = 1.0;
const PERSONALIZATION_CATEGORY_MULTIPLIER = 0.8;
const PERSONALIZATION_DESIGNER_MULTIPLIER = 1.2;
const ENGAGEMENT_LIKES_WEIGHT = 1.0;
const ENGAGEMENT_SAVES_WEIGHT = 1.5;
const ENGAGEMENT_AGE_DECAY_FACTOR = 0.15;
const FRESHNESS_HALF_LIFE_HOURS = 72;
const EXPLORATION_NOISE_MAX = 0.2;
const SNAPSHOT_TTL_MS = 5 * 60 * 1000;
const rankingCache = new Map();
function normalizeWeightMap(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {};
    }
    const output = {};
    for (const [key, raw] of Object.entries(value)) {
        if (typeof raw === 'number' && Number.isFinite(raw)) {
            output[key] = raw;
        }
    }
    return output;
}
function mergeWeight(base, key, increment) {
    return {
        ...base,
        [key]: (base[key] ?? 0) + increment,
    };
}
async function getOrCreatePreferenceTx(tx, userId) {
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
async function applyLikePreferenceBoost(userId, itemId) {
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
    rankingCache.delete(userId);
}
async function applySavePreferenceBoost(userId, itemId) {
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
    rankingCache.delete(userId);
}
async function applyFollowPreferenceBoost(userId, followingId) {
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
    rankingCache.delete(userId);
}
async function applyPurchasePreferenceBoost(userId, itemId) {
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
    rankingCache.delete(userId);
}
function decayByAge(createdAt, factor) {
    const ageDays = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return Math.exp(-factor * ageDays);
}
function calculateFreshnessLayer(createdAt) {
    const ageHours = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
    return Math.exp((-Math.log(2) * ageHours) / FRESHNESS_HALF_LIFE_HOURS);
}
function hashNoise(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) % 1000003;
    }
    return (hash / 1000003) * EXPLORATION_NOISE_MAX;
}
function computeItemScore(input) {
    const tagWeightRaw = input.item.tags.reduce((sum, relation) => sum + (input.weights.tagWeights[relation.tag.name] ?? 0), 0);
    const categoryWeightRaw = input.item.category === null ? 0 : input.weights.categoryWeights[input.item.category] ?? 0;
    const designerWeightRaw = input.item.sellerId === null ? 0 : input.weights.designerWeights[input.item.sellerId] ?? 0;
    const tagWeight = tagWeightRaw * PERSONALIZATION_TAG_MULTIPLIER;
    const categoryWeight = categoryWeightRaw * PERSONALIZATION_CATEGORY_MULTIPLIER;
    const designerWeight = designerWeightRaw * PERSONALIZATION_DESIGNER_MULTIPLIER;
    const personalizationLayer = tagWeight + categoryWeight + designerWeight;
    const likesScore = input.item.likes.reduce((sum, like) => sum + ENGAGEMENT_LIKES_WEIGHT * decayByAge(like.createdAt, ENGAGEMENT_AGE_DECAY_FACTOR), 0);
    const savesScore = input.item.saves.reduce((sum, save) => sum + ENGAGEMENT_SAVES_WEIGHT * decayByAge(save.createdAt, ENGAGEMENT_AGE_DECAY_FACTOR), 0);
    const engagementQualityLayer = likesScore + savesScore;
    const freshnessLayer = calculateFreshnessLayer(input.item.createdAt);
    const baseCreatorGrowth = 1 / Math.log(2 + Math.max(0, input.followerCount));
    const emergingBoost = input.followerCount < 50 && input.sellerItemCount < 5 ? 1.5 : 0;
    const creatorGrowthLayer = baseCreatorGrowth + emergingBoost;
    const explorationNoise = hashNoise(`${input.userId}:${input.item.id}:${input.snapshotBucket}`);
    const totalScore = personalizationLayer +
        engagementQualityLayer +
        freshnessLayer +
        creatorGrowthLayer +
        explorationNoise;
    return {
        personalizationLayer,
        engagementQualityLayer,
        freshnessLayer,
        creatorGrowthLayer,
        explorationNoise,
        totalScore,
        tagWeight,
        categoryWeight,
        designerWeight,
        trendingScore: likesScore + savesScore,
        recencyWeight: freshnessLayer,
    };
}
async function buildSnapshot(userId) {
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
                select: { createdAt: true },
            },
            saves: {
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { createdAt: true },
            },
        },
    });
    const sellerIds = Array.from(new Set(items.map((item) => item.sellerId).filter((value) => value !== null)));
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
    const followerMap = new Map();
    for (const row of followerCounts) {
        followerMap.set(row.followingId, row._count.followingId);
    }
    const itemCountMap = new Map();
    for (const row of itemCounts) {
        if (row.sellerId !== null) {
            itemCountMap.set(row.sellerId, row._count.sellerId);
        }
    }
    const snapshotBucket = `${Math.floor(Date.now() / SNAPSHOT_TTL_MS)}`;
    const rankedItems = [];
    const breakdownByItemId = new Map();
    for (const item of items) {
        const breakdown = computeItemScore({
            item,
            weights: { tagWeights, categoryWeights, designerWeights },
            followerCount: item.sellerId === null ? 0 : followerMap.get(item.sellerId) ?? 0,
            sellerItemCount: item.sellerId === null ? 0 : itemCountMap.get(item.sellerId) ?? 0,
            snapshotBucket,
            userId,
        });
        breakdownByItemId.set(item.id, breakdown);
        rankedItems.push({
            itemId: item.id,
            score: breakdown.totalScore,
            title: item.title,
            category: item.category,
            sellerId: item.sellerId,
            createdAt: item.createdAt,
        });
    }
    rankedItems.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.itemId.localeCompare(b.itemId);
    });
    if ((0, env_1.getEnv)().RANKING_TELEMETRY_ENABLED) {
        const telemetryRows = [];
        for (const entry of rankedItems) {
            const breakdown = breakdownByItemId.get(entry.itemId);
            if (!breakdown) {
                continue;
            }
            telemetryRows.push({
                itemId: entry.itemId,
                userId,
                totalScore: entry.score,
                layerBreakdown: breakdown,
            });
        }
        if (telemetryRows.length > 0) {
            await prisma.rankingTelemetry.createMany({ data: telemetryRows });
        }
    }
    return {
        createdAt: Date.now(),
        rankedItems,
        breakdownByItemId,
    };
}
async function getSnapshot(userId) {
    const cached = rankingCache.get(userId);
    if (cached && Date.now() - cached.createdAt < SNAPSHOT_TTL_MS) {
        return cached;
    }
    const fresh = await buildSnapshot(userId);
    rankingCache.set(userId, fresh);
    return fresh;
}
async function getRankedExplorePage(input) {
    const snapshot = await getSnapshot(input.userId);
    let startIndex = 0;
    if (input.cursor !== undefined) {
        const cursorIndex = snapshot.rankedItems.findIndex((item) => item.itemId === input.cursor);
        startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    }
    const pageItems = snapshot.rankedItems.slice(startIndex, startIndex + input.limit);
    const nextCursor = startIndex + input.limit < snapshot.rankedItems.length
        ? pageItems[pageItems.length - 1]?.itemId ?? null
        : null;
    return {
        items: pageItems,
        nextCursor,
    };
}
async function getExploreItemScoreBreakdown(userId, itemId) {
    const snapshot = await getSnapshot(userId);
    return snapshot.breakdownByItemId.get(itemId) ?? null;
}
//# sourceMappingURL=intelligenceService.js.map