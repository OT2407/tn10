"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemWithFreezesForVerification = getItemWithFreezesForVerification;
const prisma_1 = require("../infrastructure/prisma");
async function getItemWithFreezesForVerification(itemId) {
    const item = await prisma_1.prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
        return null;
    }
    const freezes = await prisma_1.prisma.freeze.findMany({
        where: { itemId },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return { item, freezes };
}
//# sourceMappingURL=verifierService.js.map