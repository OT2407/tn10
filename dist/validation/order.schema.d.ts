import { z } from 'zod';
export declare const CreateOrderSchema: z.ZodObject<{
    sellerId: z.ZodString;
    itemId: z.ZodString;
    amount: z.ZodNumber;
    paymentWithWallet: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CreateOrderPaymentIntentSchema: z.ZodObject<{
    currency: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=order.schema.d.ts.map