import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/rbac';

const router = Router();

// All routes require authentication
router.use(authMiddleware);


router.get('/', requirePermission('users:view', 'users:manage'), UserController.getAll);


router.get('/:id', UserController.getById);


router.put('/:id', requirePermission('users:manage'), UserController.update);


router.post('/:id/suspend', requirePermission('users:manage'), UserController.suspend);


router.post('/:id/activate', requirePermission('users:manage'), UserController.activate);


router.delete('/:id', requireRole('admin'), UserController.delete);

export default router;
