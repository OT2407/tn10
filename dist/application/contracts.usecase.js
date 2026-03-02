"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractsSchema = getContractsSchema;
exports.transitionEscrowState = transitionEscrowState;
exports.createPaymentIntentPlaceholder = createPaymentIntentPlaceholder;
const errors_1 = require("./errors");
const escrow_state_1 = require("../domain/escrow.state");
function getContractsSchema() {
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
function transitionEscrowState(input) {
    const to = (0, escrow_state_1.nextEscrowState)(input.currentStatus, input.event);
    if (!to) {
        throw new errors_1.AppError(409, 'INVALID_ESCROW_TRANSITION', 'Invalid escrow transition');
    }
    return {
        from: input.currentStatus,
        event: input.event,
        to,
    };
}
function createPaymentIntentPlaceholder(input) {
    return {
        id: `pi_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        transactionId: input.transactionId,
        amount: input.amount,
        currency: input.currency,
        status: 'requires_confirmation',
        provider: 'placeholder',
        createdAt: new Date().toISOString(),
        ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
    };
}
//# sourceMappingURL=contracts.usecase.js.map