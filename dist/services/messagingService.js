"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureContractConversation = ensureContractConversation;
exports.sendMessage = sendMessage;
exports.listMessages = listMessages;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const prisma = new client_1.PrismaClient();
async function ensureContractConversation(contractId) {
    return prisma.$transaction(async (tx) => {
        const contract = await tx.contract.findUnique({
            where: { id: contractId },
            include: { escrow: true },
        });
        if (!contract) {
            throw new errors_1.AppError(404, 'CONTRACT_NOT_FOUND', 'Contract not found');
        }
        if (contract.status !== 'ACTIVE') {
            throw new errors_1.AppError(409, 'CONTRACT_NOT_ACTIVE', 'Conversation can be created only for ACTIVE contracts');
        }
        const existing = await tx.conversation.findUnique({ where: { contractId } });
        if (existing) {
            return existing;
        }
        const monitoringEnabled = contract.escrow !== null && contract.escrow.status !== 'RELEASED';
        return tx.conversation.create({
            data: {
                contractId,
                monitoringEnabled,
            },
        });
    });
}
async function sendMessage(conversationId, senderId, content) {
    if (content.trim().length === 0) {
        throw new errors_1.AppError(422, 'EMPTY_MESSAGE', 'Message content is required');
    }
    return prisma.message.create({
        data: {
            conversationId,
            senderId,
            content,
        },
    });
}
async function listMessages(conversationId) {
    return prisma.message.findMany({
        where: { conversationId },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
}
//# sourceMappingURL=messagingService.js.map