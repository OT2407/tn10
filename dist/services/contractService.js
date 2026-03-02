"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContract = createContract;
exports.attachEscrow = attachEscrow;
exports.completeContract = completeContract;
exports.getContract = getContract;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const messagingService_1 = require("./messagingService");
const prisma = new client_1.PrismaClient();
async function createContract(ownerId, title, body) {
    return prisma.contract.create({
        data: {
            ownerId,
            title,
            body,
            status: 'DRAFT',
        },
    });
}
async function attachEscrow(contractId, escrowId) {
    const updated = await prisma.$transaction(async (tx) => {
        const contract = await tx.contract.findUnique({ where: { id: contractId } });
        if (!contract) {
            throw new errors_1.AppError(404, 'CONTRACT_NOT_FOUND', 'Contract not found');
        }
        const escrow = await tx.escrow.findUnique({ where: { id: escrowId } });
        if (!escrow) {
            throw new errors_1.AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
        }
        if (escrow.status !== 'PENDING') {
            throw new errors_1.AppError(409, 'ESCROW_NOT_PENDING', 'Escrow must be pending to attach');
        }
        return tx.contract.update({
            where: { id: contractId },
            data: {
                escrowId,
                status: contract.status === 'DRAFT' ? 'ACTIVE' : contract.status,
            },
        });
    });
    if (updated.status === 'ACTIVE') {
        await (0, messagingService_1.ensureContractConversation)(updated.id);
    }
    return updated;
}
async function completeContract(contractId) {
    return prisma.$transaction(async (tx) => {
        const contract = await tx.contract.findUnique({
            where: { id: contractId },
            include: {
                escrow: {
                    include: { milestones: true },
                },
            },
        });
        if (!contract) {
            throw new errors_1.AppError(404, 'CONTRACT_NOT_FOUND', 'Contract not found');
        }
        const now = new Date();
        if (contract.escrowId && contract.escrow) {
            await tx.escrowMilestone.updateMany({
                where: {
                    escrowId: contract.escrowId,
                    status: { not: 'RELEASED' },
                },
                data: {
                    status: 'RELEASED',
                    releasedAt: now,
                },
            });
            await tx.escrow.update({
                where: { id: contract.escrowId },
                data: {
                    status: 'RELEASED',
                    releasedAt: now,
                },
            });
        }
        return tx.contract.update({
            where: { id: contractId },
            data: { status: 'COMPLETED' },
        });
    });
}
async function getContract(id) {
    return prisma.contract.findUnique({
        where: { id },
        include: {
            escrow: {
                include: { milestones: { orderBy: { createdAt: 'asc' } } },
            },
        },
    });
}
//# sourceMappingURL=contractService.js.map