import { Router } from 'express';
import * as contactController from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/security.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { contactRules } from './validators.js';

const router = Router();
router.post('/', contactLimiter, contactRules, validateRequest, asyncHandler(contactController.create));
export default router;
