import { z } from 'zod';
export declare const ExploreQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type ExploreQueryInput = z.infer<typeof ExploreQuerySchema>;
//# sourceMappingURL=explore.schema.d.ts.map