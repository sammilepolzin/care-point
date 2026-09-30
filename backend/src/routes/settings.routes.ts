import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateSettings);

export default router;