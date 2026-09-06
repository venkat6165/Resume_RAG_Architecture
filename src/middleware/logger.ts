import { Response, NextFunction } from 'express';
import { RequestWithId } from './requestId';

export function loggerMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(
      JSON.stringify({
        requestId: req.id,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      })
    );
  });

  next();
}
