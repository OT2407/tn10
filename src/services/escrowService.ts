import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';

const prisma = new PrismaClient();

const ESCROW_STATUS_PENDING = 'PENDING';
const ESCROW_STATUS_RELEASED = 'RELEASED';
const MILESTONE_STATUS_PENDING = 'PENDING';
const MILESTONE_STATUS_RELEASED = 'RELEASED';

export async function createEscrow(transactionId: string, amount: number) {
  return prisma.escrow.create({
    data: { transactionId, amount, status: ESCROW_STATUS_PENDING },
  });
}

export async function getEscrowByTransaction(transactionId: string) {
  return prisma.escrow.findFirst({ where: { transactionId } });
}

export async function releaseEscrow(id: string) {
  if (!id) {
    throw new AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
  }

  return prisma.escrow.update({
    where: { id },
    data: { status: ESCROW_STATUS_RELEASED, releasedAt: new Date() },
  });
}

export async function addMilestone(escrowId: string, name: string, percentage: number) {
  if (percentage <= 0 || percentage > 100) {
    throw new AppError(422, 'INVALID_MILESTONE_PERCENTAGE', 'Milestone percentage must be between 1 and 100');
  }

  return prisma.$transaction(async (tx) => {
    const escrow = await tx.escrow.findUnique({ where: { id: escrowId } });
    if (!escrow) {
      throw new AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
    }

    const totals = await tx.escrowMilestone.aggregate({
      where: { escrowId },
      _sum: { percentage: true },
    });

    const currentTotal = totals._sum.percentage ?? 0;
    if (currentTotal + percentage > 100) {
      throw new AppError(409, 'MILESTONE_PERCENTAGE_EXCEEDED', 'Total milestone percentage cannot exceed 100');
    }

    return tx.escrowMilestone.create({
      data: {
        escrowId,
        name,
        percentage,
        status: MILESTONE_STATUS_PENDING,
      },
    });
  });
}

export async function releaseMilestone(milestoneId: string) {
  return prisma.$transaction(async (tx) => {
    const milestone = await tx.escrowMilestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) {
      throw new AppError(404, 'MILESTONE_NOT_FOUND', 'Escrow milestone not found');
    }

    const releasedMilestone =
      milestone.status === MILESTONE_STATUS_RELEASED
        ? milestone
        : await tx.escrowMilestone.update({
            where: { id: milestoneId },
            data: { status: MILESTONE_STATUS_RELEASED, releasedAt: new Date() },
          });

    const pendingCount = await tx.escrowMilestone.count({
      where: {
        escrowId: milestone.escrowId,
        status: { not: MILESTONE_STATUS_RELEASED },
      },
    });

    if (pendingCount === 0) {
      await tx.escrow.update({
        where: { id: milestone.escrowId },
        data: { status: ESCROW_STATUS_RELEASED, releasedAt: new Date() },
      });
    }

    return releasedMilestone;
  });
}

export async function getEscrowWithMilestones(id: string) {
  const escrow = await prisma.escrow.findUnique({
    where: { id },
    include: { milestones: { orderBy: { createdAt: 'asc' } } },
  });

  if (!escrow) {
    throw new AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
  }

  return escrow;
}
