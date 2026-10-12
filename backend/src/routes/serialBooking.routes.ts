import { Router } from 'express';
import { SerialBookingController } from '../controllers/serialBooking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.post('/book', SerialBookingController.book);
router.get('/:id', SerialBookingController.getById);
router.get('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), SerialBookingController.getAll);
router.patch('/:id/confirm', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST), SerialBookingController.confirmByAdmin);
router.patch('/:id/status', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST), SerialBookingController.updateStatus);

export default router;