import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class DepartmentController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.createDepartment(req.body);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Department created successfully',
      data: department,
    });
  });

  public static getAll = asyncHandler(async (req: Request, res: Response) => {
    const onlyActive = req.query.active === 'true';
    const departments = await DepartmentService.getAllDepartments(onlyActive);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Departments retrieved successfully',
      data: departments,
    });
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.updateDepartment(req.params.id, req.body);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Department updated successfully',
      data: department,
    });
  });

  public static toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.toggleStatus(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: `Department marked as ${department.isActive ? 'Active' : 'Inactive'}`,
      data: department,
    });
  });

  public static delete = asyncHandler(async (req: Request, res: Response) => {
    await DepartmentService.deleteDepartment(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Department deleted successfully',
    });
  });
}