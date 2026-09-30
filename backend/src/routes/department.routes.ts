import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', DepartmentController.getAll);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DepartmentController.create);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DepartmentController.update);
router.patch('/:id/status', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DepartmentController.toggleStatus);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DepartmentController.delete);

export default router;