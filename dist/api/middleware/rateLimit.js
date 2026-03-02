"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../../infrastructure/env");
const env = (0, env_1.getEnv)();
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            code: 'RATE_LIMITED',
            message: 'Too many requests',
        });
    },
});
//# sourceMappingURL=rateLimit.js.map