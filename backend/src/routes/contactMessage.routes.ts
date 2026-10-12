import { Router } from 'express';
import { 
  createMessage, 
  getAllMessages, 
  updateMessageStatus, 
  deleteMessage 
} from '../controllers/contactMessage.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.post('/', createMessage);
router.get('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), getAllMessages);
router.patch('/:id/status', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateMessageStatus);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteMessage);

export default router;