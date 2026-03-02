import { AppError } from './errors';
import {
  adjustBalance,
  createWallet,
  creditWallet,
  debitWallet,
  getWallet,
  listTransactions,
  listWalletTransactionsPaginated,
} from '../services/walletService';

export async function createOwnerWallet(ownerId: string) {
  const existing = await getWallet(ownerId);
  if (existing) {
    return existing;
  }
  return createWallet(ownerId);
}

export async function getWalletBalance(ownerId: string) {
  const wallet = await getWallet(ownerId);
  if (!wallet) {
    throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
  }
  return {
    ownerId,
    walletId: wallet.id,
    balance: wallet.balance,
    version: wallet.version,
  };
}

export async function getWalletTransactionHistory(ownerId: string, limit = 20, cursor?: string) {
  return listWalletTransactionsPaginated(ownerId, limit, cursor);
}

export async function getWalletTransactionsByWalletId(walletId: string, limit = 20, cursor?: string) {
  return listTransactions(walletId, limit, cursor);
}

export async function adminAdjustWallet(
  ownerId: string,
  amount: number,
  type: 'CREDIT' | 'DEBIT' | 'REFUND',
  referenceId?: string
) {
  let wallet = await getWallet(ownerId);
  if (!wallet) {
    wallet = await createWallet(ownerId);
  }
  const updated = await adjustBalance(wallet.id, amount, type, referenceId);
  if (!updated) {
    throw new AppError(500, 'WALLET_UPDATE_FAILED', 'Failed to adjust wallet');
  }
  return updated;
}

export async function creditWalletBalance(ownerId: string, amount: number, reference: string) {
  const existing = await getWallet(ownerId);
  if (!existing) {
    await createWallet(ownerId);
  }
  const wallet = await creditWallet(ownerId, amount, reference);
  if (!wallet) {
    throw new AppError(500, 'WALLET_UPDATE_FAILED', 'Failed to credit wallet');
  }
  return wallet;
}

export async function debitWalletBalance(ownerId: string, amount: number, reference: string) {
  const wallet = await debitWallet(ownerId, amount, reference);
  if (!wallet) {
    throw new AppError(500, 'WALLET_UPDATE_FAILED', 'Failed to debit wallet');
  }
  return wallet;
}
