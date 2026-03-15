import { Request, Response, NextFunction } from 'express';
import { createUserSchema, loginSchema, validateRequest } from '../utils/validators';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../types';
import { setAuthCookie } from '../utils/setCookies';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

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

      const result = (await AuthService.login(credentials, ipAddress)) as AuthTokens;

      // Set HTTP-only cookies
      setAuthCookie(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      const response: ApiResponse = {
        
        success: true,
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
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

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
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new Error('Refresh token required');

      const result = (await AuthService.refreshAccessToken(refreshToken)) as AuthTokens;

      // Update cookies
      setAuthCookie(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not authenticated');

      const response: ApiResponse = {
        success: true,
        data: req.user._doc || req.user,
        message: 'User info retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

}