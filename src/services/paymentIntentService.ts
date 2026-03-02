import { prisma } from '../infrastructure/prisma';

export interface CreatePaymentIntentInput {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  externalRef?: string;
}

export async function createPaymentIntentRecord(input: CreatePaymentIntentInput) {
  return prisma.paymentIntent.create({
    data: {
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
      provider: input.provider,
      ...(input.externalRef === undefined ? {} : { externalRef: input.externalRef }),
    },
  });
}
