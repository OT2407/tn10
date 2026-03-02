"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holdFunds = holdFunds;
exports.releaseEscrow = releaseEscrow;
exports.addEscrowMilestone = addEscrowMilestone;
exports.releaseMilestone = releaseMilestone;
exports.getEscrowDetailsByTransaction = getEscrowDetailsByTransaction;
const errors_1 = require("./errors");
const transactionService_1 = require("../services/transactionService");
const escrowService_1 = require("../services/escrowService");
async function holdFunds(transactionId) {
    const transaction = await (0, transactionService_1.getTransactionById)(transactionId);
    if (!transaction) {
        throw new errors_1.AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
    }
    const existing = await (0, escrowService_1.getEscrowByTransaction)(transactionId);
    if (existing) {
        return existing;
    }
    const escrow = await (0, escrowService_1.createEscrow)(transactionId, transaction.amount);
    await (0, transactionService_1.updateTransactionStatus)(transactionId, 'escrow');
    return escrow;
}
async function releaseEscrow(transactionId) {
    const escrow = await (0, escrowService_1.getEscrowByTransaction)(transactionId);
    if (!escrow) {
        throw new errors_1.AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
    }
    if (escrow.status === 'RELEASED') {
        return escrow;
    }
    return (0, escrowService_1.releaseEscrow)(escrow.id);
}
async function addEscrowMilestone(transactionId, input) {
    const escrow = await (0, escrowService_1.getEscrowByTransaction)(transactionId);
    if (!escrow) {
        throw new errors_1.AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
    }
    return (0, escrowService_1.addMilestone)(escrow.id, input.name, input.percentage);
}
async function releaseMilestone(milestoneId) {
    return (0, escrowService_1.releaseMilestone)(milestoneId);
}
async function getEscrowDetailsByTransaction(transactionId) {
    const escrow = await (0, escrowService_1.getEscrowByTransaction)(transactionId);
    if (!escrow) {
        throw new errors_1.AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
    }
    return (0, escrowService_1.getEscrowWithMilestones)(escrow.id);
}
//# sourceMappingURL=escrow.usecase.js.map