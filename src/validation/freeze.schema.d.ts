import { z } from 'zod';
export declare const CreateFreezeSchema: z.ZodObject<{
    type: z.ZodEnum<{
        base: "base";
        intervention: "intervention";
        final: "final";
    }>;
    svg: z.ZodString;
    metadata: z.ZodString;
    parentHash: z.ZodOptional<z.ZodString>;
    hash: z.ZodString;
}, z.core.$strip>;
export type CreateFreezeInput = z.infer<typeof CreateFreezeSchema>;
//# sourceMappingURL=freeze.schema.d.ts.map