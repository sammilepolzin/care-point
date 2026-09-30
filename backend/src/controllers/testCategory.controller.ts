import { Request, Response } from 'express';
import { TestCategoryService } from '../services/testCategory.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class TestCategoryController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const category = await TestCategoryService.createCategory(req.body);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Test category created successfully',
      data: category,
    });
  });

  public static getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await TestCategoryService.getAllCategories();
    sendResponse({
      res,
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const category = await TestCategoryService.updateCategory(req.params.id, req.body);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Test category updated successfully',
      data: category,
    });
  });

  public static delete = asyncHandler(async (req: Request, res: Response) => {
    await TestCategoryService.deleteCategory(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Category deleted successfully',
    });
  });
}