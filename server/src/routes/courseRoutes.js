import { Router } from 'express';
import * as courseController from '../controllers/courseController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { courseRules, mongoIdParam } from './validators.js';

const router = Router();
router.get('/', optionalAuthenticate, asyncHandler(courseController.index));
router.get('/:identifier', optionalAuthenticate, asyncHandler(courseController.show));
router.post('/', authenticate, authorize('admin'), courseRules(false), validateRequest, asyncHandler(courseController.create));
router.put('/:id', authenticate, authorize('admin'), mongoIdParam(), courseRules(true), validateRequest, asyncHandler(courseController.update));
router.delete('/:id', authenticate, authorize('admin'), mongoIdParam(), validateRequest, asyncHandler(courseController.remove));
export default router;
