import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';


async function createAuthenticatedSession(req, userId) {
  const basket = Array.isArray(req.session?.basket) ? req.session.basket : [];
  await new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
  req.session.userId = String(userId);
  req.session.basket = basket;
}

function publicUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function register(req, res) {
  const email = req.body.email.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const passwordHash = await User.hashPassword(req.body.password);
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email,
    phone: req.body.phone,
    passwordHash,
    role: 'student'
  });

  await createAuthenticatedSession(req, user._id);

  res.status(201).json({ success: true, message: 'Your LearnSphere account has been created.', user: publicUser(user) });
}

export async function login(req, res) {
  const email = req.body.email.toLowerCase().trim();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Email or password is incorrect.');
  }

  user.lastLoginAt = new Date();
  await user.save();
  await createAuthenticatedSession(req, user._id);

  res.json({ success: true, message: 'Login successful.', user: publicUser(user) });
}

export async function logout(req, res) {
  const cookieName = 'learnsphere.sid';
  await new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
  const secureCookie = process.env.COOKIE_SECURE === undefined ? process.env.NODE_ENV === 'production' : process.env.COOKIE_SECURE === 'true';
  const sameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: secureCookie,
    sameSite
  });
  res.json({ success: true, message: 'You have been logged out.' });
}

export async function session(req, res) {
  res.json({ success: true, authenticated: Boolean(req.user), user: req.user ? publicUser(req.user) : null });
}
