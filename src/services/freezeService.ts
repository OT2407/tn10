import { prisma } from '../infrastructure/prisma';

export interface FreezeCreateData {
  type: string;
  svg: string;
  metadata: string;
  parentHash?: string | null;
  hash: string;
}

export async function createFreeze(itemId: string, data: FreezeCreateData) {
  return prisma.freeze.create({
    data: {
      itemId,
      ...data,
    },
  });
}

export async function getLatestFreeze(itemId: string) {
  return prisma.freeze.findFirst({
    where: { itemId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listFreezes(itemId: string) {
  return prisma.freeze.findMany({
    where: { itemId },
    orderBy: { createdAt: 'asc' },
  });
}

export interface FreezeCursorPaginationInput {
  itemId: string;
  cursor?: string;
  limit: number;
}

export async function listFreezesPaginated(input: FreezeCursorPaginationInput) {
  const freezes = await prisma.freeze.findMany({
    where: { itemId: input.itemId },
    ...(input.cursor === undefined ? {} : { cursor: { id: input.cursor }, skip: 1 }),
    take: input.limit + 1,
    orderBy: { id: 'asc' },
  });

  const hasMore = freezes.length > input.limit;
  const pageFreezes = hasMore ? freezes.slice(0, input.limit) : freezes;
  const nextCursor = hasMore ? pageFreezes[pageFreezes.length - 1]?.id ?? null : null;

  return {
    freezes: pageFreezes,
    nextCursor,
  };
}
