"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFreeze = createFreeze;
exports.getLatestFreeze = getLatestFreeze;
exports.listFreezes = listFreezes;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createFreeze(itemId, data) {
    return prisma.freeze.create({
        data: {
            itemId,
            ...data,
        },
    });
}
async function getLatestFreeze(itemId) {
    return prisma.freeze.findFirst({
        where: { itemId },
        orderBy: { createdAt: "desc" },
    });
}
async function listFreezes(itemId) {
    return prisma.freeze.findMany({
        where: { itemId },
        orderBy: { createdAt: "asc" },
    });
}
//# sourceMappingURL=freezeService.js.map