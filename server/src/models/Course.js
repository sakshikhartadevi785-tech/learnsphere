import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 20 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 260 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true, index: true },
    durationWeeks: { type: Number, required: true, min: 1, max: 104 },
    level: { type: String, enum: ['Starter', 'Beginner', 'Intermediate', 'Advanced'], required: true, index: true },
    fee: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    learningOutcomes: [{ type: String, trim: true, maxlength: 300 }],
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

courseSchema.pre('validate', function validateSeats(next) {
  if (this.availableSeats > this.capacity) {
    this.invalidate('availableSeats', 'Available seats cannot exceed course capacity.');
  }
  next();
});

courseSchema.index({ title: 'text', shortDescription: 'text', description: 'text' });
courseSchema.index({ category: 1, level: 1, fee: 1 });

courseSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const Course = mongoose.model('Course', courseSchema);
