import { createCourse, deleteCourse, getCourse, listCourses, updateCourse } from '../services/courseService.js';

export async function index(req, res) {
  const result = await listCourses(req.query, { includeInactive: req.user?.role === 'admin' && req.query.includeInactive === 'true' });
  res.json({ success: true, ...result });
}

export async function show(req, res) {
  const course = await getCourse(req.params.identifier, { includeInactive: req.user?.role === 'admin' });
  res.json({ success: true, course });
}

export async function create(req, res) {
  const course = await createCourse(req.body);
  const populated = await getCourse(String(course._id), { includeInactive: true });
  res.status(201).json({ success: true, message: 'Course created successfully.', course: populated });
}

export async function update(req, res) {
  const course = await updateCourse(req.params.id, req.body);
  res.json({ success: true, message: 'Course updated successfully.', course });
}

export async function remove(req, res) {
  const course = await deleteCourse(req.params.id);
  res.json({ success: true, message: 'Course deactivated successfully.', course });
}
