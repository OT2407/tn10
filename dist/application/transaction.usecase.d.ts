export interface CreateTransactionUseCaseInput {
    buyerId: string;
    sellerId: string;
    itemId: string;
    amount: number;
}
export declare function createTransaction(input: CreateTransactionUseCaseInput): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
export declare function completeTransaction(transactionId: string): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
export declare function cancelTransaction(transactionId: string): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
//# sourceMappingURL=transaction.usecase.d.ts.map