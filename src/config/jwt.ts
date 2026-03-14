import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';


export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'RBAC-SuperSecureKey2026-ThisIsMinimum32CharactersForProductionSecurity123',
  accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};

export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessExpire,
  });
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpire,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.secret) as JwtPayload;
}

export function generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
