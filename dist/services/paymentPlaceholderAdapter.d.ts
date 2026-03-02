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
export declare function createPlaceholderPaymentIntent(input: PlaceholderPaymentIntentInput): Promise<PlaceholderPaymentIntentOutput>;
//# sourceMappingURL=paymentPlaceholderAdapter.d.ts.map