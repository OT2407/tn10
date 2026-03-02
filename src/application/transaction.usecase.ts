import { AppError } from './errors';
import {
  createTransactionRecord,
  getTransactionById,
  updateTransactionStatus,
} from '../services/transactionService';

export interface CreateTransactionUseCaseInput {
  buyerId: string;
  sellerId: string;
  itemId: string;
  amount: number;
}

export async function createTransaction(input: CreateTransactionUseCaseInput) {
  if (input.amount <= 0) {
    throw new AppError(400, 'INVALID_AMOUNT', 'Amount must be positive');
  }
  if (input.buyerId === input.sellerId) {
    throw new AppError(400, 'INVALID_PARTIES', 'Buyer and seller must be different');
  }

  return createTransactionRecord(input);
}

export async function completeTransaction(transactionId: string) {
  const tx = await getTransactionById(transactionId);
  if (!tx) {
    throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
  }

  if (tx.status === 'cancelled') {
    throw new AppError(409, 'INVALID_STATE', 'Cancelled transaction cannot be completed');
  }

  if (tx.status === 'completed') {
    return tx;
  }

  return updateTransactionStatus(transactionId, 'completed');
}

export async function cancelTransaction(transactionId: string) {
  const tx = await getTransactionById(transactionId);
  if (!tx) {
    throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
  }

  if (tx.status === 'completed') {
    throw new AppError(409, 'INVALID_STATE', 'Completed transaction cannot be cancelled');
  }

  if (tx.status === 'cancelled') {
    return tx;
  }

  return updateTransactionStatus(transactionId, 'cancelled');
}
