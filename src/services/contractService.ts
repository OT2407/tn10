import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';
import { ensureContractConversation } from './messagingService';

const prisma = new PrismaClient();

export async function createContract(ownerId: string, title: string, body: string) {
  return prisma.contract.create({
    data: {
      ownerId,
      title,
      body,
      status: 'DRAFT',
    },
  });
}

export async function attachEscrow(contractId: string, escrowId: string) {
  const updated = await prisma.$transaction(async (tx) => {
    const contract = await tx.contract.findUnique({ where: { id: contractId } });
    if (!contract) {
      throw new AppError(404, 'CONTRACT_NOT_FOUND', 'Contract not found');
    }

    const escrow = await tx.escrow.findUnique({ where: { id: escrowId } });
    if (!escrow) {
      throw new AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
    }

    if (escrow.status !== 'PENDING') {
      throw new AppError(409, 'ESCROW_NOT_PENDING', 'Escrow must be pending to attach');
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
    await ensureContractConversation(updated.id);
  }

  return updated;
}

export async function completeContract(contractId: string) {
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
      throw new AppError(404, 'CONTRACT_NOT_FOUND', 'Contract not found');
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

export async function getContract(id: string) {
  return prisma.contract.findUnique({
    where: { id },
    include: {
      escrow: {
        include: { milestones: { orderBy: { createdAt: 'asc' } } },
      },
    },
  });
}
