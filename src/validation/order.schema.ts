import { z } from 'zod';

export const CreateOrderSchema = z.object({
  sellerId: z.string().min(1),
  itemId: z.string().min(1),
  amount: z.number().int().positive(),
  paymentWithWallet: z
    .object({
      amount: z.number().int().positive(),
    })
    .optional(),
});

export const CreateOrderPaymentIntentSchema = z.object({
  currency: z.string().min(3).max(3).default('TRY'),
});
