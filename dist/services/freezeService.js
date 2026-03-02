"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFreeze = createFreeze;
exports.getLatestFreeze = getLatestFreeze;
exports.listFreezes = listFreezes;
exports.listFreezesPaginated = listFreezesPaginated;
const prisma_1 = require("../infrastructure/prisma");
async function createFreeze(itemId, data) {
    return prisma_1.prisma.freeze.create({
        data: {
            itemId,
            ...data,
        },
    });
}
async function getLatestFreeze(itemId) {
    return prisma_1.prisma.freeze.findFirst({
        where: { itemId },
        orderBy: { createdAt: 'desc' },
    });
}
async function listFreezes(itemId) {
    return prisma_1.prisma.freeze.findMany({
        where: { itemId },
        orderBy: { createdAt: 'asc' },
    });
}
async function listFreezesPaginated(input) {
    const freezes = await prisma_1.prisma.freeze.findMany({
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
//# sourceMappingURL=freezeService.js.map