import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const userId = req.session?.userId;
  if (!userId) {
    throw new ApiError(401, 'Please log in to continue.');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    req.session.destroy(() => {});
    throw new ApiError(401, 'Your session is no longer valid. Please log in again.');
  }

  req.user = user;
  next();
});

export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  if (!req.session?.userId) return next();
  const user = await User.findById(req.session.userId);
  if (user?.isActive) req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Please log in to continue.'));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to perform this action.'));
    return next();
  };
}
