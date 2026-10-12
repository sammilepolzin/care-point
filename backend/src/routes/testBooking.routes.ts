import { Router } from 'express';
import { TestBookingController } from '../controllers/testBooking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

// 🌟 উভয় পাথেই টেস্ট বুকিং রিকোয়েস্ট গ্রহণ করবে (কোনো 404 এরর হবে না)
router.post('/', TestBookingController.create);
router.post('/book', TestBookingController.create);

router.get('/:id', TestBookingController.getById);
router.get('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_TECHNICIAN, ROLES.RECEPTIONIST, ROLES.COLLECTOR), TestBookingController.getAll);
router.patch('/:id/status', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_TECHNICIAN, ROLES.RECEPTIONIST), TestBookingController.updateStatus);

export default router;