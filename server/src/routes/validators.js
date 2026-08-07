import { body, param } from 'express-validator';

export const mongoIdParam = (name = 'id') => param(name).isMongoId().withMessage(`${name} must be a valid database identifier.`);

export const registerRules = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must contain 2 to 50 characters.'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must contain 2 to 50 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage('Phone number must not exceed 30 characters.'),
  body('password')
    .isLength({ min: 8, max: 72 }).withMessage('Password must contain 8 to 72 characters.')
    .matches(/[a-z]/).withMessage('Password must include a lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must include an uppercase letter.')
    .matches(/\d/).withMessage('Password must include a number.')
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 1, max: 72 }).withMessage('Password is required.')
];


export function courseRules(isUpdate = false) {
  const maybe = isUpdate ? (chain) => chain.optional() : (chain) => chain;
  return [
    maybe(body('title')).trim().isLength({ min: 3, max: 140 }).withMessage('Course title must contain 3 to 140 characters.'),
    maybe(body('slug')).trim().isSlug().withMessage('Slug must contain lowercase words separated by hyphens.'),
    maybe(body('code')).trim().isLength({ min: 2, max: 20 }).matches(/^[A-Za-z0-9-]+$/).withMessage('Course code may contain letters, numbers and hyphens.'),
    maybe(body('shortDescription')).trim().isLength({ min: 20, max: 260 }).withMessage('Short description must contain 20 to 260 characters.'),
    maybe(body('description')).trim().isLength({ min: 40, max: 3000 }).withMessage('Description must contain 40 to 3000 characters.'),
    maybe(body('category')).isMongoId().withMessage('Select a valid category.'),
    maybe(body('instructor')).isMongoId().withMessage('Select a valid instructor.'),
    maybe(body('durationWeeks')).isInt({ min: 1, max: 104 }).toInt().withMessage('Duration must be between 1 and 104 weeks.'),
    maybe(body('level')).isIn(['Starter', 'Beginner', 'Intermediate', 'Advanced']).withMessage('Select a valid course level.'),
    maybe(body('fee')).isFloat({ min: 0 }).toFloat().withMessage('Fee must be zero or greater.'),
    maybe(body('image')).trim().isLength({ min: 3, max: 500 }).withMessage('Image path is required.'),
    maybe(body('capacity')).isInt({ min: 1 }).toInt().withMessage('Capacity must be at least 1.'),
    maybe(body('availableSeats')).isInt({ min: 0 }).toInt().withMessage('Available seats cannot be negative.'),
    body('learningOutcomes').optional().isArray({ max: 12 }).withMessage('Learning outcomes must be an array.'),
    body('learningOutcomes.*').optional().trim().isLength({ min: 3, max: 300 }).withMessage('Each learning outcome must contain 3 to 300 characters.'),
    body('isFeatured').optional().isBoolean().toBoolean(),
    body('isActive').optional().isBoolean().toBoolean()
  ];
}

export function categoryRules(isUpdate = false) {
  const maybe = isUpdate ? (chain) => chain.optional() : (chain) => chain;
  return [
    maybe(body('name')).trim().isLength({ min: 2, max: 80 }).withMessage('Category name must contain 2 to 80 characters.'),
    maybe(body('slug')).trim().isSlug().withMessage('Category slug is invalid.'),
    maybe(body('description')).trim().isLength({ min: 20, max: 500 }).withMessage('Description must contain 20 to 500 characters.'),
    maybe(body('image')).trim().isLength({ min: 3, max: 500 }).withMessage('Image path is required.'),
    body('isActive').optional().isBoolean().toBoolean()
  ];
}

export function instructorRules(isUpdate = false) {
  const maybe = isUpdate ? (chain) => chain.optional() : (chain) => chain;
  return [
    maybe(body('name')).trim().isLength({ min: 3, max: 100 }).withMessage('Instructor name must contain 3 to 100 characters.'),
    maybe(body('title')).trim().isLength({ min: 3, max: 120 }).withMessage('Instructor title must contain 3 to 120 characters.'),
    maybe(body('biography')).trim().isLength({ min: 20, max: 1000 }).withMessage('Biography must contain 20 to 1000 characters.'),
    maybe(body('specialisation')).trim().isLength({ min: 3, max: 120 }).withMessage('Specialisation must contain 3 to 120 characters.'),
    maybe(body('email')).isEmail().normalizeEmail().withMessage('Enter a valid instructor email address.'),
    maybe(body('image')).trim().isLength({ min: 3, max: 500 }).withMessage('Image path is required.'),
    body('isActive').optional().isBoolean().toBoolean()
  ];
}

export function scheduleRules(isUpdate = false) {
  const maybe = isUpdate ? (chain) => chain.optional() : (chain) => chain;
  return [
    maybe(body('course')).isMongoId().withMessage('Select a valid course.'),
    maybe(body('mode')).isIn(['Online', 'On campus', 'Weekend']).withMessage('Select a valid delivery mode.'),
    maybe(body('days')).isArray({ min: 1, max: 7 }).withMessage('Select at least one teaching day.'),
    body('days.*').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Teaching day is invalid.'),
    maybe(body('startTime')).matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must use 24-hour HH:MM format.'),
    maybe(body('endTime')).matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must use 24-hour HH:MM format.'),
    maybe(body('startDate')).isISO8601().toDate().withMessage('Start date must be a valid date.'),
    maybe(body('location')).trim().isLength({ min: 3, max: 180 }).withMessage('Location must contain 3 to 180 characters.'),
    body('isActive').optional().isBoolean().toBoolean()
  ];
}

export const basketAddRules = [
  body('courseId').isMongoId().withMessage('Course identifier is invalid.'),
  body('scheduleId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Schedule identifier is invalid.')
];

export const basketUpdateRules = [
  body('scheduleId').isMongoId().withMessage('Select a valid schedule.')
];

export const contactRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must contain 2 to 100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('subject').trim().isLength({ min: 3, max: 160 }).withMessage('Subject must contain 3 to 160 characters.'),
  body('message').trim().isLength({ min: 20, max: 2000 }).withMessage('Message must contain 20 to 2000 characters.')
];

export const enrollmentUpdateRules = [
  body().custom((value) => {
    const allowed = ['status', 'paymentStatus', 'progress', 'attendance'];
    if (!value || !allowed.some((field) => Object.hasOwn(value, field))) throw new Error('Provide at least one enrollment field to update.');
    return true;
  }),
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Enrollment status is invalid.'),
  body('paymentStatus').optional().isIn(['unpaid', 'paid', 'refunded']).withMessage('Payment status is invalid.'),
  body('progress').optional().isFloat({ min: 0, max: 100 }).toFloat().withMessage('Progress must be between 0 and 100.'),
  body('attendance').optional().isFloat({ min: 0, max: 100 }).toFloat().withMessage('Attendance must be between 0 and 100.')
];

export const messageUpdateRules = [
  body('status').isIn(['new', 'in-progress', 'resolved']).withMessage('Message status is invalid.')
];
