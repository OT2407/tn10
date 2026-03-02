"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const item = await prisma.item.create({ data: {} });
    console.log("ITEM_CREATED:", item.id);
    await prisma.$disconnect();
}
main().catch(async (e) => {
    console.error("ERROR:", e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=createItem.js.map