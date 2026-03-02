import { z } from 'zod';

const EnvSchema = z.object({
  JWT_SECRET: z.string().min(1),
  ADMIN_USER: z.string().min(1),
  ADMIN_PASS: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  CORS_ORIGIN: z.string().default('*'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  RANKING_TELEMETRY_ENABLED: z.coerce.boolean().default(false),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function getEnv(): AppEnv {
  return EnvSchema.parse(process.env);
}

export function validateRequiredEnv(): void {
  EnvSchema.parse(process.env);
}
