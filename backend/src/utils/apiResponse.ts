import { Response } from 'express';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

export const sendResponse = <T>({
  res,
  statusCode = 200,
  message = 'Request completed successfully',
  data,
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data !== undefined ? data : null,
  });
};