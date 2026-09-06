import { Response, NextFunction } from 'express';
import { RequestWithId } from './requestId';

export interface AppError extends Error {
  statusCode?: number;
  errorCode?: string;
}

export function errorHandler(
  err: AppError,
  req: RequestWithId,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  console.error(
    JSON.stringify({
      requestId: req.id,
      errorCode,
      statusCode,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  );

  res.status(statusCode).json({
    success: false,
    requestId: req.id,
    errorCode,
    message,
  });
}
