import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';

const prisma = new PrismaClient();

export async function createCollaboration(title: string, description: string) {
  return prisma.collaboration.create({
    data: {
      title,
      description,
      status: 'DRAFT',
    },
  });
}

export async function addMember(
  collaborationId: string,
  userId: string,
  percentage: number,
  role: string
) {
  if (!Number.isInteger(percentage) || percentage <= 0 || percentage > 100) {
    throw new AppError(422, 'INVALID_PERCENTAGE', 'Percentage must be between 1 and 100');
  }

  return prisma.$transaction(async (tx) => {
    const collaboration = await tx.collaboration.findUnique({ where: { id: collaborationId } });
    if (!collaboration) {
      throw new AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
    }

    const current = await tx.collaborationMember.aggregate({
      where: { collaborationId },
      _sum: { percentage: true },
    });
    const total = current._sum.percentage ?? 0;
    if (total + percentage > 100) {
      throw new AppError(409, 'PERCENTAGE_EXCEEDED', 'Total percentage cannot exceed 100');
    }

    return tx.collaborationMember.create({
      data: { collaborationId, userId, percentage, role },
    });
  });
}

export async function publishCollaboration(collaborationId: string) {
  const collaboration = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: { members: true },
  });
  if (!collaboration) {
    throw new AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
  }

  const total = collaboration.members.reduce((sum, member) => sum + member.percentage, 0);
  if (total !== 100) {
    throw new AppError(409, 'INVALID_SPLIT', 'Total member percentage must equal 100');
  }

  return prisma.collaboration.update({
    where: { id: collaborationId },
    data: { status: 'ACTIVE' },
  });
}

export async function attachItemToCollaboration(itemId: string, collaborationId: string) {
  return prisma.$transaction(async (tx) => {
    const collaboration = await tx.collaboration.findUnique({ where: { id: collaborationId } });
    if (!collaboration) {
      throw new AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
    }
    if (collaboration.status !== 'ACTIVE') {
      throw new AppError(409, 'COLLABORATION_NOT_ACTIVE', 'Only ACTIVE collaboration can publish items');
    }

    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    return tx.item.update({
      where: { id: itemId },
      data: { collaborationId },
    });
  });
}
