import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { JwtPayload } from '../types/index';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { _doc?: any };
      token?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    if (AuthService.isTokenBlacklisted(token)) {
      throw new AuthenticationError('Token has been revoked');
    }

    let payload: JwtPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.isSuspended) {
      throw new AuthenticationError('Account suspended');
    }

    req.user = { ...payload, _doc: user.toJSON?.() || user };
    req.token = token;

    logger.debug(`Auth middleware: User authenticated`, { userId: payload.userId });
    next();
  } catch (error) {
    logger.warn(`Auth middleware error:`, error);
    const appError =
      error instanceof AuthenticationError
        ? error
        : new AuthenticationError('Authentication failed');
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      timestamp: new Date().toISOString(),
    });
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    if (AuthService.isTokenBlacklisted(token)) {
      return next();
    }

    const payload = verifyToken(token);
    req.user = payload;
    req.token = token;
  } catch (error) {
    logger.debug('Optional auth failed, continuing without auth');
  }

  next();
}
