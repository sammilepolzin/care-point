import { Request, Response } from 'express';
import { PackageService } from '../services/package.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export const createPackage = asyncHandler(async (req: Request, res: Response) => {
  const pkg = await PackageService.createPackage(req.body);
  sendResponse({
    res,
    statusCode: 201,
    message: 'Health package created successfully',
    data: pkg,
  });
});

export const getAllPackages = asyncHandler(async (req: Request, res: Response) => {
  const onlyActive = req.query.all !== 'true';
  const packages = await PackageService.getAllPackages(onlyActive);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Health packages retrieved successfully',
    data: packages,
  });
});

export const getPackageById = asyncHandler(async (req: Request, res: Response) => {
  const pkg = await PackageService.getById(req.params.id);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Package details retrieved successfully',
    data: pkg,
  });
});

export const updatePackage = asyncHandler(async (req: Request, res: Response) => {
  const pkg = await PackageService.updatePackage(req.params.id, req.body);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Health package updated successfully',
    data: pkg,
  });
});

export const deletePackage = asyncHandler(async (req: Request, res: Response) => {
  await PackageService.deletePackage(req.params.id);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Health package deleted successfully',
  });
});

export const PackageController = {
  create: createPackage,
  getAll: getAllPackages,
  getById: getPackageById,
  update: updatePackage,
  delete: deletePackage,
};

export default PackageController;