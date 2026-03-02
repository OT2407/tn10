import { z } from 'zod';

export const WalletParamsSchema = z.object({
  userId: z.string().min(1),
});

export const WalletBalanceQuerySchema = z.object({
  userId: z.string().min(1),
});

export const WalletTransactionsQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const WalletAdjustBodySchema = z.object({
  ownerId: z.string().min(1),
  amount: z.number().int().positive(),
  type: z.enum(['CREDIT', 'DEBIT', 'REFUND']),
  referenceId: z.string().min(1).optional(),
});

export const WalletCreditBodySchema = z.object({
  amount: z.number().int().positive(),
  reference: z.string().min(1),
});

export const WalletDebitBodySchema = z.object({
  amount: z.number().int().positive(),
  reference: z.string().min(1),
});

// Backward-compatible alias used by existing routes.
export const WalletMutationSchema = WalletCreditBodySchema;
