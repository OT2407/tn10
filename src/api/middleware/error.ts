import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../../application/errors';
import { logError, logWarn } from '../../infrastructure/logger';

function statusFromAppError(error: AppError): number {
  if (
    error.statusCode === 400 ||
    error.statusCode === 401 ||
    error.statusCode === 409 ||
    error.statusCode === 422 ||
    error.statusCode === 429
  ) {
    return error.statusCode;
  }
  return 500;
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isDev = process.env.NODE_ENV !== 'production';
  const requestId = res.getHeader('x-request-id') || req.header('x-request-id');

  if (error instanceof AppError) {
    const appErrorMeta = {
      ...(typeof requestId === 'string' ? { requestId } : {}),
      errorCode: error.code,
      statusCode: error.statusCode,
      message: error.message,
    };
    logWarn('Application error', {
      ...appErrorMeta,
    });
    return res.status(statusFromAppError(error)).json({
      code: error.code,
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const duplicateMeta = {
        ...(typeof requestId === 'string' ? { requestId } : {}),
        errorCode: error.code,
      };
      logWarn('Prisma constraint error', {
        ...duplicateMeta,
      });
      return res.status(409).json({
        code: 'DUPLICATE_HASH',
        message: 'Duplicate resource',
      });
    }

    if (error.code === 'P2003') {
      const fkMeta = {
        ...(typeof requestId === 'string' ? { requestId } : {}),
        errorCode: error.code,
      };
      logWarn('Prisma foreign key error', {
        ...fkMeta,
      });
      return res.status(400).json({
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Invalid referenced resource',
      });
    }
  }

  if (isDev && error instanceof Error && error.stack) {
    const unhandledMeta = {
      ...(typeof requestId === 'string' ? { requestId } : {}),
      stack: error.stack,
    };
    logError('Unhandled error', {
      ...unhandledMeta,
    });
  }

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
}
