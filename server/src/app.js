import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSessionMiddleware } from './config/session.js';
import { errorHandler, notFound } from './middleware/error.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import basketRoutes from './routes/basketRoutes.js';
import { createCatalogRouter } from './routes/catalogRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';

export function createApp() {
  const app = express();
  const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || clientUrls.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not permitted by CORS policy.');
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
  app.use(createSessionMiddleware());
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      service: 'LearnSphere API',
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/categories', createCatalogRouter('categories'));
  app.use('/api/instructors', createCatalogRouter('instructors'));
  app.use('/api/schedules', createCatalogRouter('schedules'));
  app.use('/api/basket', basketRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/admin', adminRoutes);

  if (process.env.NODE_ENV === 'production') {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const clientDist = path.resolve(__dirname, '../../client/dist');
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist));
      app.use((req, res, next) => {
        if (req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/api/')) {
          return res.sendFile(path.join(clientDist, 'index.html'));
        }
        return next();
      });
    }
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export default createApp();
