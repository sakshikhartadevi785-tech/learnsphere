import { Router } from 'express';
import * as basketController from '../controllers/basketController.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { basketAddRules, basketUpdateRules, mongoIdParam } from './validators.js';

const router = Router();
router.get('/', asyncHandler(basketController.index));
router.post('/items', basketAddRules, validateRequest, asyncHandler(basketController.add));
router.patch('/items/:courseId', mongoIdParam('courseId'), basketUpdateRules, validateRequest, asyncHandler(basketController.update));
router.delete('/items/:courseId', mongoIdParam('courseId'), validateRequest, asyncHandler(basketController.remove));
router.delete('/', asyncHandler(basketController.clear));
export default router;
