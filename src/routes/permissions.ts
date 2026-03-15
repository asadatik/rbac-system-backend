import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { authMiddleware } from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/rbac';

const router = Router();

//
router.use(authMiddleware);


router.get(
  '/:userId',
  requirePermission('permissions:view', 'permissions:manage'),
  PermissionController.getPermissions
);

router.post(
  '/:userId/check',
  requirePermission('permissions:view', 'permissions:manage'),
  PermissionController.checkPermission
);


router.put(
  '/:userId',
  requirePermission('permissions:manage'),
  PermissionController.updatePermissions
);


router.get('/:userId/grant-ceiling', PermissionController.grantCeiling);

export default router;
