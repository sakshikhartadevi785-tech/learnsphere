import { getAdminReferenceData, getAnalytics, listAllEnrollments, listAllMessages, updateEnrollment, updateMessage } from '../services/adminService.js';

export async function analytics(_req, res) {
  res.json({ success: true, analytics: await getAnalytics() });
}

export async function referenceData(_req, res) {
  res.json({ success: true, ...(await getAdminReferenceData()) });
}

export async function enrollments(_req, res) {
  res.json({ success: true, enrollments: await listAllEnrollments() });
}

export async function patchEnrollment(req, res) {
  const enrollment = await updateEnrollment(req.params.id, req.body);
  res.json({ success: true, message: 'Enrollment updated successfully.', enrollment });
}

export async function messages(_req, res) {
  res.json({ success: true, messages: await listAllMessages() });
}

export async function patchMessage(req, res) {
  const message = await updateMessage(req.params.id, req.body.status);
  res.json({ success: true, message: 'Contact message status updated.', item: message });
}
