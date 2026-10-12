import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/patient', PrescriptionController.getByPhone);
router.get('/:id', PrescriptionController.getById);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR), PrescriptionController.create);
router.get('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR), PrescriptionController.getAll);

export default router;