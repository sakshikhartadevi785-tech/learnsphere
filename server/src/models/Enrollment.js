import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    amount: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'confirmed', index: true },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'paid', index: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    attendance: { type: Number, default: 0, min: 0, max: 100 },
    registrationReference: { type: String, required: true, unique: true, index: true },
    registeredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

enrollmentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
