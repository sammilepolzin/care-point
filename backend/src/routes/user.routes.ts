import { Router } from 'express';
import { 
  getAllStaffUsers, 
  createStaffUser, 
  changeOwnPassword,
  changeUserPasswordByAdmin, 
  deleteUserBySuperAdmin,
  toggleUserStatus, 
  updateUserPermissions 
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

// ১. যেকোনো লগইন করা ইউজার নিজের পাসওয়ার্ড পরিবর্তন করতে পারবে
router.patch('/change-my-password', authenticate, changeOwnPassword);

// ২. বাকি সব অ্যাডমিন রুটের জন্য অথরাইজেশন গার্ড
router.use(authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.get('/', getAllStaffUsers);
router.post('/', createStaffUser);
router.patch('/:id/password', changeUserPasswordByAdmin);
router.patch('/:id/status', toggleUserStatus);
router.patch('/:id/permissions', updateUserPermissions);

// ৩. শুধুমাত্র সুপার অ্যাডমিন পার্মানেন্ট ডিলিট করতে পারবে
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), deleteUserBySuperAdmin);

export default router;