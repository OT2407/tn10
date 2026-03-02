export declare function createOwnerWallet(ownerId: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
}>;
export declare function getWalletBalance(ownerId: string): Promise<{
    ownerId: string;
    walletId: string;
    balance: number;
    version: number;
}>;
export declare function getWalletTransactionHistory(ownerId: string, limit?: number, cursor?: string): Promise<{
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
export declare function getWalletTransactionsByWalletId(walletId: string, limit?: number, cursor?: string): Promise<{
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
export declare function adminAdjustWallet(ownerId: string, amount: number, type: 'CREDIT' | 'DEBIT' | 'REFUND', referenceId?: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
}>;
export declare function creditWalletBalance(ownerId: string, amount: number, reference: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
}>;
export declare function debitWalletBalance(ownerId: string, amount: number, reference: string): Promise<{
    ownerId: string;
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
}>;
//# sourceMappingURL=wallet.usecase.d.ts.map