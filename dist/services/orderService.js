"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderRecord = createOrderRecord;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
const prisma_1 = require("../infrastructure/prisma");
async function createOrderRecord(input) {
    return prisma_1.prisma.order.create({
        data: {
            buyerId: input.buyerId,
            sellerId: input.sellerId,
            itemId: input.itemId,
            amount: input.amount,
            status: 'pending',
        },
    });
}
async function getOrderById(id) {
    return prisma_1.prisma.order.findUnique({ where: { id } });
}
async function updateOrderStatus(id, status) {
    return prisma_1.prisma.order.update({
        where: { id },
        data: { status },
    });
}
//# sourceMappingURL=orderService.js.map