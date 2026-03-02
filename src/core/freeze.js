"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFreeze = createFreeze;
const client_1 = require("@prisma/client");
const hash_1 = require("./hash");
const prisma = new client_1.PrismaClient();
async function createFreeze(itemId, type, svg, metadata) {
    const previous = await prisma.freeze.findFirst({
        where: { itemId },
        orderBy: { createdAt: "desc" },
    });
    const parentHash = previous?.hash ?? null;
    const payload = {
        itemId,
        type,
        svg,
        metadata,
        parentHash,
    };
    const hash = (0, hash_1.generateHash)(JSON.stringify(payload));
    const freeze = await prisma.freeze.create({
        data: {
            itemId,
            type,
            svg,
            metadata: JSON.stringify(metadata),
            parentHash,
            hash,
        },
    });
    await prisma.item.update({
        where: { id: itemId },
        data: { currentHash: hash },
    });
    return freeze;
}
//# sourceMappingURL=freeze.js.map