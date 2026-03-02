import { PrismaClient } from '@prisma/client';
import { AppError } from '../application/errors';

const prisma = new PrismaClient();

export async function ensureContractConversation(contractId: string) {
  return prisma.$transaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: contractId },
      include: { escrow: true },
    });
    if (!contract) {
      throw new AppError(404, 'CONTRACT_NOT_FOUND', 'Contract not found');
    }

    if (contract.status !== 'ACTIVE') {
      throw new AppError(409, 'CONTRACT_NOT_ACTIVE', 'Conversation can be created only for ACTIVE contracts');
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

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  if (content.trim().length === 0) {
    throw new AppError(422, 'EMPTY_MESSAGE', 'Message content is required');
  }

  return prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
    },
  });
}

export async function listMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
}
