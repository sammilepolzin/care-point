import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ১. পেশেন্ট রেজিস্ট্রেশন রাউট
router.post('/register', validateRequest(registerSchema), AuthController.register);

// ২. লগইন রাউট (ইমেইল বা মোবাইল নম্বর উভয় সাপোর্ট করে)
router.post('/login', validateRequest(loginSchema), AuthController.login);

// ৩. ওটিপি ভেরিফিকেশন রাউটসমূহ
router.post('/patient/send-otp', AuthController.sendPatientOtp);
router.post('/patient/verify-otp', AuthController.verifyPatientOtp);

// ৪. টোকেন রিফ্রেশ ও লগআউট
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

// ৫. প্রোফাইল ও সেটিংস রাউট
router.get('/me', authenticate, AuthController.getMe);
router.get('/patient-profile', authenticate, AuthController.getProfileDetails);
router.put('/patient-profile', authenticate, AuthController.updateProfile);

export default router;