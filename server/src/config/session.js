import session from 'express-session';
import MongoStore from 'connect-mongo';

export function createSessionMiddleware() {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMemoryStore = process.env.NODE_ENV === 'test' || process.env.SESSION_STORE === 'memory';
  const secureCookie = process.env.COOKIE_SECURE === undefined ? isProduction : process.env.COOKIE_SECURE === 'true';
  const sameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  if (!['lax', 'strict', 'none'].includes(sameSite)) throw new Error('COOKIE_SAME_SITE must be lax, strict or none.');
  if (sameSite === 'none' && !secureCookie) throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE is none.');
  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required in production.');
  }

  const options = {
    name: 'learnsphere.sid',
    secret: process.env.SESSION_SECRET || 'test-only-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: secureCookie,
      sameSite,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  };

  if (!useMemoryStore) {
    options.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7,
      autoRemove: 'native'
    });
  }

  return session(options);
}
