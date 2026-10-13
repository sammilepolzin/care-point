
import multer from 'multer';
import { AppError } from '../errors/AppError';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Please select a valid image file.', 400));
  }
};

export const uploadUniversalImage = multer({
  storage,
  limits: { fileSize: 9 * 1024 * 1024 },
  fileFilter,
});

export const uploadDoctorImage = uploadUniversalImage;
