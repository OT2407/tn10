import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';
import { applyLikePreferenceBoost } from './intelligenceService';
import { updatePreference } from '../ranking/preferences';

const prisma = new PrismaClient();

interface LikeMutationResult {
  created: boolean;
}

const MAX_LIKES_PER_MINUTE = 30;

export async function createLike(userId: string, itemId: string): Promise<LikeMutationResult> {
  const item = await (prisma.item as any).findUnique({
    where: { id: itemId },
    include: { tags: { include: { tag: true } } },
  }) as any;
  if (!item) {
    throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
  }

  if (item.ownerId === userId || item.sellerId === userId) {
    throw new AppError(400, 'OWN_ITEM_ENGAGEMENT_FORBIDDEN', 'Cannot like your own item');
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });

  if (existing) {
    return { created: false };
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentLikeCount = await prisma.like.count({
    where: {
      userId,
      createdAt: { gte: oneMinuteAgo },
    },
  });

  if (recentLikeCount >= MAX_LIKES_PER_MINUTE) {
    throw new AppError(429, 'RATE_LIMITED', 'Like rate limit exceeded');
  }

  try {
    await prisma.like.create({
      data: { userId, itemId },
    });
  } catch {
    const raceExisting = await prisma.like.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });
    if (raceExisting) {
      return { created: false };
    }
    throw new AppError(400, 'FOREIGN_KEY_VIOLATION', 'Invalid like relation');
  }

  for (const relation of item.tags) {
    updatePreference(userId, 'tag', relation.tag.name, +1);
  }
  if (item.sellerId) {
    updatePreference(userId, 'designer', item.sellerId, +1);
  }

  await applyLikePreferenceBoost(userId, itemId);
  return { created: true };
}

export async function deleteLike(userId: string, itemId: string): Promise<void> {
  await prisma.like.deleteMany({
    where: { userId, itemId },
  });
}
