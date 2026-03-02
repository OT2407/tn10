import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const rawRequestId = req.header('x-request-id');
  const requestId = typeof rawRequestId === 'string' && rawRequestId.length > 0 ? rawRequestId : randomUUID();

  res.setHeader('x-request-id', requestId);
  next();
}
