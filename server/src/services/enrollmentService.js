import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Schedule } from '../models/Schedule.js';
import { ApiError } from '../utils/ApiError.js';
import { createRegistrationReference } from '../utils/reference.js';
import { clearBasket, getBasket } from './basketService.js';

export async function checkoutBasket(req) {
  const basket = await getBasket(req);
  if (!basket.items.length) throw new ApiError(400, 'Your course basket is empty.');
  if (basket.items.some((item) => !item.schedule)) {
    throw new ApiError(400, 'Select a schedule for every course before confirming registration.');
  }

  const courseIds = basket.items.map((item) => item.course._id);
  const existing = await Enrollment.find({ student: req.user._id, course: { $in: courseIds } }).select('course');
  if (existing.length) {
    const duplicateIds = existing.map((entry) => String(entry.course));
    throw new ApiError(409, 'You are already registered for one or more selected courses.', { duplicateCourseIds: duplicateIds });
  }

  const created = [];
  const decrementedCourseIds = [];

  try {
    for (const item of basket.items) {
      const schedule = await Schedule.findOne({ _id: item.schedule._id, course: item.course._id, isActive: true });
      if (!schedule) throw new ApiError(400, `A selected schedule for ${item.course.title} is no longer available.`);

      const course = await Course.findOneAndUpdate(
        { _id: item.course._id, isActive: true, availableSeats: { $gte: 1 } },
        { $inc: { availableSeats: -1 } },
        { new: true, runValidators: true }
      );
      if (!course) throw new ApiError(409, `${item.course.title} no longer has an available seat.`);
      decrementedCourseIds.push(course._id);

      const enrollment = await Enrollment.create({
        student: req.user._id,
        course: course._id,
        schedule: schedule._id,
        amount: course.fee,
        discountPercent: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
        registrationReference: createRegistrationReference()
      });
      created.push(enrollment);
    }
  } catch (error) {
    if (created.length) await Enrollment.deleteMany({ _id: { $in: created.map((item) => item._id) } });
    if (decrementedCourseIds.length) {
      await Course.updateMany({ _id: { $in: decrementedCourseIds } }, { $inc: { availableSeats: 1 } });
    }
    throw error;
  }

  clearBasket(req);
  return Enrollment.find({ _id: { $in: created.map((item) => item._id) } })
    .populate('course', 'title code fee image')
    .populate('schedule');
}

export async function listStudentEnrollments(studentId) {
  return Enrollment.find({ student: studentId })
    .populate({ path: 'course', populate: [{ path: 'category', select: 'name slug' }, { path: 'instructor', select: 'name title' }] })
    .populate('schedule')
    .sort('-registeredAt');
}

export async function getStudentDashboard(studentId) {
  const enrollments = await listStudentEnrollments(studentId);
  const active = enrollments.filter((item) => !['cancelled', 'completed'].includes(item.status));
  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length)
    : 0;
  const averageAttendance = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => sum + item.attendance, 0) / enrollments.length)
    : 0;

  return {
    summary: {
      totalEnrollments: enrollments.length,
      activeEnrollments: active.length,
      completedEnrollments: enrollments.filter((item) => item.status === 'completed').length,
      averageProgress,
      averageAttendance,
      totalPaid: enrollments.filter((item) => item.paymentStatus === 'paid').reduce((sum, item) => sum + item.amount, 0)
    },
    enrollments
  };
}
