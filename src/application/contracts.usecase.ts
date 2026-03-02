import { AppError } from './errors';
import { nextEscrowState, EscrowEvent, EscrowStatus } from '../domain/escrow.state';
import { PaymentIntentPlaceholderInput } from '../validation/contracts.schema';

export function getContractsSchema() {
  return {
    escrowTransition: {
      currentStatus: ['PENDING', 'HOLDING', 'RELEASED', 'CANCELLED'],
      event: ['HOLD', 'RELEASE', 'CANCEL'],
    },
    paymentIntentPlaceholder: {
      transactionId: 'string',
      amount: 'positive integer',
      currency: 'ISO-4217 alpha-3',
      requestId: 'optional string',
    },
  };
}

export function transitionEscrowState(input: { currentStatus: EscrowStatus; event: EscrowEvent }) {
  const to = nextEscrowState(input.currentStatus, input.event);
  if (!to) {
    throw new AppError(409, 'INVALID_ESCROW_TRANSITION', 'Invalid escrow transition');
  }
  return {
    from: input.currentStatus,
    event: input.event,
    to,
  };
}

export function createPaymentIntentPlaceholder(input: PaymentIntentPlaceholderInput) {
  return {
    id: `pi_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    transactionId: input.transactionId,
    amount: input.amount,
    currency: input.currency,
    status: 'requires_confirmation' as const,
    provider: 'placeholder' as const,
    createdAt: new Date().toISOString(),
    ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
  };
}
