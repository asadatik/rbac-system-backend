import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError as AppValidationError } from '../utils/errors';
import { ValidationError as ZodValidationError } from '../utils/validators';
import { logger } from '../utils/logger';
import type { ApiResponse } from '../types/index';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timestamp = new Date().toISOString();

  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: Record<string, unknown> | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;

    if (error instanceof AppValidationError) {
      details = error.details;
    }
  } else if (error instanceof ZodValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = {
      errors: error.issues.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    };
  }

  logger.error(`[${statusCode}] ${message}`, {
    error: error.message,
    stack: error.stack,
    code,
    requestId: req.id,
  });

  const response: ApiResponse = {
    success: false,
    message,
    timestamp,
  };

  if (details || process.env.NODE_ENV === 'development') {
    response.data = details || {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  res.status(statusCode).json(response);
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const response: ApiResponse = {
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}
