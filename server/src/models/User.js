import crypto from 'node:crypto';
import { promisify } from 'node:util';
import mongoose from 'mongoose';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `scrypt:${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

async function comparePassword(password, storedHash) {
  const [algorithm, salt, expectedHex] = String(storedHash || '').split(':');
  if (algorithm !== 'scrypt' || !salt || !expectedHex) return false;
  const derivedKey = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = Buffer.from(derivedKey);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 30 },
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.methods.comparePassword = function compare(password) {
  return comparePassword(password, this.passwordHash);
};

userSchema.statics.hashPassword = hashPassword;

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
