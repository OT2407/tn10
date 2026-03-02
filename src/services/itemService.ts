import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';

const prisma = new PrismaClient();

export async function createItem(ownerId: string, name?: string) {
  const data = name === undefined ? { ownerId, sellerId: ownerId } : { ownerId, sellerId: ownerId, name };
  return prisma.item.create({
    data,
  });
}

export async function getItem(id: string) {
  return prisma.item.findUnique({ where: { id } });
}

export async function updateItemVersion(
  id: string,
  version: number,
  data: { name?: string }
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id } });
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Item not found');

    if (item.version !== version) {
      throw new AppError(409, 'STALE_VERSION', 'Version mismatch');
    }

    return tx.item.update({
      where: { id },
      data: {
        ...data,
        version: item.version + 1,
      },
    });
  });
}

export async function listItems(ownerId: string, limit = 20, cursor?: string) {
  const args: Prisma.ItemFindManyArgs = {
    where: { ownerId },
    take: limit,
    orderBy: { id: 'asc' },
  };
  if (cursor !== undefined) {
    args.cursor = { id: cursor };
    args.skip = 1;
  }
  return prisma.item.findMany(args);
}
