import { Request, Response, NextFunction } from 'express';
import { createUserSchema, loginSchema, validateRequest } from '../utils/validators';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: { email: string; password: string; role: string } = validateRequest(createUserSchema, req.body);

      const user = await AuthService.register(body.email, body.password, body.role);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User registered successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: { email: string; password: string } = validateRequest(loginSchema, req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.login(credentials, ipAddress);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.token) {
        throw new Error('User not authenticated');
      }

      await AuthService.logout(req.token, req.user.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new Error('Refresh token required');
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
