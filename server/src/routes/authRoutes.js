import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginRules, registerRules } from './validators.js';

const router = Router();
router.post('/register', authLimiter, registerRules, validateRequest, asyncHandler(authController.register));
router.post('/login', authLimiter, loginRules, validateRequest, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/session', optionalAuthenticate, asyncHandler(authController.session));
export default router;
