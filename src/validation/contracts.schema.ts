import { z } from 'zod';

export const EscrowTransitionSchema = z.object({
  currentStatus: z.enum(['PENDING', 'HOLDING', 'RELEASED', 'CANCELLED']),
  event: z.enum(['HOLD', 'RELEASE', 'CANCEL']),
});

export const PaymentIntentPlaceholderSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(3).default('TRY'),
  requestId: z.string().min(1).optional(),
});

export type EscrowTransitionInput = z.infer<typeof EscrowTransitionSchema>;
export type PaymentIntentPlaceholderInput = z.infer<typeof PaymentIntentPlaceholderSchema>;
