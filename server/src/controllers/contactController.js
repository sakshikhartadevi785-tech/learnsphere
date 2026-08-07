import { ContactMessage } from '../models/ContactMessage.js';

export async function create(req, res) {
  const { name, email, subject, message } = req.body;
  const item = await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ success: true, message: 'Your message has been submitted to the admissions team.', item });
}
