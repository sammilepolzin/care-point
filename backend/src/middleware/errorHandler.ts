import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.path}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for field: ${field}. Please use another value.`;
  }

  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    res.status(statusCode).json({
      success: false,
      message,
      errors: err.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};