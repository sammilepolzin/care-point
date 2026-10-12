import { Router } from 'express';
import { 
  getAllOffers, 
  createOffer, 
  updateOffer, 
  deleteOffer 
} from '../controllers/offer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', getAllOffers);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), createOffer);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateOffer);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteOffer);

export default router;