import { Request, Response } from 'express';
import { TestService } from '../services/test.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class TestController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const test = await TestService.createTest(req.body);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Test created successfully',
      data: test,
    });
  });

  public static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { category, search, active } = req.query;
    const tests = await TestService.getAllTests({
      category: category as string,
      search: search as string,
      activeOnly: active !== 'false',
    });
    sendResponse({
      res,
      statusCode: 200,
      message: 'Tests retrieved successfully',
      data: tests,
    });
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const test = await TestService.updateTest(req.params.id, req.body);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Test updated successfully',
      data: test,
    });
  });

  public static delete = asyncHandler(async (req: Request, res: Response) => {
    await TestService.deleteTest(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Test deleted successfully',
    });
  });
}