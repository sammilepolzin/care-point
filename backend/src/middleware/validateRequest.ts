import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

export const validateRequest = (schema?: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!schema || typeof schema.parseAsync !== 'function') {
      return next(); // স্কিমা না থাকলে রিকোয়েস্ট আটকে না রেখে পাস করবে
    }
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};