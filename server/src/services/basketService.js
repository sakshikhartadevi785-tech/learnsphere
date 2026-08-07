import { Course } from '../models/Course.js';
import { Schedule } from '../models/Schedule.js';
import { ApiError } from '../utils/ApiError.js';

function ensureBasket(req) {
  if (!Array.isArray(req.session.basket)) req.session.basket = [];
  return req.session.basket;
}

export async function getBasket(req) {
  const basket = ensureBasket(req);
  if (!basket.length) return { items: [], subtotal: 0, count: 0 };

  const courseIds = basket.map((item) => item.courseId);
  const courses = await Course.find({ _id: { $in: courseIds }, isActive: true })
    .populate('category', 'name slug')
    .populate('instructor', 'name');
  const courseMap = new Map(courses.map((course) => [String(course._id), course]));

  const scheduleIds = basket.map((item) => item.scheduleId).filter(Boolean);
  const schedules = scheduleIds.length
    ? await Schedule.find({ _id: { $in: scheduleIds }, isActive: true })
    : [];
  const scheduleMap = new Map(schedules.map((schedule) => [String(schedule._id), schedule]));

  const items = basket
    .map((item) => {
      const course = courseMap.get(String(item.courseId));
      if (!course) return null;
      return {
        course,
        schedule: item.scheduleId ? scheduleMap.get(String(item.scheduleId)) || null : null,
        addedAt: item.addedAt
      };
    })
    .filter(Boolean);

  if (items.length !== basket.length) {
    req.session.basket = items.map((item) => ({
      courseId: String(item.course._id),
      scheduleId: item.schedule ? String(item.schedule._id) : null,
      addedAt: item.addedAt
    }));
  }

  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.course.fee, 0),
    count: items.length
  };
}

export async function addToBasket(req, courseId, scheduleId = null) {
  const basket = ensureBasket(req);
  const course = await Course.findOne({ _id: courseId, isActive: true });
  if (!course) throw new ApiError(404, 'Course not found.');
  if (course.availableSeats < 1) throw new ApiError(409, 'This course currently has no available seats.');
  if (basket.some((item) => String(item.courseId) === String(courseId))) {
    throw new ApiError(409, 'This course is already in your course basket.');
  }

  if (scheduleId) {
    const schedule = await Schedule.findOne({ _id: scheduleId, course: courseId, isActive: true });
    if (!schedule) throw new ApiError(400, 'The selected schedule is not valid for this course.');
  }

  basket.push({ courseId: String(courseId), scheduleId: scheduleId ? String(scheduleId) : null, addedAt: new Date().toISOString() });
  return getBasket(req);
}

export async function updateBasketItem(req, courseId, scheduleId) {
  const basket = ensureBasket(req);
  const item = basket.find((entry) => String(entry.courseId) === String(courseId));
  if (!item) throw new ApiError(404, 'Course is not in your basket.');

  const schedule = await Schedule.findOne({ _id: scheduleId, course: courseId, isActive: true });
  if (!schedule) throw new ApiError(400, 'The selected schedule is not valid for this course.');
  item.scheduleId = String(scheduleId);
  return getBasket(req);
}

export async function removeFromBasket(req, courseId) {
  const basket = ensureBasket(req);
  const nextBasket = basket.filter((item) => String(item.courseId) !== String(courseId));
  if (nextBasket.length === basket.length) throw new ApiError(404, 'Course is not in your basket.');
  req.session.basket = nextBasket;
  return getBasket(req);
}

export function clearBasket(req) {
  req.session.basket = [];
}
