export interface CreatePaymentIntentInput {
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    externalRef?: string;
}
export declare function createPaymentIntentRecord(input: CreatePaymentIntentInput): Promise<{
    amount: number;
    currency: string;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    provider: string;
    externalRef: string | null;
    orderId: string;
}>;
//# sourceMappingURL=paymentIntentService.d.ts.map