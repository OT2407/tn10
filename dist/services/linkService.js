"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLink = createLink;
exports.findLinkByFreezeAndUrl = findLinkByFreezeAndUrl;
const prisma_1 = require("../infrastructure/prisma");
async function createLink(freezeId, url, note) {
    const data = note === undefined ? { freezeId, url } : { freezeId, url, note };
    return prisma_1.prisma.link.create({ data });
}
async function findLinkByFreezeAndUrl(freezeId, url) {
    return prisma_1.prisma.link.findFirst({
        where: { freezeId, url },
    });
}
//# sourceMappingURL=linkService.js.map