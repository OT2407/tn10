import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';
import { applyFollowPreferenceBoost } from './intelligenceService';

const prisma = new PrismaClient();

interface FollowMutationResult {
  created: boolean;
}

export async function createFollow(followerId: string, followingId: string): Promise<FollowMutationResult> {
  if (followerId === followingId) {
    throw new AppError(400, 'INVALID_FOLLOW', 'User cannot follow self');
  }

  const followingUser = await prisma.user.findUnique({ where: { id: followingId } });
  if (!followingUser) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (existing) {
    return { created: false };
  }

  try {
    await prisma.follow.create({
      data: { followerId, followingId },
    });
  } catch {
    const raceExisting = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    if (raceExisting) {
      return { created: false };
    }
    throw new AppError(400, 'FOREIGN_KEY_VIOLATION', 'Invalid follow relation');
  }

  await applyFollowPreferenceBoost(followerId, followingId);
  return { created: true };
}

export async function deleteFollow(followerId: string, followingId: string): Promise<void> {
  await prisma.follow.deleteMany({
    where: { followerId, followingId },
  });
}
