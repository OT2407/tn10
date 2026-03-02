export type EscrowStatus = 'PENDING' | 'HOLDING' | 'RELEASED' | 'CANCELLED';
export type EscrowEvent = 'HOLD' | 'RELEASE' | 'CANCEL';
export interface EscrowTransition {
    from: EscrowStatus;
    event: EscrowEvent;
    to: EscrowStatus;
}
export declare const ESCROW_TRANSITIONS: readonly EscrowTransition[];
export declare function nextEscrowState(current: EscrowStatus, event: EscrowEvent): EscrowStatus | null;
//# sourceMappingURL=escrow.state.d.ts.map