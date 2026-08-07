import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, authorize('student'));
router.post('/checkout', asyncHandler(enrollmentController.checkout));
router.get('/mine', asyncHandler(enrollmentController.mine));
router.get('/dashboard', asyncHandler(enrollmentController.dashboard));
export default router;
