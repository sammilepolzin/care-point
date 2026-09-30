import { Router } from 'express';
import { 
  createGalleryItem, 
  getAllGalleryItems, 
  updateGalleryItem,
  deleteGalleryItem 
} from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', getAllGalleryItems);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), createGalleryItem);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateGalleryItem);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteGalleryItem);

export default router;