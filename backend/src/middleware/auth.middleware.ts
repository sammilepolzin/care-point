import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { User } from '../models/user.model';
import { UserRole } from '../constants/roles';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const decoded = verifyAccessToken(token);

    // ইউজার ডাটাবেজে সচল আছে কিনা যাচাই
    const user = await User.findById(decoded.userId).lean();
    if (!user || !user.isActive) {
      throw new AppError('The user belonging to this token is inactive or no longer exists.', 401);
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired access token.', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden: You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};