"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollaboration = createCollaboration;
exports.addMember = addMember;
exports.publishCollaboration = publishCollaboration;
exports.attachItemToCollaboration = attachItemToCollaboration;
const client_1 = require("@prisma/client");
const errors_1 = require("../application/errors");
const prisma = new client_1.PrismaClient();
async function createCollaboration(title, description) {
    return prisma.collaboration.create({
        data: {
            title,
            description,
            status: 'DRAFT',
        },
    });
}
async function addMember(collaborationId, userId, percentage, role) {
    if (!Number.isInteger(percentage) || percentage <= 0 || percentage > 100) {
        throw new errors_1.AppError(422, 'INVALID_PERCENTAGE', 'Percentage must be between 1 and 100');
    }
    return prisma.$transaction(async (tx) => {
        const collaboration = await tx.collaboration.findUnique({ where: { id: collaborationId } });
        if (!collaboration) {
            throw new errors_1.AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
        }
        const current = await tx.collaborationMember.aggregate({
            where: { collaborationId },
            _sum: { percentage: true },
        });
        const total = current._sum.percentage ?? 0;
        if (total + percentage > 100) {
            throw new errors_1.AppError(409, 'PERCENTAGE_EXCEEDED', 'Total percentage cannot exceed 100');
        }
        return tx.collaborationMember.create({
            data: { collaborationId, userId, percentage, role },
        });
    });
}
async function publishCollaboration(collaborationId) {
    const collaboration = await prisma.collaboration.findUnique({
        where: { id: collaborationId },
        include: { members: true },
    });
    if (!collaboration) {
        throw new errors_1.AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
    }
    const total = collaboration.members.reduce((sum, member) => sum + member.percentage, 0);
    if (total !== 100) {
        throw new errors_1.AppError(409, 'INVALID_SPLIT', 'Total member percentage must equal 100');
    }
    return prisma.collaboration.update({
        where: { id: collaborationId },
        data: { status: 'ACTIVE' },
    });
}
async function attachItemToCollaboration(itemId, collaborationId) {
    return prisma.$transaction(async (tx) => {
        const collaboration = await tx.collaboration.findUnique({ where: { id: collaborationId } });
        if (!collaboration) {
            throw new errors_1.AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
        }
        if (collaboration.status !== 'ACTIVE') {
            throw new errors_1.AppError(409, 'COLLABORATION_NOT_ACTIVE', 'Only ACTIVE collaboration can publish items');
        }
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) {
            throw new errors_1.AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
        }
        return tx.item.update({
            where: { id: itemId },
            data: { collaborationId },
        });
    });
}
//# sourceMappingURL=collaborationService.js.map