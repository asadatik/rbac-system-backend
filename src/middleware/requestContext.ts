import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
    }
  }
}

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.id = randomUUID();
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || 'anonymous',
    };

    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    (console as any)[logLevel](`[${req.method}] ${req.path} - ${res.statusCode}`, logData);
  });

  next();
}
