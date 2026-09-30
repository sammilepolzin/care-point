import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', DoctorController.getAll);
router.get('/:id', DoctorController.getById);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DoctorController.create);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DoctorController.update);
router.patch('/:id/status', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DoctorController.toggleStatus);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DoctorController.delete);

export default router;