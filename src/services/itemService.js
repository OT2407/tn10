"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = createItem;
exports.getItem = getItem;
exports.listItems = listItems;
exports.updateItemCurrentHash = updateItemCurrentHash;
exports.deleteItem = deleteItem;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createItem(name) {
    const data = name === undefined ? {} : { name };
    return prisma.item.create({ data });
}
async function getItem(id) {
    return prisma.item.findUnique({ where: { id } });
}
async function listItems() {
    return prisma.item.findMany();
}
async function updateItemCurrentHash(id, currentHash) {
    return prisma.item.update({ where: { id }, data: { currentHash } });
}
async function deleteItem(id) {
    return prisma.item.delete({ where: { id } });
}
//# sourceMappingURL=itemService.js.map