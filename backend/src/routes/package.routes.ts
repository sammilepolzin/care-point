import { Router } from 'express';
import { 
  getAllPackages, 
  getPackageById, 
  createPackage, 
  updatePackage, 
  deletePackage 
} from '../controllers/package.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), createPackage);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updatePackage);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deletePackage);

export default router;