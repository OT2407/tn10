"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.completeOrder = completeOrder;
exports.cancelOrder = cancelOrder;
exports.createOrderPaymentIntent = createOrderPaymentIntent;
const errors_1 = require("./errors");
const orderService_1 = require("../services/orderService");
const paymentPlaceholderAdapter_1 = require("../services/paymentPlaceholderAdapter");
const paymentIntentService_1 = require("../services/paymentIntentService");
const prisma_1 = require("../infrastructure/prisma");
const walletService_1 = require("../services/walletService");
const intelligenceService_1 = require("../services/intelligenceService");
function getWalletDiscountPercent() {
    const raw = process.env.WALLET_DISCOUNT_PERCENT;
    if (!raw) {
        return 0;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return 0;
    }
    return Math.min(parsed, 100);
}
async function createOrder(input) {
    if (input.amount <= 0) {
        throw new errors_1.AppError(400, 'INVALID_AMOUNT', 'Amount must be positive');
    }
    if (input.buyerId === input.sellerId) {
        throw new errors_1.AppError(400, 'INVALID_PARTIES', 'Buyer and seller must be different');
    }
    const discountPercent = getWalletDiscountPercent();
    const discountedAmount = input.paymentWithWallet === undefined
        ? input.amount
        : Math.max(0, Math.floor(input.amount - (input.amount * discountPercent) / 100));
    return prisma_1.prisma.$transaction(async (tx) => {
        if (input.paymentWithWallet !== undefined) {
            const walletAmount = input.paymentWithWallet.amount;
            if (!Number.isInteger(walletAmount) || walletAmount <= 0) {
                throw new errors_1.AppError(400, 'INVALID_AMOUNT', 'Wallet payment amount must be a positive integer');
            }
            if (walletAmount > discountedAmount) {
                throw new errors_1.AppError(400, 'INVALID_AMOUNT', 'Wallet payment exceeds order amount');
            }
            const wallet = await tx.wallet.findUnique({ where: { ownerId: input.buyerId } });
            if (!wallet) {
                throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
            }
            if (wallet.balance < walletAmount) {
                throw new errors_1.AppError(409, 'INSUFFICIENT_FUNDS', 'Insufficient wallet balance');
            }
            const updated = await tx.wallet.updateMany({
                where: { id: wallet.id, version: wallet.version },
                data: {
                    balance: wallet.balance - walletAmount,
                    version: { increment: 1 },
                },
            });
            if (updated.count === 0) {
                throw new errors_1.AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
            }
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'DEBIT',
                    amount: -walletAmount,
                    reference: `order:${input.itemId}`,
                },
            });
        }
        return tx.order.create({
            data: {
                buyerId: input.buyerId,
                sellerId: input.sellerId,
                itemId: input.itemId,
                amount: discountedAmount,
                status: 'pending',
            },
        });
    });
}
async function completeOrder(orderId) {
    const order = await (0, orderService_1.getOrderById)(orderId);
    if (!order) {
        throw new errors_1.AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }
    if (order.status === 'cancelled') {
        throw new errors_1.AppError(409, 'INVALID_STATE', 'Cancelled order cannot be completed');
    }
    if (order.status === 'completed') {
        return order;
    }
    const completed = await (0, orderService_1.updateOrderStatus)(orderId, 'completed');
    await (0, walletService_1.distributeRevenueForItemSale)(completed.itemId, completed.sellerId, completed.amount, `order:complete:${completed.id}`);
    await (0, intelligenceService_1.applyPurchasePreferenceBoost)(completed.buyerId, completed.itemId);
    return completed;
}
async function cancelOrder(orderId) {
    const order = await (0, orderService_1.getOrderById)(orderId);
    if (!order) {
        throw new errors_1.AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }
    if (order.status === 'completed') {
        throw new errors_1.AppError(409, 'INVALID_STATE', 'Completed order cannot be cancelled');
    }
    if (order.status === 'cancelled') {
        return order;
    }
    return (0, orderService_1.updateOrderStatus)(orderId, 'cancelled');
}
async function createOrderPaymentIntent(orderId, currency = 'TRY') {
    const order = await (0, orderService_1.getOrderById)(orderId);
    if (!order) {
        throw new errors_1.AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }
    const placeholder = await (0, paymentPlaceholderAdapter_1.createPlaceholderPaymentIntent)({
        orderId,
        amount: order.amount,
        currency,
    });
    return (0, paymentIntentService_1.createPaymentIntentRecord)({
        orderId,
        amount: order.amount,
        currency,
        status: placeholder.status,
        provider: placeholder.provider,
        externalRef: placeholder.externalRef,
    });
}
//# sourceMappingURL=order.usecase.js.map