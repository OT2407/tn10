interface WalletPaymentInput {
    amount: number;
}
export interface CreateOrderInput {
    buyerId: string;
    sellerId: string;
    itemId: string;
    amount: number;
    paymentWithWallet?: WalletPaymentInput;
}
export declare function createOrder(input: CreateOrderInput): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
export declare function completeOrder(orderId: string): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
export declare function cancelOrder(orderId: string): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
export declare function createOrderPaymentIntent(orderId: string, currency?: string): Promise<{
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
export {};
//# sourceMappingURL=order.usecase.d.ts.map