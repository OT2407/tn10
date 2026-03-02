import { prisma } from '../infrastructure/prisma';

export interface CreateTransactionInput {
  buyerId: string;
  sellerId: string;
  itemId: string;
  amount: number;
}

export async function createTransactionRecord(input: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      itemId: input.itemId,
      amount: input.amount,
      status: 'pending',
    },
  });
}

export async function getTransactionById(id: string) {
  return prisma.transaction.findUnique({ where: { id } });
}

export async function updateTransactionStatus(id: string, status: 'pending' | 'escrow' | 'completed' | 'cancelled') {
  return prisma.transaction.update({
    where: { id },
    data: { status },
  });
}
