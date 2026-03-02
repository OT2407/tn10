import { AppError } from './errors';
import { getOrderById, updateOrderStatus } from '../services/orderService';
import { createPlaceholderPaymentIntent } from '../services/paymentPlaceholderAdapter';
import { createPaymentIntentRecord } from '../services/paymentIntentService';
import { prisma } from '../infrastructure/prisma';
import { distributeRevenueForItemSale } from '../services/walletService';
import { applyPurchasePreferenceBoost } from '../services/intelligenceService';

interface WalletPaymentInput {
  amount: number;
}

export interface CreateOrderInput {
  buyerId: string;
  sellerId: string;
  itemId: string;
  amount: number;
  paymentWithWallet?: WalletPaymentInput;
}

function getWalletDiscountPercent(): number {
  const raw = process.env.WALLET_DISCOUNT_PERCENT;
  if (!raw) {
    return 0;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.min(parsed, 100);
}

export async function createOrder(input: CreateOrderInput) {
  if (input.amount <= 0) {
    throw new AppError(400, 'INVALID_AMOUNT', 'Amount must be positive');
  }
  if (input.buyerId === input.sellerId) {
    throw new AppError(400, 'INVALID_PARTIES', 'Buyer and seller must be different');
  }

  const discountPercent = getWalletDiscountPercent();
  const discountedAmount =
    input.paymentWithWallet === undefined
      ? input.amount
      : Math.max(0, Math.floor(input.amount - (input.amount * discountPercent) / 100));

  return prisma.$transaction(async (tx) => {
    if (input.paymentWithWallet !== undefined) {
      const walletAmount = input.paymentWithWallet.amount;
      if (!Number.isInteger(walletAmount) || walletAmount <= 0) {
        throw new AppError(400, 'INVALID_AMOUNT', 'Wallet payment amount must be a positive integer');
      }
      if (walletAmount > discountedAmount) {
        throw new AppError(400, 'INVALID_AMOUNT', 'Wallet payment exceeds order amount');
      }

      const wallet = await tx.wallet.findUnique({ where: { ownerId: input.buyerId } });
      if (!wallet) {
        throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found');
      }
      if (wallet.balance < walletAmount) {
        throw new AppError(409, 'INSUFFICIENT_FUNDS', 'Insufficient wallet balance');
      }

      const updated = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: {
          balance: wallet.balance - walletAmount,
          version: { increment: 1 },
        },
      });
      if (updated.count === 0) {
        throw new AppError(409, 'STALE_VERSION', 'Wallet version mismatch');
      }

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: -walletAmount,
          reference: `order:${input.itemId}`,
        },
      });
    }

    return tx.order.create({
      data: {
        buyerId: input.buyerId,
        sellerId: input.sellerId,
        itemId: input.itemId,
        amount: discountedAmount,
        status: 'pending',
      },
    });
  });
}

export async function completeOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
  }
  if (order.status === 'cancelled') {
    throw new AppError(409, 'INVALID_STATE', 'Cancelled order cannot be completed');
  }
  if (order.status === 'completed') {
    return order;
  }
  const completed = await updateOrderStatus(orderId, 'completed');
  await distributeRevenueForItemSale(
    completed.itemId,
    completed.sellerId,
    completed.amount,
    `order:complete:${completed.id}`
  );
  await applyPurchasePreferenceBoost(completed.buyerId, completed.itemId);
  return completed;
}

export async function cancelOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
  }
  if (order.status === 'completed') {
    throw new AppError(409, 'INVALID_STATE', 'Completed order cannot be cancelled');
  }
  if (order.status === 'cancelled') {
    return order;
  }
  return updateOrderStatus(orderId, 'cancelled');
}

export async function createOrderPaymentIntent(orderId: string, currency = 'TRY') {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
  }

  const placeholder = await createPlaceholderPaymentIntent({
    orderId,
    amount: order.amount,
    currency,
  });

  return createPaymentIntentRecord({
    orderId,
    amount: order.amount,
    currency,
    status: placeholder.status,
    provider: placeholder.provider,
    externalRef: placeholder.externalRef,
  });
}
