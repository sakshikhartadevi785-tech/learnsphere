import { Category, Course, Enrollment, Instructor, Schedule } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

const sortMap = {
  newest: '-createdAt',
  title: 'title',
  'fee-asc': 'fee',
  'fee-desc': '-fee',
  duration: 'durationWeeks'
};

async function validateCourseRelations(data, current = null) {
  const categoryId = data.category ?? current?.category;
  const instructorId = data.instructor ?? current?.instructor;
  const capacity = Number(data.capacity ?? current?.capacity);
  const availableSeats = Number(data.availableSeats ?? current?.availableSeats);

  if (availableSeats > capacity) {
    throw new ApiError(400, 'Available seats cannot exceed course capacity.');
  }

  const [category, instructor, reservedSeats] = await Promise.all([
    Category.findOne({ _id: categoryId, isActive: true }),
    Instructor.findOne({ _id: instructorId, isActive: true }),
    current?._id ? Enrollment.countDocuments({ course: current._id, status: { $in: ['pending', 'confirmed', 'completed'] } }) : 0
  ]);
  if (!category) throw new ApiError(400, 'The selected category does not exist or is inactive.');
  if (!instructor) throw new ApiError(400, 'The selected instructor does not exist or is inactive.');
  if (capacity < reservedSeats) {
    throw new ApiError(409, `Course capacity cannot be lower than its ${reservedSeats} existing seat-holding enrolment${reservedSeats === 1 ? '' : 's'}.`);
  }
  if (availableSeats > capacity - reservedSeats) {
    throw new ApiError(409, 'Available seats cannot exceed capacity after existing enrolments are reserved.');
  }
}

export async function listCourses(query = {}, { includeInactive = false } = {}) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 12, 1), 50);
  const filter = {};

  if (!includeInactive) filter.isActive = true;
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.category) filter.category = query.category;
  if (query.level) filter.level = query.level;
  if (query.minFee || query.maxFee) {
    filter.fee = {};
    if (query.minFee) filter.fee.$gte = Number(query.minFee);
    if (query.maxFee) filter.fee.$lte = Number(query.maxFee);
  }
  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { shortDescription: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { code: { $regex: escaped, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate('category', 'name slug')
      .populate('instructor', 'name title specialisation image')
      .sort(sortMap[query.sort] || 'title')
      .skip((page - 1) * limit)
      .limit(limit),
    Course.countDocuments(filter)
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) }
  };
}

export async function getCourse(identifier, { includeInactive = false } = {}) {
  const filter = /^[a-f\d]{24}$/i.test(identifier) ? { _id: identifier } : { slug: identifier };
  if (!includeInactive) filter.isActive = true;

  const course = await Course.findOne(filter)
    .populate('category', 'name slug description image')
    .populate('instructor');

  if (!course) throw new ApiError(404, 'Course not found.');
  return course;
}

export async function createCourse(data) {
  await validateCourseRelations(data);
  return Course.create(data);
}

export async function updateCourse(id, data) {
  const current = await Course.findById(id);
  if (!current) throw new ApiError(404, 'Course not found.');
  await validateCourseRelations(data, current);
  const course = await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('category', 'name slug')
    .populate('instructor', 'name title');
  if (current.isActive && data.isActive === false) {
    await Schedule.updateMany({ course: current._id }, { $set: { isActive: false } });
  }
  return course;
}

export async function deleteCourse(id) {
  const course = await Course.findById(id);
  if (!course) throw new ApiError(404, 'Course not found.');
  course.isActive = false;
  course.isFeatured = false;
  await course.save();
  await Schedule.updateMany({ course: course._id }, { $set: { isActive: false } });
  return course;
}
