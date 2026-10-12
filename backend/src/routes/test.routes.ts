import { Router } from 'express';
import { TestController } from '../controllers/test.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', TestController.getAll);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_TECHNICIAN), TestController.create);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_TECHNICIAN), TestController.update);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), TestController.delete);

export default router;