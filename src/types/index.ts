export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'agent' | 'customer';
  permissions: string[];
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionAssignment {
  userId: string;
  permissions: string[];
  assignedBy: string;
  assignedAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface PermissionCheckRequest {
  userId: string;
  permission: string;
}

export interface UpdatePermissionsRequest {
  permissions: string[];
}

export type RequestId = string;
