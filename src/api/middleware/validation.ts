import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { AppError } from '../../application/errors';

type AnyZodSchema = ZodType<unknown>;

interface ValidationSchemas {
  body?: AnyZodSchema;
  params?: AnyZodSchema;
  query?: AnyZodSchema;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        schemas.params.parse(req.params);
      }
      if (schemas.query) {
        schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const suffix = firstIssue ? `: ${firstIssue.message}` : '';
        return next(new AppError(422, 'VALIDATION_ERROR', `Validation failed${suffix}`));
      }
      next(error);
    }
  };
}
