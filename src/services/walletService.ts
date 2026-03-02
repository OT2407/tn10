import { prisma } from '../infrastructure/prisma';
import { AppError } from '../application/errors';
import { Prisma } from '@prisma/client';

function assertPositiveAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new AppError(400, 'INVALID_AMOUNT', 'Amount must be a positive integer');
  }
}

export async function createWallet(ownerId: string) {
  return prisma.wallet.create({
    data: {
      ownerId,
      balance: 0,
      version: 0,
    },
  });
}

export async function getWallet(ownerId: string) {
  return prisma.wallet.findUnique({
    where: { ownerId },
  });
}

export async function listTransactions(walletId: string, limit: number, cursor?: string) {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) {
    throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
  }

  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId },
    ...(cursor === undefined ? {} : { cursor: { id: cursor }, skip: 1 }),
    take: limit + 1,
    orderBy: { id: 'asc' },
  });

  const hasMore = transactions.length > limit;
  const page = hasMore ? transactions.slice(0, limit) : transactions;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;
  return { transactions: page, nextCursor };
}

export async function listWalletTransactions(ownerId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { ownerId } });
  if (!wallet) {
    throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
  }
  return prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

export async function listWalletTransactionsPaginated(ownerId: string, limit: number, cursor?: string) {
  const wallet = await prisma.wallet.findUnique({ where: { ownerId } });
  if (!wallet) {
    throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
  }
  return listTransactions(wallet.id, limit, cursor);
}

export async function adjustBalance(
  walletId: string,
  amount: number,
  type: 'CREDIT' | 'DEBIT' | 'REFUND',
  referenceId?: string
) {
  assertPositiveAmount(amount);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
    }

    if (referenceId !== undefined) {
      const existing = await tx.walletTransaction.findFirst({
        where: { walletId: wallet.id, referenceId },
      });
      if (existing) {
        return wallet;
      }
    }

    const delta = type === 'DEBIT' ? -amount : amount;
    if (wallet.balance + delta < 0) {
      throw new AppError(409, 'INSUFFICIENT_FUNDS', 'Insufficient wallet balance');
    }

    const update = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        version: wallet.version,
      },
      data: {
        balance: wallet.balance + delta,
        version: { increment: 1 },
      },
    });

    if (update.count === 0) {
      throw new AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
    }

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount: delta,
        reference: referenceId ?? `wallet:${type.toLowerCase()}`,
        ...(referenceId === undefined ? {} : { referenceId }),
      },
    });

    return tx.wallet.findUnique({ where: { id: wallet.id } });
  });
}

export async function creditWallet(ownerId: string, amount: number, reference: string) {
  assertPositiveAmount(amount);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { ownerId } });
    if (!wallet) {
      throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
    }

    const existing = await tx.walletTransaction.findFirst({
      where: { walletId: wallet.id, type: 'CREDIT', reference },
    });
    if (existing) {
      return wallet;
    }

    const update = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        version: wallet.version,
      },
      data: {
        balance: wallet.balance + amount,
        version: { increment: 1 },
      },
    });

    if (update.count === 0) {
      throw new AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
    }

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount,
        reference,
        referenceId: reference,
      },
    });

    return tx.wallet.findUnique({ where: { id: wallet.id } });
  });
}

export async function debitWallet(ownerId: string, amount: number, reference: string) {
  assertPositiveAmount(amount);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { ownerId } });
    if (!wallet) {
      throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
    }

    const existing = await tx.walletTransaction.findFirst({
      where: { walletId: wallet.id, type: 'DEBIT', reference },
    });
    if (existing) {
      return wallet;
    }

    if (wallet.balance < amount) {
      throw new AppError(409, 'INSUFFICIENT_FUNDS', 'Insufficient wallet balance');
    }

    const update = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        version: wallet.version,
      },
      data: {
        balance: wallet.balance - amount,
        version: { increment: 1 },
      },
    });

    if (update.count === 0) {
      throw new AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
    }

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEBIT',
        amount: -amount,
        reference,
        referenceId: reference,
      },
    });

    return tx.wallet.findUnique({ where: { id: wallet.id } });
  });
}

async function ensureWalletForOwnerTx(
  tx: Prisma.TransactionClient,
  ownerId: string
) {
  const existing = await tx.wallet.findUnique({ where: { ownerId } });
  if (existing) {
    return existing;
  }
  return tx.wallet.create({
    data: {
      ownerId,
      balance: 0,
      version: 0,
    },
  });
}

async function creditOwnerTx(
  tx: Prisma.TransactionClient,
  ownerId: string,
  amount: number,
  reference: string
): Promise<void> {
  const wallet = await ensureWalletForOwnerTx(tx, ownerId);
  await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { increment: amount },
      version: { increment: 1 },
    },
  });
  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: 'CREDIT',
      amount,
      reference,
      referenceId: reference,
    },
  });
}

export async function distributeRevenueForItemSale(
  itemId: string,
  sellerId: string,
  amount: number,
  reference: string
): Promise<void> {
  assertPositiveAmount(amount);

  await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    if (!item.collaborationId) {
      await creditOwnerTx(tx, sellerId, amount, reference);
      return;
    }

    const collaboration = await tx.collaboration.findUnique({
      where: { id: item.collaborationId },
      include: { members: true },
    });

    if (!collaboration || collaboration.members.length === 0) {
      await creditOwnerTx(tx, sellerId, amount, reference);
      return;
    }

    const totalPercentage = collaboration.members.reduce((sum, member) => sum + member.percentage, 0);
    if (totalPercentage !== 100) {
      throw new AppError(409, 'INVALID_SPLIT', 'Collaboration split must total 100');
    }

    let distributed = 0;
    for (const [index, member] of collaboration.members.entries()) {
      const share =
        index === collaboration.members.length - 1
          ? amount - distributed
          : Math.floor((amount * member.percentage) / 100);
      distributed += share;
      await creditOwnerTx(tx, member.userId, share, `${reference}:member:${member.userId}`);
    }
  });
}
