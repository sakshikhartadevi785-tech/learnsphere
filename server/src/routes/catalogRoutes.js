import { Router } from 'express';
import { create, list, remove, update } from '../controllers/catalogController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { categoryRules, instructorRules, mongoIdParam, scheduleRules } from './validators.js';

export function createCatalogRouter(type) {
  const router = Router();
  const rules = type === 'categories' ? categoryRules : type === 'instructors' ? instructorRules : scheduleRules;
  router.get('/', optionalAuthenticate, asyncHandler(list(type)));
  router.post('/', authenticate, authorize('admin'), rules(false), validateRequest, asyncHandler(create(type)));
  router.put('/:id', authenticate, authorize('admin'), mongoIdParam(), rules(true), validateRequest, asyncHandler(update(type)));
  router.delete('/:id', authenticate, authorize('admin'), mongoIdParam(), validateRequest, asyncHandler(remove(type)));
  return router;
}
