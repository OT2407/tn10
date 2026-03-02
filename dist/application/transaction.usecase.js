"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = createTransaction;
exports.completeTransaction = completeTransaction;
exports.cancelTransaction = cancelTransaction;
const errors_1 = require("./errors");
const transactionService_1 = require("../services/transactionService");
async function createTransaction(input) {
    if (input.amount <= 0) {
        throw new errors_1.AppError(400, 'INVALID_AMOUNT', 'Amount must be positive');
    }
    if (input.buyerId === input.sellerId) {
        throw new errors_1.AppError(400, 'INVALID_PARTIES', 'Buyer and seller must be different');
    }
    return (0, transactionService_1.createTransactionRecord)(input);
}
async function completeTransaction(transactionId) {
    const tx = await (0, transactionService_1.getTransactionById)(transactionId);
    if (!tx) {
        throw new errors_1.AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
    }
    if (tx.status === 'cancelled') {
        throw new errors_1.AppError(409, 'INVALID_STATE', 'Cancelled transaction cannot be completed');
    }
    if (tx.status === 'completed') {
        return tx;
    }
    return (0, transactionService_1.updateTransactionStatus)(transactionId, 'completed');
}
async function cancelTransaction(transactionId) {
    const tx = await (0, transactionService_1.getTransactionById)(transactionId);
    if (!tx) {
        throw new errors_1.AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
    }
    if (tx.status === 'completed') {
        throw new errors_1.AppError(409, 'INVALID_STATE', 'Completed transaction cannot be cancelled');
    }
    if (tx.status === 'cancelled') {
        return tx;
    }
    return (0, transactionService_1.updateTransactionStatus)(transactionId, 'cancelled');
}
//# sourceMappingURL=transaction.usecase.js.map