import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac';

const router = Router();

// All routes require authentication
router.use(authMiddleware);


router.get(
  '/users/:userId',
  requirePermission('permissions:view', 'permissions:manage'),
  PermissionController.getPermissions
);

router.post(
  '/users/:userId/check',
  requirePermission('permissions:view', 'permissions:manage'),
  PermissionController.checkPermission
);


router.put(
  '/users/:userId',
  requirePermission('permissions:manage'),
  PermissionController.updatePermissions
);


router.get('/users/:userId/grant-ceiling', PermissionController.grantCeiling);

export default router;
