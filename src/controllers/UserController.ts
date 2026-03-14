import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { PermissionService } from '../services/PermissionService';
import { validateRequest, updateUserSchema, updatePermissionsSchema } from '../utils/validators';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';


export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await UserService.getAllUsers(limit, offset);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Users retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);

 
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const updates: { email?: string; role?: string } = validateRequest(updateUserSchema, req.body);
      const user = await UserService.updateUser({ userId: req.params.id, updates, requesterId: req.user.userId });

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await UserService.suspendUser(req.params.id, req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User suspended successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await UserService.activateUser(req.params.id, req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User activated successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      await UserService.deleteUser(req.params.id, req.user.userId);

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
