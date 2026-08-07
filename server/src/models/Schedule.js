import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    mode: { type: String, enum: ['Online', 'On campus', 'Weekend'], required: true, index: true },
    days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    startDate: { type: Date, required: true, index: true },
    location: { type: String, required: true, trim: true, maxlength: 180 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

scheduleSchema.index({ course: 1, startDate: 1, mode: 1 }, { unique: true });

scheduleSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const Schedule = mongoose.model('Schedule', scheduleSchema);
