"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = getEnv;
exports.validateRequiredEnv = validateRequiredEnv;
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    JWT_SECRET: zod_1.z.string().min(1),
    ADMIN_USER: zod_1.z.string().min(1),
    ADMIN_PASS: zod_1.z.string().min(1),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(100),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(60000),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    RANKING_TELEMETRY_ENABLED: zod_1.z.coerce.boolean().default(false),
});
function getEnv() {
    return EnvSchema.parse(process.env);
}
function validateRequiredEnv() {
    EnvSchema.parse(process.env);
}
//# sourceMappingURL=env.js.map