import { Router } from 'express';
import { DoctorScheduleController } from '../controllers/doctorSchedule.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', DoctorScheduleController.getAll);
router.get('/doctor/:doctorId', DoctorScheduleController.getByDoctor);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DoctorScheduleController.create);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), DoctorScheduleController.delete);

export default router;