import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/PermissionService';
import { validateRequest, updatePermissionsSchema } from '../utils/validators';
import type { ApiResponse } from '../types/index';

export class PermissionController {
  static async getPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await PermissionService.resolveUserPermissions(req.params.userId);

      const response: ApiResponse = {
        success: true,
        data: { permissions },
        message: 'Permissions retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async checkPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { permission } = req.body;
      if (!permission) {
        throw new Error('Permission field required');
      }

      const hasPermission = await PermissionService.checkPermission(req.params.userId, permission);

      const response: ApiResponse = {
        success: true,
        data: { hasPermission, permission },
        message: 'Permission check completed',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updatePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { permissions }: { permissions: string[] } = validateRequest(updatePermissionsSchema, req.body);

      await PermissionService.assignPermissions(req.params.userId, permissions, req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: { permissions },
        message: 'Permissions assigned successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async grantCeiling(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const hasGrant = await PermissionService.hasGrantCeiling(req.user.userId, req.params.userId);

      const response: ApiResponse = {
        success: true,
        data: { hasGrantCeiling: hasGrant },
        message: 'Grant ceiling check completed',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
