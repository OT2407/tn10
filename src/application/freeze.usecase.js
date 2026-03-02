"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFreezes = void 0;
exports.freezeItem = freezeItem;
const freezeService_1 = require("../services/freezeService");
Object.defineProperty(exports, "listFreezes", { enumerable: true, get: function () { return freezeService_1.listFreezes; } });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function freezeItem(itemId, input) {
    // enforce parentHash chain integrity: if parentHash provided, ensure it exists on latest freeze
    if (input.parentHash) {
        const latest = await prisma.freeze.findFirst({ where: { itemId }, orderBy: { createdAt: 'desc' } });
        if (!latest || latest.hash !== input.parentHash) {
            const err = new Error('Parent hash mismatch');
            err.code = 'PARENT_HASH_MISMATCH';
            throw err;
        }
    }
    // create freeze and update item.currentHash atomically
    const freeze = await (0, freezeService_1.createFreeze)(itemId, {
        type: input.type,
        svg: input.svg,
        metadata: input.metadata,
        ...(input.parentHash === undefined ? {} : { parentHash: input.parentHash }),
        hash: input.hash
    });
    await prisma.item.update({ where: { id: itemId }, data: { currentHash: input.hash } });
    return freeze;
}
//# sourceMappingURL=freeze.usecase.js.map