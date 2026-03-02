import { z } from "zod";
export declare const linkFreezeParamSchema: z.ZodObject<{
    freezeId: z.ZodString;
}, z.core.$strip>;
export declare const createLinkBodySchema: z.ZodObject<{
    url: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateLinkBody = z.infer<typeof createLinkBodySchema>;
//# sourceMappingURL=link.schema.d.ts.map