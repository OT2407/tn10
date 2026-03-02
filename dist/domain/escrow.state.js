"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCROW_TRANSITIONS = void 0;
exports.nextEscrowState = nextEscrowState;
exports.ESCROW_TRANSITIONS = [
    { from: 'PENDING', event: 'HOLD', to: 'HOLDING' },
    { from: 'PENDING', event: 'CANCEL', to: 'CANCELLED' },
    { from: 'HOLDING', event: 'RELEASE', to: 'RELEASED' },
    { from: 'HOLDING', event: 'CANCEL', to: 'CANCELLED' },
];
function nextEscrowState(current, event) {
    const transition = exports.ESCROW_TRANSITIONS.find((row) => row.from === current && row.event === event);
    return transition?.to ?? null;
}
//# sourceMappingURL=escrow.state.js.map