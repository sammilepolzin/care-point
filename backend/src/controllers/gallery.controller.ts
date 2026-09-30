import { Request, Response } from 'express';
import { GalleryService } from '../services/gallery.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export const createGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await GalleryService.createItem(req.body);
  sendResponse({
    res,
    statusCode: 201,
    message: 'Gallery photo added successfully',
    data: item,
  });
});

export const getAllGalleryItems = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query;
  const items = await GalleryService.getAllItems(category as string);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Gallery items retrieved successfully',
    data: items,
  });
});

export const updateGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await GalleryService.updateItem(req.params.id, req.body);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Gallery photo updated successfully',
    data: item,
  });
});

export const deleteGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  await GalleryService.deleteItem(req.params.id);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Gallery item deleted successfully',
  });
});

export const GalleryController = {
  create: createGalleryItem,
  getAll: getAllGalleryItems,
  update: updateGalleryItem,
  delete: deleteGalleryItem,
};

export default GalleryController;