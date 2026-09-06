import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id?: string;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  const existingId = req.header('X-Request-Id');
  const requestId = existingId || uuidv4();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
