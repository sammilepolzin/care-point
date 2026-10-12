import { Router } from 'express';
import { 
  getDatabaseStats, 
  clearSelectedDatabaseCollections 
} from '../controllers/database.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

// ১. লগইন থাকা যেকোনো অ্যাডমিন বা স্টাফ রেকর্ড সংখ্যা দেখতে পারবে
router.get('/stats', authenticate, getDatabaseStats);

// ২. শুধুমাত্র SUPER_ADMIN পার্মানেন্ট ডাটাবেজ ক্লিয়ার করতে পারবে
router.post('/clear', authenticate, authorize(ROLES.SUPER_ADMIN), clearSelectedDatabaseCollections);

export default router;