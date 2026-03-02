import rateLimit from 'express-rate-limit';
import { getEnv } from '../../infrastructure/env';

const env = getEnv();

export const apiRateLimiter = rateLimit({
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
