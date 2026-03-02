"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaceholderPaymentIntent = createPlaceholderPaymentIntent;
async function createPlaceholderPaymentIntent(input) {
    const seed = `${input.orderId}:${input.amount}:${input.currency}`;
    const externalRef = `pi_${Buffer.from(seed).toString('base64url').slice(0, 20)}`;
    return {
        provider: 'placeholder',
        status: 'requires_confirmation',
        externalRef,
    };
}
//# sourceMappingURL=paymentPlaceholderAdapter.js.map