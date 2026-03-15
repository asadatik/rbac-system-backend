import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";
import { envVars } from "../config/env";

export const jwtConfig = {
  secret: envVars.JWT.JWT_SECRET,
  accessExpire: envVars.JWT.JWT_ACCESS_EXPIRE,
  refreshExpire: envVars.JWT.JWT_REFRESH_EXPIRE,
};




export function generateAccessToken(
  payload: Omit<JwtPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessExpire,
  });
}

export function generateRefreshToken(
  payload: Omit<JwtPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpire,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.secret) as JwtPayload;
}

export function generateTokenPair(payload: Omit<JwtPayload, "iat" | "exp">) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}