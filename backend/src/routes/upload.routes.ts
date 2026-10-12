import { Router, Request, Response } from 'express';
import { uploadUniversalImage } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

const router = Router();

const processUpload = (req: Request, res: Response) => {
  // ফাইল অবজেক্ট ধরা
  const file = req.file || (req.files && Array.isArray(req.files) ? req.files[0] : undefined);
  
  if (!file) {
    throw new AppError('No image file provided. Please select a valid file.', 400);
  }

  // 🚨 100% BULLETPROOF PORT FIX: 
  // ডেভেলপমেন্ট মোডে সবসময় ব্যাকএন্ডের আসল পোর্ট (5000) ব্যবহার করবে, যাতে ফ্রন্টএন্ডের 3000 পোর্টের সাথে কনফ্লিক্ট না হয়।
  const serverUrl = env.NODE_ENV === 'production' 
    ? `${req.protocol}://${req.get('host')}` 
    : `http://localhost:${env.PORT || 5000}`;

  // চূড়ান্ত ইমেজ ইউআরএল
  const imageUrl = `${serverUrl}/uploads/images/${file.filename}`;

  console.log(`\n📸 [IMAGE SUCCESSFULLY SAVED & LINKED]: ${imageUrl}\n`);

  sendResponse({
    res,
    statusCode: 200,
    message: 'Image uploaded successfully.',
    data: { 
      filename: file.filename, 
      imageUrl 
    },
  });
};

// রাউটসমূহ
router.post('/image', authenticate, uploadUniversalImage.any(), processUpload);
router.post('/doctor-image', authenticate, uploadUniversalImage.any(), processUpload);

export default router;