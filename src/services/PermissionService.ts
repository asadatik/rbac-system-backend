import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuthorizationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

const ROLE_HIERARCHY: Record<string, number> = {
  customer: 0,
  agent: 1,
  manager: 2,
  admin: 3,
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['dashboard:view', 'dashboard:manage', 'users:manage', 'permissions:manage', 'audit:view'],
  manager: ['dashboard:view', 'users:view', 'users:manage', 'permissions:view', 'audit:view'],
  agent: ['dashboard:view', 'tickets:create', 'tickets:update', 'reports:view'],
  customer: ['dashboard:view', 'tickets:create', 'profile:view', 'profile:edit'],
};

export class PermissionService {
  static async resolveUserPermissions(userId: any): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const rolePerms = ROLE_PERMISSIONS[user.role] || [];
    const allPermissions = [...new Set([...rolePerms, ...user.permissions])];

    logger.info(`Permissions resolved for user ${userId}`, {
      role: user.role,
      permissions: allPermissions,
    });

    return allPermissions;
  }

  static async checkPermission(userId: any, permission: string): Promise<boolean> {
    const permissions = await this.resolveUserPermissions(userId);
    const hasPermission = permissions.includes(permission);

    logger.debug(`Permission check for user ${userId}`, {
      permission,
      granted: hasPermission,
    });

    return hasPermission;
  }

  static async assignPermissions(
    userId: any,
    permissions: string[],
    assignedBy: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const grantor = await User.findById(assignedBy);
    if (!grantor) {
      throw new NotFoundError('Grantor');
    }

   
    const grantorHierarchy = ROLE_HIERARCHY[grantor.role] || -1;
    const userHierarchy = ROLE_HIERARCHY[user.role] || -1;

    if (userHierarchy > grantorHierarchy) {
      throw new AuthorizationError(
        'Cannot assign permissions to users with higher role hierarchy'
      );
    }

    const previousPermissions = user.permissions;
    user.permissions = [...new Set(permissions)];
    await user.save();

    // Audit log
    await AuditLog.create({
      userId: assignedBy,
      action: 'PERMISSION_CHANGE',
      resource: 'PERMISSION',
      resourceId: userId,
      changes: {
        from: previousPermissions,
        to: user.permissions,
      },
      status: 'success',
    });

    logger.info(`Permissions assigned to user ${userId}`, {
      assignedBy,
      permissions: user.permissions,
    });
  }

  static async hasGrantCeiling(grantor: any, grantee: any): Promise<boolean> {
    const grantorUser = await User.findById(grantor);
    const granteeUser = await User.findById(grantee);

    if (!grantorUser || !granteeUser) {
      return false;
    }

    const grantorHierarchy = ROLE_HIERARCHY[grantorUser.role] || -1;
    const granteeHierarchy = ROLE_HIERARCHY[granteeUser.role] || -1;

    return granteeHierarchy <= grantorHierarchy;
  }
}
