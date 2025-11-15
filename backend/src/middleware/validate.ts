import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createError } from './errorHandler';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(createError(`Validation error: ${message}`, 400));
      } else {
        next(createError('Invalid request body', 400));
      }
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(createError(`Validation error: ${message}`, 400));
      } else {
        next(createError('Invalid request parameters', 400));
      }
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(createError(`Validation error: ${message}`, 400));
      } else {
        next(createError('Invalid query parameters', 400));
      }
    }
  };
};
