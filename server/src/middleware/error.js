import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected server error occurred.';
  let details = error.details;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Database validation failed.';
    details = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}.`;
  }

  if (error?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  if (error?.name === 'MongoServerSelectionError') {
    statusCode = 503;
    message = 'The database is temporarily unavailable.';
  }

  const payload = { success: false, message };
  if (details) payload.details = details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) payload.stack = error.stack;

  res.status(statusCode).json(payload);
}
