export declare function createWallet(ownerId: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
}>;
export declare function getWallet(ownerId: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
} | null>;
export declare function listTransactions(walletId: string, limit: number, cursor?: string): Promise<{
    transactions: {
        type: import("@prisma/client").$Enums.WalletTransactionType;
        amount: number;
        referenceId: string | null;
        reference: string;
        id: string;
        createdAt: Date;
        walletId: string;
    }[];
    nextCursor: string | null;
}>;
export declare function listWalletTransactions(ownerId: string): Promise<{
    type: import("@prisma/client").$Enums.WalletTransactionType;
    amount: number;
    referenceId: string | null;
    reference: string;
    id: string;
    createdAt: Date;
    walletId: string;
}[]>;
export declare function listWalletTransactionsPaginated(ownerId: string, limit: number, cursor?: string): Promise<{
    transactions: {
        type: import("@prisma/client").$Enums.WalletTransactionType;
        amount: number;
        referenceId: string | null;
        reference: string;
        id: string;
        createdAt: Date;
        walletId: string;
    }[];
    nextCursor: string | null;
}>;
export declare function adjustBalance(walletId: string, amount: number, type: 'CREDIT' | 'DEBIT' | 'REFUND', referenceId?: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
} | null>;
export declare function creditWallet(ownerId: string, amount: number, reference: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
} | null>;
export declare function debitWallet(ownerId: string, amount: number, reference: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
} | null>;
export declare function distributeRevenueForItemSale(itemId: string, sellerId: string, amount: number, reference: string): Promise<void>;
//# sourceMappingURL=walletService.d.ts.map