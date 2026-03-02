import { z } from 'zod';
export declare const CreateItemSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateItemInput = z.infer<typeof CreateItemSchema>;
//# sourceMappingURL=item.schema.d.ts.map