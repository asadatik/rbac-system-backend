import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { generateTokenPair, verifyToken } from '../config/jwt';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { JwtPayload, AuthRequest } from '../types/index';

const tokenBlacklist = new Set<string>();

export class AuthService {
  static async register(email: string, password: string, role = 'customer'): Promise<unknown> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await User.create({
      email,
      password,
      role,
    });

    logger.info(`User registered: ${email}`);

    return {
      id: user._id,
      email: user.email,
      role: user.role,
    };
  }

  static async login(credentials: AuthRequest, ipAddress?: string): Promise<unknown> {
    const { email, password } = credentials;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.isSuspended) {
      logger.warn(`Login attempt by suspended user: ${email}`);
      throw new AuthenticationError('Account suspended');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      throw new AuthenticationError('Invalid credentials');
    }

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await AuditLog.create({
      userId: user._id.toString(),
      action: 'LOGIN',
      resource: 'SYSTEM',
      status: 'success',
      ipAddress,
    });

    logger.info(`User logged in: ${email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  static async logout(token: string, userId: string): Promise<void> {
    tokenBlacklist.add(token);

    await AuditLog.create({
      userId,
      action: 'LOGOUT',
      resource: 'SYSTEM',
      status: 'success',
    });

    logger.info(`User logged out: ${userId}`);
  }

  static async refreshAccessToken(refreshToken: string): Promise<unknown> {
    if (tokenBlacklist.has(refreshToken)) {
      throw new AuthenticationError('Token has been revoked');
    }

    let payload: JwtPayload;
    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    logger.info(`Access token refreshed for user: ${payload.userId}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  static isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
  }
}
