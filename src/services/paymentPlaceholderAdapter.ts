export interface PlaceholderPaymentIntentInput {
  orderId: string;
  amount: number;
  currency: string;
}

export interface PlaceholderPaymentIntentOutput {
  provider: 'placeholder';
  status: 'requires_confirmation';
  externalRef: string;
}

export async function createPlaceholderPaymentIntent(
  input: PlaceholderPaymentIntentInput
): Promise<PlaceholderPaymentIntentOutput> {
  const seed = `${input.orderId}:${input.amount}:${input.currency}`;
  const externalRef = `pi_${Buffer.from(seed).toString('base64url').slice(0, 20)}`;
  return {
    provider: 'placeholder',
    status: 'requires_confirmation',
    externalRef,
  };
}
