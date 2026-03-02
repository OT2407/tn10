"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWallet = createWallet;
exports.getWallet = getWallet;
exports.listTransactions = listTransactions;
exports.listWalletTransactions = listWalletTransactions;
exports.listWalletTransactionsPaginated = listWalletTransactionsPaginated;
exports.adjustBalance = adjustBalance;
exports.creditWallet = creditWallet;
exports.debitWallet = debitWallet;
exports.distributeRevenueForItemSale = distributeRevenueForItemSale;
const prisma_1 = require("../infrastructure/prisma");
const errors_1 = require("../application/errors");
function assertPositiveAmount(amount) {
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new errors_1.AppError(400, 'INVALID_AMOUNT', 'Amount must be a positive integer');
    }
}
async function createWallet(ownerId) {
    return prisma_1.prisma.wallet.create({
        data: {
            ownerId,
            balance: 0,
            version: 0,
        },
    });
}
async function getWallet(ownerId) {
    return prisma_1.prisma.wallet.findUnique({
        where: { ownerId },
    });
}
async function listTransactions(walletId, limit, cursor) {
    const wallet = await prisma_1.prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
        throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
    }
    const transactions = await prisma_1.prisma.walletTransaction.findMany({
        where: { walletId },
        ...(cursor === undefined ? {} : { cursor: { id: cursor }, skip: 1 }),
        take: limit + 1,
        orderBy: { id: 'asc' },
    });
    const hasMore = transactions.length > limit;
    const page = hasMore ? transactions.slice(0, limit) : transactions;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;
    return { transactions: page, nextCursor };
}
async function listWalletTransactions(ownerId) {
    const wallet = await prisma_1.prisma.wallet.findUnique({ where: { ownerId } });
    if (!wallet) {
        throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
    }
    return prisma_1.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
}
async function listWalletTransactionsPaginated(ownerId, limit, cursor) {
    const wallet = await prisma_1.prisma.wallet.findUnique({ where: { ownerId } });
    if (!wallet) {
        throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
    }
    return listTransactions(wallet.id, limit, cursor);
}
async function adjustBalance(walletId, amount, type, referenceId) {
    assertPositiveAmount(amount);
    return prisma_1.prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
        if (!wallet) {
            throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
        }
        if (referenceId !== undefined) {
            const existing = await tx.walletTransaction.findFirst({
                where: { walletId: wallet.id, referenceId },
            });
            if (existing) {
                return wallet;
            }
        }
        const delta = type === 'DEBIT' ? -amount : amount;
        if (wallet.balance + delta < 0) {
            throw new errors_1.AppError(409, 'INSUFFICIENT_FUNDS', 'Insufficient wallet balance');
        }
        const update = await tx.wallet.updateMany({
            where: {
                id: wallet.id,
                version: wallet.version,
            },
            data: {
                balance: wallet.balance + delta,
                version: { increment: 1 },
            },
        });
        if (update.count === 0) {
            throw new errors_1.AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
        }
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type,
                amount: delta,
                reference: referenceId ?? `wallet:${type.toLowerCase()}`,
                ...(referenceId === undefined ? {} : { referenceId }),
            },
        });
        return tx.wallet.findUnique({ where: { id: wallet.id } });
    });
}
async function creditWallet(ownerId, amount, reference) {
    assertPositiveAmount(amount);
    return prisma_1.prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { ownerId } });
        if (!wallet) {
            throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
        }
        const existing = await tx.walletTransaction.findFirst({
            where: { walletId: wallet.id, type: 'CREDIT', reference },
        });
        if (existing) {
            return wallet;
        }
        const update = await tx.wallet.updateMany({
            where: {
                id: wallet.id,
                version: wallet.version,
            },
            data: {
                balance: wallet.balance + amount,
                version: { increment: 1 },
            },
        });
        if (update.count === 0) {
            throw new errors_1.AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
        }
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'CREDIT',
                amount,
                reference,
                referenceId: reference,
            },
        });
        return tx.wallet.findUnique({ where: { id: wallet.id } });
    });
}
async function debitWallet(ownerId, amount, reference) {
    assertPositiveAmount(amount);
    return prisma_1.prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { ownerId } });
        if (!wallet) {
            throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
        }
        const existing = await tx.walletTransaction.findFirst({
            where: { walletId: wallet.id, type: 'DEBIT', reference },
        });
        if (existing) {
            return wallet;
        }
        if (wallet.balance < amount) {
            throw new errors_1.AppError(409, 'INSUFFICIENT_FUNDS', 'Insufficient wallet balance');
        }
        const update = await tx.wallet.updateMany({
            where: {
                id: wallet.id,
                version: wallet.version,
            },
            data: {
                balance: wallet.balance - amount,
                version: { increment: 1 },
            },
        });
        if (update.count === 0) {
            throw new errors_1.AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
        }
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'DEBIT',
                amount: -amount,
                reference,
                referenceId: reference,
            },
        });
        return tx.wallet.findUnique({ where: { id: wallet.id } });
    });
}
async function ensureWalletForOwnerTx(tx, ownerId) {
    const existing = await tx.wallet.findUnique({ where: { ownerId } });
    if (existing) {
        return existing;
    }
    return tx.wallet.create({
        data: {
            ownerId,
            balance: 0,
            version: 0,
        },
    });
}
async function creditOwnerTx(tx, ownerId, amount, reference) {
    const wallet = await ensureWalletForOwnerTx(tx, ownerId);
    await tx.wallet.update({
        where: { id: wallet.id },
        data: {
            balance: { increment: amount },
            version: { increment: 1 },
        },
    });
    await tx.walletTransaction.create({
        data: {
            walletId: wallet.id,
            type: 'CREDIT',
            amount,
            reference,
            referenceId: reference,
        },
    });
}
async function distributeRevenueForItemSale(itemId, sellerId, amount, reference) {
    assertPositiveAmount(amount);
    await prisma_1.prisma.$transaction(async (tx) => {
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) {
            throw new errors_1.AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
        }
        if (!item.collaborationId) {
            await creditOwnerTx(tx, sellerId, amount, reference);
            return;
        }
        const collaboration = await tx.collaboration.findUnique({
            where: { id: item.collaborationId },
            include: { members: true },
        });
        if (!collaboration || collaboration.members.length === 0) {
            await creditOwnerTx(tx, sellerId, amount, reference);
            return;
        }
        const totalPercentage = collaboration.members.reduce((sum, member) => sum + member.percentage, 0);
        if (totalPercentage !== 100) {
            throw new errors_1.AppError(409, 'INVALID_SPLIT', 'Collaboration split must total 100');
        }
        let distributed = 0;
        for (const [index, member] of collaboration.members.entries()) {
            const share = index === collaboration.members.length - 1
                ? amount - distributed
                : Math.floor((amount * member.percentage) / 100);
            distributed += share;
            await creditOwnerTx(tx, member.userId, share, `${reference}:member:${member.userId}`);
        }
    });
}
//# sourceMappingURL=walletService.js.map