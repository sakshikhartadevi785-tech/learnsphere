import { Category, ContactMessage, Course, Enrollment, Instructor, Schedule, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

const seatHoldingStatuses = ['pending', 'confirmed', 'completed'];

export async function getAnalytics() {
  const [students, courses, enrollments, messages, revenueResult, statusBreakdown, lowSeatCourses, popularCourses] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    Course.countDocuments({ isActive: true }),
    Enrollment.countDocuments(),
    ContactMessage.countDocuments({ status: 'new' }),
    Enrollment.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Enrollment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Course.find({ isActive: true, availableSeats: { $lte: 5 } }).select('title code availableSeats capacity').sort('availableSeats').limit(10),
    Enrollment.aggregate([
      { $match: { status: { $in: seatHoldingStatuses } } },
      { $group: { _id: '$course', enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { _id: 0, courseId: '$_id', title: '$course.title', enrollments: 1 } }
    ])
  ]);

  return {
    totals: { students, courses, enrollments, newMessages: messages, revenue: revenueResult[0]?.total || 0 },
    statusBreakdown,
    lowSeatCourses,
    popularCourses
  };
}

export async function listAllEnrollments() {
  return Enrollment.find()
    .populate('student', 'firstName lastName email')
    .populate('course', 'title code fee')
    .populate('schedule')
    .sort('-registeredAt');
}

export async function updateEnrollment(id, data) {
  const allowedFields = ['status', 'paymentStatus', 'progress', 'attendance'];
  const safeData = Object.fromEntries(allowedFields.filter((field) => Object.hasOwn(data, field)).map((field) => [field, data[field]]));
  const enrollment = await Enrollment.findById(id);
  if (!enrollment) throw new ApiError(404, 'Enrollment not found.');

  const oldStatus = enrollment.status;
  const nextStatus = safeData.status ?? oldStatus;
  const heldSeatBefore = seatHoldingStatuses.includes(oldStatus);
  const holdsSeatAfter = seatHoldingStatuses.includes(nextStatus);
  let seatAdjustment = 0;

  if (heldSeatBefore && !holdsSeatAfter) {
    const course = await Course.findOneAndUpdate(
      { _id: enrollment.course, $expr: { $lt: ['$availableSeats', '$capacity'] } },
      { $inc: { availableSeats: 1 } },
      { new: true, runValidators: true }
    );
    if (!course) throw new ApiError(409, 'The linked course seat count is already at capacity and cannot be increased safely.');
    seatAdjustment = 1;
  } else if (!heldSeatBefore && holdsSeatAfter) {
    const course = await Course.findOneAndUpdate(
      { _id: enrollment.course, availableSeats: { $gte: 1 } },
      { $inc: { availableSeats: -1 } },
      { new: true, runValidators: true }
    );
    if (!course) throw new ApiError(409, 'The linked course has no available seat for this status change.');
    seatAdjustment = -1;
  }

  try {
    Object.assign(enrollment, safeData);
    await enrollment.save();
  } catch (error) {
    if (seatAdjustment !== 0) {
      await Course.updateOne({ _id: enrollment.course }, { $inc: { availableSeats: -seatAdjustment } });
    }
    throw error;
  }

  return Enrollment.findById(enrollment._id)
    .populate('student', 'firstName lastName email')
    .populate('course', 'title code fee')
    .populate('schedule');
}

export async function listAllMessages() {
  return ContactMessage.find().sort('-createdAt');
}

export async function updateMessage(id, status) {
  const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!message) throw new ApiError(404, 'Contact message not found.');
  return message;
}

export async function getAdminReferenceData() {
  const [categories, instructors, courses, schedules] = await Promise.all([
    Category.find().sort('name'),
    Instructor.find().sort('name'),
    Course.find().populate('category', 'name').populate('instructor', 'name').sort('title'),
    Schedule.find().populate('course', 'title code').sort('startDate')
  ]);
  return { categories, instructors, courses, schedules };
}
