"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLink = createLink;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createLink(freezeId, url, note) {
    const data = note === undefined ? { freezeId, url } : { freezeId, url, note };
    return prisma.link.create({ data });
}
//# sourceMappingURL=linkService.js.map