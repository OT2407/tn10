export interface CreateTransactionInput {
    buyerId: string;
    sellerId: string;
    itemId: string;
    amount: number;
}
export declare function createTransactionRecord(input: CreateTransactionInput): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
export declare function getTransactionById(id: string): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
} | null>;
export declare function updateTransactionStatus(id: string, status: 'pending' | 'escrow' | 'completed' | 'cancelled'): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
//# sourceMappingURL=transactionService.d.ts.map