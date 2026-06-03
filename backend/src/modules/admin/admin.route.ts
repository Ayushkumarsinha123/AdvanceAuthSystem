import { Router } from 'express';
import { adminController } from './admin.container.js';
import { requireAuth } from '../../middlewares/authentication.middleware.js';
import { requirePermission } from '../../middlewares/authorization.middleware.js';

const router = Router();

router.post(
  '/users/assign-role',
  requireAuth,
  requirePermission('MANAGE_USER_ROLES'),
  adminController.assignRole
);

export default router;