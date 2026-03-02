"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollow = createFollow;
exports.deleteFollow = deleteFollow;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const intelligenceService_1 = require("./intelligenceService");
const prisma = new client_1.PrismaClient();
async function createFollow(followerId, followingId) {
    if (followerId === followingId) {
        throw new errors_1.AppError(400, 'INVALID_FOLLOW', 'User cannot follow self');
    }
    const followingUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!followingUser) {
        throw new errors_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
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
    }
    catch {
        const raceExisting = await prisma.follow.findUnique({
            where: {
                followerId_followingId: { followerId, followingId },
            },
        });
        if (raceExisting) {
            return { created: false };
        }
        throw new errors_1.AppError(400, 'FOREIGN_KEY_VIOLATION', 'Invalid follow relation');
    }
    await (0, intelligenceService_1.applyFollowPreferenceBoost)(followerId, followingId);
    return { created: true };
}
async function deleteFollow(followerId, followingId) {
    await prisma.follow.deleteMany({
        where: { followerId, followingId },
    });
}
//# sourceMappingURL=followService.js.map