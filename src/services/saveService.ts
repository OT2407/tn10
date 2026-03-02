import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';
import { applySavePreferenceBoost } from './intelligenceService';

const prisma = new PrismaClient();

interface SaveMutationResult {
  created: boolean;
}

export async function createSave(userId: string, itemId: string): Promise<SaveMutationResult> {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
  }

  const existing = await prisma.save.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });

  if (existing) {
    return { created: false };
  }

  try {
    await prisma.save.create({
      data: { userId, itemId },
    });
  } catch {
    const raceExisting = await prisma.save.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });
    if (raceExisting) {
      return { created: false };
    }
    throw new AppError(400, 'FOREIGN_KEY_VIOLATION', 'Invalid save relation');
  }

  await applySavePreferenceBoost(userId, itemId);
  return { created: true };
}

export async function deleteSave(userId: string, itemId: string): Promise<void> {
  await prisma.save.deleteMany({
    where: { userId, itemId },
  });
}
