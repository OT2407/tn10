"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = createItem;
exports.getItem = getItem;
exports.updateItemVersion = updateItemVersion;
exports.listItems = listItems;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const prisma = new client_1.PrismaClient();
async function createItem(ownerId, name) {
    const data = name === undefined ? { ownerId, sellerId: ownerId } : { ownerId, sellerId: ownerId, name };
    return prisma.item.create({
        data,
    });
}
async function getItem(id) {
    return prisma.item.findUnique({ where: { id } });
}
async function updateItemVersion(id, version, data) {
    return prisma.$transaction(async (tx) => {
        const item = await tx.item.findUnique({ where: { id } });
        if (!item)
            throw new errors_1.AppError(404, 'NOT_FOUND', 'Item not found');
        if (item.version !== version) {
            throw new errors_1.AppError(409, 'STALE_VERSION', 'Version mismatch');
        }
        return tx.item.update({
            where: { id },
            data: {
                ...data,
                version: item.version + 1,
            },
        });
    });
}
async function listItems(ownerId, limit = 20, cursor) {
    const args = {
        where: { ownerId },
        take: limit,
        orderBy: { id: 'asc' },
    };
    if (cursor !== undefined) {
        args.cursor = { id: cursor };
        args.skip = 1;
    }
    return prisma.item.findMany(args);
}
//# sourceMappingURL=itemService.js.map