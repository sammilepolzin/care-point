import { Router } from 'express';
import { DoctorAvailabilityController } from '../controllers/doctorAvailability.controller';

const router = Router();

router.get('/:doctorId', DoctorAvailabilityController.getAvailability);

export default router;