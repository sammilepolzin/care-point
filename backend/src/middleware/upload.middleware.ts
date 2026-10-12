import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../errors/AppError';

// 🚨 FIX: Using process.cwd() for absolute exact path targeting
const uploadDir = path.join(process.cwd(), 'uploads', 'images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Please select a valid image file.', 400));
  }
};

export const uploadUniversalImage = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter,
});

export const uploadDoctorImage = uploadUniversalImage;