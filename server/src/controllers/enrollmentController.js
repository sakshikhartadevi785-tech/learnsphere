import { checkoutBasket, getStudentDashboard, listStudentEnrollments } from '../services/enrollmentService.js';

export async function checkout(req, res) {
  const enrollments = await checkoutBasket(req);
  res.status(201).json({ success: true, message: 'Registration confirmed successfully.', enrollments });
}

export async function mine(req, res) {
  const enrollments = await listStudentEnrollments(req.user._id);
  res.json({ success: true, enrollments });
}

export async function dashboard(req, res) {
  const data = await getStudentDashboard(req.user._id);
  res.json({ success: true, ...data });
}
