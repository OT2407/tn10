import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof LoginSchema>;
//# sourceMappingURL=auth.schema.d.ts.map