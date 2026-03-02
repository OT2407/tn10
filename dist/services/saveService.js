"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSave = createSave;
exports.deleteSave = deleteSave;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const intelligenceService_1 = require("./intelligenceService");
const prisma = new client_1.PrismaClient();
async function createSave(userId, itemId) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
        throw new errors_1.AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }
    const existing = await prisma.save.findUnique({
        where: {
            userId_itemId: { userId, itemId },
        },
    });
    if (existing) {
        return { created: false };
    }
    try {
        await prisma.save.create({
            data: { userId, itemId },
        });
    }
    catch {
        const raceExisting = await prisma.save.findUnique({
            where: {
                userId_itemId: { userId, itemId },
            },
        });
        if (raceExisting) {
            return { created: false };
        }
        throw new errors_1.AppError(400, 'FOREIGN_KEY_VIOLATION', 'Invalid save relation');
    }
    await (0, intelligenceService_1.applySavePreferenceBoost)(userId, itemId);
    return { created: true };
}
async function deleteSave(userId, itemId) {
    await prisma.save.deleteMany({
        where: { userId, itemId },
    });
}
//# sourceMappingURL=saveService.js.map