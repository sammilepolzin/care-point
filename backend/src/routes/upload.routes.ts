
import { Router, Request, Response, NextFunction } from 'express';
import ImageKit from 'imagekit';
import path from 'path';
import { randomUUID } from 'crypto';
import { uploadUniversalImage } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';

const router = Router();

const cloudName = process.env.IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

const imagekit =
  cloudName && publicKey && privateKey
    ? new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint: cloudName,
      })
    : null;

const processUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file =
      req.file ||
      (req.files && Array.isArray(req.files) ? req.files[0] : undefined);

    if (!file) {
      throw new AppError('No image file provided.', 400);
    }

    if (!imagekit) {
      throw new AppError('ImageKit is not configured on the server.', 500);
    }

    if (!file.buffer) {
      throw new AppError('Image file buffer is missing.', 400);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `img-${Date.now()}-${randomUUID()}${ext}`;

    const uploaded = await imagekit.upload({
      file: file.buffer,
      fileName: filename,
      folder: '/care-point/images',
      useUniqueFileName: false,
    });

    console.log(`[IMAGEKIT UPLOAD SUCCESS]: ${uploaded.url}`);

    sendResponse({
      res,
      statusCode: 200,
      message: 'Image uploaded successfully.',
      data: {
        filename: uploaded.name,
        imageUrl: uploaded.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

router.post('/image', authenticate, uploadUniversalImage.any(), processUpload);
router.post('/doctor-image', authenticate, uploadUniversalImage.any(), processUpload);

export default router;
