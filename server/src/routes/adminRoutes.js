import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { enrollmentUpdateRules, messageUpdateRules, mongoIdParam } from './validators.js';

const router = Router();
router.use(authenticate, authorize('admin'));
router.get('/analytics', asyncHandler(adminController.analytics));
router.get('/reference-data', asyncHandler(adminController.referenceData));
router.get('/enrollments', asyncHandler(adminController.enrollments));
router.patch('/enrollments/:id', mongoIdParam(), enrollmentUpdateRules, validateRequest, asyncHandler(adminController.patchEnrollment));
router.get('/messages', asyncHandler(adminController.messages));
router.patch('/messages/:id', mongoIdParam(), messageUpdateRules, validateRequest, asyncHandler(adminController.patchMessage));
export default router;
