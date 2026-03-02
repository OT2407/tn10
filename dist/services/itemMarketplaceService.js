"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMarketplaceItem = createMarketplaceItem;
exports.addTagsToItem = addTagsToItem;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const prisma = new client_1.PrismaClient();
async function createMarketplaceItem(input) {
    if (!Number.isInteger(input.price) || input.price <= 0) {
        throw new errors_1.AppError(422, 'INVALID_PRICE', 'Price must be a positive integer');
    }
    if (input.collaborationId) {
        const collaboration = await prisma.collaboration.findUnique({ where: { id: input.collaborationId } });
        if (!collaboration) {
            throw new errors_1.AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
        }
        if (collaboration.status !== 'ACTIVE') {
            throw new errors_1.AppError(409, 'COLLABORATION_NOT_ACTIVE', 'Only ACTIVE collaboration can publish items');
        }
    }
    return prisma.item.create({
        data: {
            ownerId: input.sellerId,
            sellerId: input.sellerId,
            name: input.title,
            title: input.title,
            description: input.description,
            category: input.category,
            price: input.price,
            previewUrl: input.previewUrl,
            deliveryType: input.deliveryType,
            metadata: input.metadata,
            ...(input.brandId === undefined ? {} : { brandId: input.brandId }),
            ...(input.collaborationId === undefined ? {} : { collaborationId: input.collaborationId }),
            originalityStatus: input.originalityStatus ?? 'SELF_DECLARED',
        },
    });
}
async function addTagsToItem(itemId, tagNames) {
    return prisma.$transaction(async (tx) => {
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) {
            throw new errors_1.AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
        }
        for (const rawName of tagNames) {
            const name = rawName.trim().toLowerCase();
            if (name.length === 0) {
                continue;
            }
            const tag = await tx.tag.upsert({
                where: { name },
                update: {},
                create: { name },
            });
            await tx.itemTag.upsert({
                where: { itemId_tagId: { itemId, tagId: tag.id } },
                update: {},
                create: { itemId, tagId: tag.id },
            });
        }
        return tx.item.findUnique({
            where: { id: itemId },
            include: {
                tags: {
                    include: { tag: true },
                },
            },
        });
    });
}
//# sourceMappingURL=itemMarketplaceService.js.map