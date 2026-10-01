import { Router, Request, Response } from 'express';
import { uploadUniversalImage } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';

const router = Router();

// ইউনিভার্সাল ইমেজ আপলোড হ্যান্ডলার (ANY ফিল্ড সাপোর্ট)
router.post(
  '/image',
  authenticate,
  uploadUniversalImage.any(),
  (req: Request, res: Response) => {
    // single('image') অথবা any() থেকে ফাইল ধরা
    const file = req.file || (req.files && Array.isArray(req.files) ? req.files[0] : undefined);

    if (!file) {
      throw new AppError('Please select a valid image file from your computer to upload.', 400);
    }

    const imageUrl = `https://${req.get('host')}/uploads/images/${file.filename}`;

    console.log(`\n📸 [SERVER IMAGE UPLOAD OK] Stored: ${file.filename} -> URL: ${imageUrl}\n`);

    sendResponse({
      res,
      statusCode: 200,
      message: 'Image uploaded successfully from your computer.',
      data: {
        filename: file.filename,
        imageUrl,
      },
    });
  }
);

// ডক্টর স্পেসিফিক রাউট
router.post(
  '/doctor-image',
  authenticate,
  uploadUniversalImage.any(),
  (req: Request, res: Response) => {
    const file = req.file || (req.files && Array.isArray(req.files) ? req.files[0] : undefined);
    if (!file) {
      throw new AppError('Please select an image file.', 400);
    }
    const imageUrl = `https://${req.get('host')}/uploads/images/${file.filename}`;
    sendResponse({
      res,
      statusCode: 200,
      message: 'Photo uploaded successfully',
      data: { filename: file.filename, imageUrl },
    });
  }
);

export default router;