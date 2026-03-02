import { z } from 'zod';
export declare const WalletParamsSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const WalletBalanceQuerySchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const WalletTransactionsQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const WalletAdjustBodySchema: z.ZodObject<{
    ownerId: z.ZodString;
    amount: z.ZodNumber;
    type: z.ZodEnum<{
        CREDIT: "CREDIT";
        DEBIT: "DEBIT";
        REFUND: "REFUND";
    }>;
    referenceId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const WalletCreditBodySchema: z.ZodObject<{
    amount: z.ZodNumber;
    reference: z.ZodString;
}, z.core.$strip>;
export declare const WalletDebitBodySchema: z.ZodObject<{
    amount: z.ZodNumber;
    reference: z.ZodString;
}, z.core.$strip>;
export declare const WalletMutationSchema: z.ZodObject<{
    amount: z.ZodNumber;
    reference: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=wallet.schema.d.ts.map