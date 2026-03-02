import { z } from 'zod';
declare const EnvSchema: z.ZodObject<{
    JWT_SECRET: z.ZodString;
    ADMIN_USER: z.ZodString;
    ADMIN_PASS: z.ZodString;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    RATE_LIMIT_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    RANKING_TELEMETRY_ENABLED: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type AppEnv = z.infer<typeof EnvSchema>;
export declare function getEnv(): AppEnv;
export declare function validateRequiredEnv(): void;
export {};
//# sourceMappingURL=env.d.ts.map