import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/PermissionService';
import { AuthorizationError } from '../utils/errors';
import { logger } from '../utils/logger';

export function requirePermission(...permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      const userId = req.user.userId;
      let hasPermission = false;

      for (const permission of permissions) {
        const granted = await PermissionService.checkPermission(userId, permission);
        if (granted) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        logger.warn(`Permission denied for user ${userId}`, {
          requiredPermissions: permissions,
        });
        throw new AuthorizationError(
          `Required permissions: ${permissions.join(', ')}`
        );
      }

      logger.debug(`Permission granted for user ${userId}`, {
        permissions,
      });
      next();
    } catch (error) {
      const appError =
        error instanceof AuthorizationError
          ? error
          : new AuthorizationError('Permission check failed');

      res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
        code: appError.code,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      const userRole = req.user.role;
      if (!roles.includes(userRole)) {
        logger.warn(`Role check failed for user`, {
          userRole,
          requiredRoles: roles,
        });
        throw new AuthorizationError(`Required roles: ${roles.join(', ')}`);
      }

      logger.debug(`Role check passed for user`, { userRole });
      next();
    } catch (error) {
      const appError =
        error instanceof AuthorizationError
          ? error
          : new AuthorizationError('Role check failed');

      res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
        code: appError.code,
        timestamp: new Date().toISOString(),
      });
    }
  };
}
