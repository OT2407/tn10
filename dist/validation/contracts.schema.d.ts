import { z } from 'zod';
export declare const EscrowTransitionSchema: z.ZodObject<{
    currentStatus: z.ZodEnum<{
        PENDING: "PENDING";
        HOLDING: "HOLDING";
        RELEASED: "RELEASED";
        CANCELLED: "CANCELLED";
    }>;
    event: z.ZodEnum<{
        HOLD: "HOLD";
        RELEASE: "RELEASE";
        CANCEL: "CANCEL";
    }>;
}, z.core.$strip>;
export declare const PaymentIntentPlaceholderSchema: z.ZodObject<{
    transactionId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EscrowTransitionInput = z.infer<typeof EscrowTransitionSchema>;
export type PaymentIntentPlaceholderInput = z.infer<typeof PaymentIntentPlaceholderSchema>;
//# sourceMappingURL=contracts.schema.d.ts.map