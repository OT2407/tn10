import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';

const prisma = new PrismaClient();

export async function createReview(orderId: string, reviewerId: string, rating: number, comment: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError(422, 'INVALID_RATING', 'Rating must be between 1 and 5');
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }
    if (order.status !== 'DELIVERED') {
      throw new AppError(409, 'ORDER_NOT_DELIVERED', 'Review is allowed only after delivery');
    }

    const existing = await tx.review.findUnique({ where: { orderId } });
    if (existing) {
      throw new AppError(409, 'REVIEW_ALREADY_EXISTS', 'Only one review is allowed per order');
    }

    return tx.review.create({
      data: {
        orderId,
        itemId: order.itemId,
        reviewerId,
        rating,
        comment,
      },
    });
  });
}

export async function listItemReviews(itemId: string) {
  return prisma.review.findMany({
    where: { itemId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}
