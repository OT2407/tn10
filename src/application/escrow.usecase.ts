import { AppError } from './errors';
import { getTransactionById, updateTransactionStatus } from '../services/transactionService';
import {
  addMilestone,
  createEscrow,
  getEscrowByTransaction,
  getEscrowWithMilestones,
  releaseEscrow as releaseEscrowRow,
  releaseMilestone as releaseEscrowMilestone,
} from '../services/escrowService';

export async function holdFunds(transactionId: string) {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
  }

  const existing = await getEscrowByTransaction(transactionId);
  if (existing) {
    return existing;
  }

  const escrow = await createEscrow(transactionId, transaction.amount);
  await updateTransactionStatus(transactionId, 'escrow');
  return escrow;
}

export async function releaseEscrow(transactionId: string) {
  const escrow = await getEscrowByTransaction(transactionId);
  if (!escrow) {
    throw new AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
  }

  if (escrow.status === 'RELEASED') {
    return escrow;
  }

  return releaseEscrowRow(escrow.id);
}

export async function addEscrowMilestone(
  transactionId: string,
  input: { name: string; percentage: number }
) {
  const escrow = await getEscrowByTransaction(transactionId);
  if (!escrow) {
    throw new AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
  }

  return addMilestone(escrow.id, input.name, input.percentage);
}

export async function releaseMilestone(milestoneId: string) {
  return releaseEscrowMilestone(milestoneId);
}

export async function getEscrowDetailsByTransaction(transactionId: string) {
  const escrow = await getEscrowByTransaction(transactionId);
  if (!escrow) {
    throw new AppError(404, 'ESCROW_NOT_FOUND', 'Escrow not found');
  }

  return getEscrowWithMilestones(escrow.id);
}
