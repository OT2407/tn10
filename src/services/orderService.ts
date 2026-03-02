import { prisma } from '../infrastructure/prisma';

export interface CreateOrderInput {
  buyerId: string;
  sellerId: string;
  itemId: string;
  amount: number;
}

export async function createOrderRecord(input: CreateOrderInput) {
  return prisma.order.create({
    data: {
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      itemId: input.itemId,
      amount: input.amount,
      status: 'pending',
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({ where: { id } });
}

export async function updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled') {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}
