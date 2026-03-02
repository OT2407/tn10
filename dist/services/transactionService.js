"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionRecord = createTransactionRecord;
exports.getTransactionById = getTransactionById;
exports.updateTransactionStatus = updateTransactionStatus;
const prisma_1 = require("../infrastructure/prisma");
async function createTransactionRecord(input) {
    return prisma_1.prisma.transaction.create({
        data: {
            buyerId: input.buyerId,
            sellerId: input.sellerId,
            itemId: input.itemId,
            amount: input.amount,
            status: 'pending',
        },
    });
}
async function getTransactionById(id) {
    return prisma_1.prisma.transaction.findUnique({ where: { id } });
}
async function updateTransactionStatus(id, status) {
    return prisma_1.prisma.transaction.update({
        where: { id },
        data: { status },
    });
}
//# sourceMappingURL=transactionService.js.map