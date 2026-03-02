"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLike = createLike;
exports.deleteLike = deleteLike;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const intelligenceService_1 = require("./intelligenceService");
const preferences_1 = require("../ranking/preferences");
const prisma = new client_1.PrismaClient();
const MAX_LIKES_PER_MINUTE = 30;
async function createLike(userId, itemId) {
    const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { tags: { include: { tag: true } } },
    });
    if (!item) {
        throw new errors_1.AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }
    if (item.ownerId === userId || item.sellerId === userId) {
        throw new errors_1.AppError(400, 'OWN_ITEM_ENGAGEMENT_FORBIDDEN', 'Cannot like your own item');
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
        throw new errors_1.AppError(429, 'RATE_LIMITED', 'Like rate limit exceeded');
    }
    try {
        await prisma.like.create({
            data: { userId, itemId },
        });
    }
    catch {
        const raceExisting = await prisma.like.findUnique({
            where: {
                userId_itemId: { userId, itemId },
            },
        });
        if (raceExisting) {
            return { created: false };
        }
        throw new errors_1.AppError(400, 'FOREIGN_KEY_VIOLATION', 'Invalid like relation');
    }
    for (const relation of item.tags) {
        (0, preferences_1.updatePreference)(userId, 'tag', relation.tag.name, +1);
    }
    if (item.sellerId) {
        (0, preferences_1.updatePreference)(userId, 'designer', item.sellerId, +1);
    }
    await (0, intelligenceService_1.applyLikePreferenceBoost)(userId, itemId);
    return { created: true };
}
async function deleteLike(userId, itemId) {
    await prisma.like.deleteMany({
        where: { userId, itemId },
    });
}
//# sourceMappingURL=likeService.js.map