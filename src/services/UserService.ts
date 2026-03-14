import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { PermissionService } from './PermissionService';
import { NotFoundError, AuthorizationError } from '../utils/errors'
import { logger } from '../utils/logger';

export class UserService {
  static async getAllUsers(limit = 50, offset = 0) {
    const users = await User.find({})
      .select('-password')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({});

    return {
      data: users,
      pagination: {
        limit,
        offset,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(userId :any) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  static async updateUser(
{ userId, updates, requesterId }: { userId: any; updates: Partial<{ email: string; role: string; }>; requesterId: string; }  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check permission
    const canManage = await PermissionService.checkPermission(requesterId, 'users:manage');
    if (!canManage) {
      throw new AuthorizationError();
    }

    const previousData = {
      email: user.email,
      role: user.role,
    };

    if (updates.email) user.email = updates.email;
    if (updates.role) user.role = updates.role as any;

    await user.save();

    await AuditLog.create({
      userId: requesterId,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: userId,
      changes: {
        from: previousData,
        to: {
          email: user.email,
          role: user.role,
        },
      },
    });

    logger.info(`User ${userId} updated by ${requesterId}`);

    return user.toJSON?.() || user;
  }

  static async suspendUser(userId: any, requesterId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const canManage = await PermissionService.checkPermission(requesterId, 'users:manage');
    if (!canManage) {
      throw new AuthorizationError();
    }

    user.isSuspended = true;
    await user.save();

    await AuditLog.create({
      userId: requesterId,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: userId,
      changes: {
        isSuspended: true,
      },
    });

    logger.info(`User ${userId} suspended by ${requesterId}`);

    return user.toJSON?.() || user;
  }

  static async activateUser(userId: any, requesterId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const canManage = await PermissionService.checkPermission(requesterId, 'users:manage');
    if (!canManage) {
      throw new AuthorizationError();
    }

    user.isSuspended = false;
    await user.save();

    await AuditLog.create({
      userId: requesterId,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: userId,
      changes: {
        isSuspended: false,
      },
    });

    logger.info(`User ${userId} activated by ${requesterId}`);

    return user.toJSON?.() || user;
  }

  static async deleteUser(userId: any, requesterId: string) {
    const canManage = await PermissionService.checkPermission(requesterId, 'users:manage');
    if (!canManage) {
      throw new AuthorizationError();
    }

    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new NotFoundError('User');
    }

    await AuditLog.create({
      userId: requesterId,
      action: 'DELETE',
      resource: 'USER',
      resourceId: userId,
      status: 'success',
    });

    logger.info(`User ${userId} deleted by ${requesterId}`);
  }
}
