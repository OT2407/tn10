export type EscrowStatus = 'PENDING' | 'HOLDING' | 'RELEASED' | 'CANCELLED';
export type EscrowEvent = 'HOLD' | 'RELEASE' | 'CANCEL';

export interface EscrowTransition {
  from: EscrowStatus;
  event: EscrowEvent;
  to: EscrowStatus;
}

export const ESCROW_TRANSITIONS: readonly EscrowTransition[] = [
  { from: 'PENDING', event: 'HOLD', to: 'HOLDING' },
  { from: 'PENDING', event: 'CANCEL', to: 'CANCELLED' },
  { from: 'HOLDING', event: 'RELEASE', to: 'RELEASED' },
  { from: 'HOLDING', event: 'CANCEL', to: 'CANCELLED' },
] as const;

export function nextEscrowState(current: EscrowStatus, event: EscrowEvent): EscrowStatus | null {
  const transition = ESCROW_TRANSITIONS.find((row) => row.from === current && row.event === event);
  return transition?.to ?? null;
}
