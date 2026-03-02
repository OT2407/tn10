import { prisma } from '../infrastructure/prisma';

export async function getItemWithFreezesForVerification(itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return null;
  }

  const freezes = await prisma.freeze.findMany({
    where: { itemId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  return { item, freezes };
}
