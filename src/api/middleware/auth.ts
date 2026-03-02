import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../application/errors';
import { getEnv } from '../../infrastructure/env';
import { getUserById } from '../../services/userService';

interface AuthTokenPayload {
  sub: string;
}

export function signAccessToken(userId: string): string {
  const env = getEnv();
  return jwt.sign({ sub: userId } satisfies AuthTokenPayload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization token'));
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (token.length === 0) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization token'));
  }

  try {
    const env = getEnv();
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    res.locals.userId = payload.sub;
    const user = await getUserById(payload.sub);
    res.locals.userRole = user?.role ?? 'user';
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
  }
}
