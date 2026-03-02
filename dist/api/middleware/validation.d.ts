import { RequestHandler } from 'express';
import { ZodType } from 'zod';
type AnyZodSchema = ZodType<unknown>;
interface ValidationSchemas {
    body?: AnyZodSchema;
    params?: AnyZodSchema;
    query?: AnyZodSchema;
}
export declare function validate(schemas: ValidationSchemas): RequestHandler;
export {};
//# sourceMappingURL=validation.d.ts.map