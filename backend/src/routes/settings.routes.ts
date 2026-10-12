import { Router } from 'express';
import { 
  getSettings, 
  updateSettings, 
  selectiveDeleteSettingsData 
} from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateSettings);

// 🌟 SUPER ADMIN HARD-SECURITY SELECTIVE DELETE ROUTE
router.post('/selective-delete', authenticate, authorize(ROLES.SUPER_ADMIN), selectiveDeleteSettingsData);

export default router;