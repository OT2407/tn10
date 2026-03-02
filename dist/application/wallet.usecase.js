"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOwnerWallet = createOwnerWallet;
exports.getWalletBalance = getWalletBalance;
exports.getWalletTransactionHistory = getWalletTransactionHistory;
exports.getWalletTransactionsByWalletId = getWalletTransactionsByWalletId;
exports.adminAdjustWallet = adminAdjustWallet;
exports.creditWalletBalance = creditWalletBalance;
exports.debitWalletBalance = debitWalletBalance;
const errors_1 = require("./errors");
const walletService_1 = require("../services/walletService");
async function createOwnerWallet(ownerId) {
    const existing = await (0, walletService_1.getWallet)(ownerId);
    if (existing) {
        return existing;
    }
    return (0, walletService_1.createWallet)(ownerId);
}
async function getWalletBalance(ownerId) {
    const wallet = await (0, walletService_1.getWallet)(ownerId);
    if (!wallet) {
        throw new errors_1.AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
    }
    return {
        ownerId,
        walletId: wallet.id,
        balance: wallet.balance,
        version: wallet.version,
    };
}
async function getWalletTransactionHistory(ownerId, limit = 20, cursor) {
    return (0, walletService_1.listWalletTransactionsPaginated)(ownerId, limit, cursor);
}
async function getWalletTransactionsByWalletId(walletId, limit = 20, cursor) {
    return (0, walletService_1.listTransactions)(walletId, limit, cursor);
}
async function adminAdjustWallet(ownerId, amount, type, referenceId) {
    let wallet = await (0, walletService_1.getWallet)(ownerId);
    if (!wallet) {
        wallet = await (0, walletService_1.createWallet)(ownerId);
    }
    const updated = await (0, walletService_1.adjustBalance)(wallet.id, amount, type, referenceId);
    if (!updated) {
        throw new errors_1.AppError(500, 'WALLET_UPDATE_FAILED', 'Failed to adjust wallet');
    }
    return updated;
}
async function creditWalletBalance(ownerId, amount, reference) {
    const existing = await (0, walletService_1.getWallet)(ownerId);
    if (!existing) {
        await (0, walletService_1.createWallet)(ownerId);
    }
    const wallet = await (0, walletService_1.creditWallet)(ownerId, amount, reference);
    if (!wallet) {
        throw new errors_1.AppError(500, 'WALLET_UPDATE_FAILED', 'Failed to credit wallet');
    }
    return wallet;
}
async function debitWalletBalance(ownerId, amount, reference) {
    const wallet = await (0, walletService_1.debitWallet)(ownerId, amount, reference);
    if (!wallet) {
        throw new errors_1.AppError(500, 'WALLET_UPDATE_FAILED', 'Failed to debit wallet');
    }
    return wallet;
}
//# sourceMappingURL=wallet.usecase.js.map