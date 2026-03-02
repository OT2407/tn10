"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.listItemReviews = listItemReviews;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const prisma = new client_1.PrismaClient();
async function createReview(orderId, reviewerId, rating, comment) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new errors_1.AppError(422, 'INVALID_RATING', 'Rating must be between 1 and 5');
    }
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new errors_1.AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
        }
        if (order.status !== 'DELIVERED') {
            throw new errors_1.AppError(409, 'ORDER_NOT_DELIVERED', 'Review is allowed only after delivery');
        }
        const existing = await tx.review.findUnique({ where: { orderId } });
        if (existing) {
            throw new errors_1.AppError(409, 'REVIEW_ALREADY_EXISTS', 'Only one review is allowed per order');
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
async function listItemReviews(itemId) {
    return prisma.review.findMany({
        where: { itemId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
}
//# sourceMappingURL=reviewService.js.map