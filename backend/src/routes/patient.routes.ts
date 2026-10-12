import { Router } from 'express';
import { 
  getAllPatients, 
  togglePatientStatus, 
  getPatientMedicalHistory 
} from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

// শুধুমাত্র SUPER_ADMIN, ADMIN এবং RECEPTIONIST এক্সেস করতে পারবেন
router.use(authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST));

router.get('/', getAllPatients);
router.patch('/:id/status', togglePatientStatus);
router.get('/:id/history', getPatientMedicalHistory);

export default router;