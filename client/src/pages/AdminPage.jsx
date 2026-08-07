import { useCallback, useEffect, useState } from 'react';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { api } from '../services/api.js';
import { currency, date, getErrorMessage } from '../utils/format.js';

const tabs = ['Overview', 'Courses', 'Categories', 'Instructors', 'Schedules', 'Enrollments', 'Messages'];
const blankCourse = { title: '', slug: '', code: '', shortDescription: '', description: '', category: '', instructor: '', durationWeeks: 8, level: 'Beginner', fee: 0, image: '/images/course-tech.png', capacity: 20, availableSeats: 20, learningOutcomesText: '', isFeatured: false, isActive: true };
const blankCategory = { name: '', slug: '', description: '', image: '/images/course-tech.png', isActive: true };
const blankInstructor = { name: '', title: '', biography: '', specialisation: '', email: '', image: '/images/instructor-training.png', isActive: true };
const blankSchedule = { course: '', mode: 'Online', daysText: 'Monday', startTime: '18:00', endTime: '20:00', startDate: '2026-09-15', location: 'LearnSphere Live Classroom', isActive: true };

export function AdminPage() {
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState({ analytics: null, categories: [], instructors: [], courses: [], schedules: [], enrollments: [], messages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [analytics, reference, enrollments, messages] = await Promise.all([
        api('/admin/analytics'), api('/admin/reference-data'), api('/admin/enrollments'), api('/admin/messages')
      ]);
      setData({ analytics: analytics.analytics, categories: reference.categories, instructors: reference.instructors, courses: reference.courses, schedules: reference.schedules, enrollments: enrollments.enrollments, messages: messages.messages });
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const success = (message) => { setNotice(message); setError(''); load(); };
  const failure = (err) => setError(getErrorMessage(err));

  return (
    <>
      <Seo title="Administration" description="Manage LearnSphere database records and view registration analytics." />
      <PageHero eyebrow="Administration" title="LearnSphere management console">Protected CRUD operations, registration controls and database analytics for authorised administrators.</PageHero>
      <section className="section admin-shell">
        <div className="admin-tabs" role="tablist" aria-label="Administration sections">{tabs.map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
        <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert><Alert type="error" onClose={() => setError('')}>{error}</Alert>
        {loading ? <Loading label="Loading administration data…" /> : <>
          {tab === 'Overview' && <Overview analytics={data.analytics} />}
          {tab === 'Courses' && <CourseManager items={data.courses} categories={data.categories} instructors={data.instructors} onSuccess={success} onError={failure} />}
          {tab === 'Categories' && <CategoryManager items={data.categories} onSuccess={success} onError={failure} />}
          {tab === 'Instructors' && <InstructorManager items={data.instructors} onSuccess={success} onError={failure} />}
          {tab === 'Schedules' && <ScheduleManager items={data.schedules} courses={data.courses} onSuccess={success} onError={failure} />}
          {tab === 'Enrollments' && <EnrollmentManager items={data.enrollments} onSuccess={success} onError={failure} />}
          {tab === 'Messages' && <MessageManager items={data.messages} onSuccess={success} onError={failure} />}
        </>}
      </section>
    </>
  );
}

function Overview({ analytics }) {
  if (!analytics) return null;
  return <div className="admin-overview"><div className="dashboard-grid"><article className="metric-card"><span>Active students</span><strong>{analytics.totals.students}</strong><p>Student accounts</p></article><article className="metric-card"><span>Active courses</span><strong>{analytics.totals.courses}</strong><p>Published records</p></article><article className="metric-card"><span>Enrollments</span><strong>{analytics.totals.enrollments}</strong><p>All registrations</p></article><article className="metric-card"><span>Recorded revenue</span><strong>{currency.format(analytics.totals.revenue)}</strong><p>Paid registrations</p></article></div><div className="admin-overview-grid"><article className="panel"><h2>Enrollment status</h2>{analytics.statusBreakdown.length ? <ul className="summary-list">{analytics.statusBreakdown.map((item) => <li key={item._id}><span>{item._id}</span><strong>{item.count}</strong></li>)}</ul> : <p>No enrollment records.</p>}</article><article className="panel"><h2>Low-seat courses</h2>{analytics.lowSeatCourses.length ? <ul className="summary-list">{analytics.lowSeatCourses.map((course) => <li key={course._id}><span>{course.title}</span><strong>{course.availableSeats}/{course.capacity}</strong></li>)}</ul> : <p>No course has five or fewer seats.</p>}</article><article className="panel"><h2>Most popular courses</h2>{analytics.popularCourses.length ? <ul className="summary-list">{analytics.popularCourses.map((course) => <li key={course.courseId}><span>{course.title}</span><strong>{course.enrollments}</strong></li>)}</ul> : <p>No popularity data yet.</p>}</article><article className="panel"><h2>Admissions inbox</h2><strong className="admin-large-number">{analytics.totals.newMessages}</strong><p>New contact message{analytics.totals.newMessages === 1 ? '' : 's'} require review.</p></article></div></div>;
}

function CourseManager({ items, categories, instructors, onSuccess, onError }) {
  const [form, setForm] = useState(blankCourse);
  const [editId, setEditId] = useState('');
  const [busy, setBusy] = useState(false);
  const select = (item) => { const clean = Object.fromEntries(Object.keys(blankCourse).map((key) => [key, item[key] ?? blankCourse[key]])); setEditId(item._id); setForm({ ...clean, category: item.category?._id || item.category, instructor: item.instructor?._id || item.instructor, learningOutcomesText: (item.learningOutcomes || []).join('\n') }); window.scrollTo({ top: 250, behavior: 'smooth' }); };
  const reset = () => { setEditId(''); setForm(blankCourse); };
  const update = (event) => { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); };
  const submit = async (event) => { event.preventDefault(); setBusy(true); try { const payload = { ...form, durationWeeks: Number(form.durationWeeks), fee: Number(form.fee), capacity: Number(form.capacity), availableSeats: Number(form.availableSeats), learningOutcomes: form.learningOutcomesText.split('\n').map((value) => value.trim()).filter(Boolean) }; delete payload.learningOutcomesText; const result = await api(editId ? `/courses/${editId}` : '/courses', { method: editId ? 'PUT' : 'POST', body: payload }); reset(); onSuccess(result.message); } catch (err) { onError(err); } finally { setBusy(false); } };
  const deactivate = async (id) => { if (!window.confirm('Deactivate this course? Existing enrollment records will be preserved.')) return; try { const result = await api(`/courses/${id}`, { method: 'DELETE' }); onSuccess(result.message); } catch (err) { onError(err); } };
  return <div className="admin-crud"><AdminHeading title="Course records" text="Create, read, update and safely deactivate courses. Category and instructor fields store MongoDB references." /><form className="panel form-card admin-form" onSubmit={submit}><h2>{editId ? 'Edit course' : 'Create course'}</h2><div className="form-grid"><TextField name="title" label="Title" value={form.title} onChange={update} required /><TextField name="slug" label="Slug" value={form.slug} onChange={update} required /><TextField name="code" label="Course code" value={form.code} onChange={update} required /><SelectField name="level" label="Level" value={form.level} onChange={update} options={['Starter','Beginner','Intermediate','Advanced']} /><SelectField name="category" label="Category" value={form.category} onChange={update} options={categories.map((item) => [item._id,item.name])} placeholder="Select category" /><SelectField name="instructor" label="Instructor" value={form.instructor} onChange={update} options={instructors.map((item) => [item._id,item.name])} placeholder="Select instructor" /><NumberField name="durationWeeks" label="Duration (weeks)" value={form.durationWeeks} onChange={update} min="1" /><NumberField name="fee" label="Fee (£)" value={form.fee} onChange={update} min="0" step="0.01" /><NumberField name="capacity" label="Capacity" value={form.capacity} onChange={update} min="1" /><NumberField name="availableSeats" label="Available seats" value={form.availableSeats} onChange={update} min="0" /><TextField name="image" label="Image path" value={form.image} onChange={update} required /></div><label>Short description<textarea name="shortDescription" rows="2" value={form.shortDescription} onChange={update} required minLength="20" maxLength="260" /></label><label>Full description<textarea name="description" rows="4" value={form.description} onChange={update} required minLength="40" maxLength="3000" /></label><label>Learning outcomes (one per line)<textarea name="learningOutcomesText" rows="5" value={form.learningOutcomesText} onChange={update} /></label><div className="checkbox-row"><label><input name="isFeatured" type="checkbox" checked={Boolean(form.isFeatured)} onChange={update} /> Featured course</label><label><input name="isActive" type="checkbox" checked={Boolean(form.isActive)} onChange={update} /> Active</label></div><div className="form-actions"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editId ? 'Update course' : 'Create course'}</button>{editId ? <button className="btn secondary" type="button" onClick={reset}>Cancel edit</button> : null}</div></form><AdminTable headers={['Code','Course','Category','Instructor','Fee','Seats','State','Actions']} rows={items.map((item) => [item.code, item.title, item.category?.name, item.instructor?.name, currency.format(item.fee), `${item.availableSeats}/${item.capacity}`, item.isActive ? 'Active' : 'Inactive', <ActionButtons key={item._id} onEdit={() => select(item)} onDelete={() => deactivate(item._id)} deleteLabel="Deactivate" />])} /></div>;
}

function CategoryManager({ items, onSuccess, onError }) {
  const [form, setForm] = useState(blankCategory); const [editId, setEditId] = useState(''); const [busy, setBusy] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const select = (item) => { const clean = Object.fromEntries(Object.keys(blankCategory).map((key) => [key, item[key] ?? blankCategory[key]])); setEditId(item._id); setForm(clean); };
  const reset = () => { setEditId(''); setForm(blankCategory); };
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const r = await api(editId ? `/categories/${editId}` : '/categories', { method: editId ? 'PUT' : 'POST', body: form }); reset(); onSuccess(r.message); } catch (err) { onError(err); } finally { setBusy(false); } };
  const deactivate = async (id) => { if (!window.confirm('Deactivate this category?')) return; try { const r = await api(`/categories/${id}`, { method: 'DELETE' }); onSuccess(r.message); } catch (err) { onError(err); } };
  return <div className="admin-crud"><AdminHeading title="Category records" text="Maintain course categories and their public descriptions." /><form className="panel form-card admin-form" onSubmit={submit}><h2>{editId ? 'Edit category' : 'Create category'}</h2><div className="form-grid"><TextField name="name" label="Name" value={form.name} onChange={update} required /><TextField name="slug" label="Slug" value={form.slug} onChange={update} required /><TextField name="image" label="Image path" value={form.image} onChange={update} required /></div><label>Description<textarea name="description" rows="4" value={form.description} onChange={update} required minLength="20" /></label><label className="checkbox-label"><input name="isActive" type="checkbox" checked={Boolean(form.isActive)} onChange={update} /> Active</label><CrudButtons busy={busy} editId={editId} reset={reset} noun="category" /></form><AdminTable headers={['Name','Slug','Description','State','Actions']} rows={items.map((item) => [item.name,item.slug,item.description,item.isActive ? 'Active' : 'Inactive',<ActionButtons key={item._id} onEdit={() => select(item)} onDelete={() => deactivate(item._id)} deleteLabel="Deactivate" />])} /></div>;
}

function InstructorManager({ items, onSuccess, onError }) {
  const [form, setForm] = useState(blankInstructor); const [editId, setEditId] = useState(''); const [busy, setBusy] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }); const select = (item) => { const clean = Object.fromEntries(Object.keys(blankInstructor).map((key) => [key, item[key] ?? blankInstructor[key]])); setEditId(item._id); setForm(clean); }; const reset = () => { setEditId(''); setForm(blankInstructor); };
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const r = await api(editId ? `/instructors/${editId}` : '/instructors', { method: editId ? 'PUT' : 'POST', body: form }); reset(); onSuccess(r.message); } catch (err) { onError(err); } finally { setBusy(false); } };
  const deactivate = async (id) => { if (!window.confirm('Deactivate this instructor?')) return; try { const r = await api(`/instructors/${id}`, { method: 'DELETE' }); onSuccess(r.message); } catch (err) { onError(err); } };
  return <div className="admin-crud"><AdminHeading title="Instructor records" text="Create, update and deactivate teaching profiles linked to courses." /><form className="panel form-card admin-form" onSubmit={submit}><h2>{editId ? 'Edit instructor' : 'Create instructor'}</h2><div className="form-grid"><TextField name="name" label="Name" value={form.name} onChange={update} required /><TextField name="title" label="Professional title" value={form.title} onChange={update} required /><TextField name="specialisation" label="Specialisation" value={form.specialisation} onChange={update} required /><TextField name="email" label="Email" type="email" value={form.email} onChange={update} required /><TextField name="image" label="Image path" value={form.image} onChange={update} required /></div><label>Biography<textarea name="biography" rows="4" value={form.biography} onChange={update} required minLength="20" /></label><label className="checkbox-label"><input name="isActive" type="checkbox" checked={Boolean(form.isActive)} onChange={update} /> Active</label><CrudButtons busy={busy} editId={editId} reset={reset} noun="instructor" /></form><AdminTable headers={['Name','Title','Specialisation','Email','State','Actions']} rows={items.map((item) => [item.name,item.title,item.specialisation,item.email,item.isActive ? 'Active' : 'Inactive',<ActionButtons key={item._id} onEdit={() => select(item)} onDelete={() => deactivate(item._id)} deleteLabel="Deactivate" />])} /></div>;
}

function ScheduleManager({ items, courses, onSuccess, onError }) {
  const [form, setForm] = useState(blankSchedule); const [editId, setEditId] = useState(''); const [busy, setBusy] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }); const select = (item) => { const clean = Object.fromEntries(Object.keys(blankSchedule).map((key) => [key, item[key] ?? blankSchedule[key]])); setEditId(item._id); setForm({ ...clean, course: item.course?._id || item.course, daysText: (item.days || []).join(', '), startDate: String(item.startDate).slice(0,10) }); }; const reset = () => { setEditId(''); setForm(blankSchedule); };
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const payload = { ...form, days: form.daysText.split(',').map((x) => x.trim()).filter(Boolean) }; delete payload.daysText; const r = await api(editId ? `/schedules/${editId}` : '/schedules', { method: editId ? 'PUT' : 'POST', body: payload }); reset(); onSuccess(r.message); } catch (err) { onError(err); } finally { setBusy(false); } };
  const deactivate = async (id) => { if (!window.confirm('Deactivate this schedule?')) return; try { const r = await api(`/schedules/${id}`, { method: 'DELETE' }); onSuccess(r.message); } catch (err) { onError(err); } };
  return <div className="admin-crud"><AdminHeading title="Schedule records" text="Maintain valid delivery modes, days, dates and locations linked to courses." /><form className="panel form-card admin-form" onSubmit={submit}><h2>{editId ? 'Edit schedule' : 'Create schedule'}</h2><div className="form-grid"><SelectField name="course" label="Course" value={form.course} onChange={update} options={courses.map((item) => [item._id, `${item.code} — ${item.title}`])} placeholder="Select course" /><SelectField name="mode" label="Mode" value={form.mode} onChange={update} options={['Online','On campus','Weekend']} /><TextField name="daysText" label="Teaching days (comma separated)" value={form.daysText} onChange={update} required /><TextField name="startDate" label="Start date" type="date" value={form.startDate} onChange={update} required /><TextField name="startTime" label="Start time" type="time" value={form.startTime} onChange={update} required /><TextField name="endTime" label="End time" type="time" value={form.endTime} onChange={update} required /><TextField name="location" label="Location" value={form.location} onChange={update} required /></div><label className="checkbox-label"><input name="isActive" type="checkbox" checked={Boolean(form.isActive)} onChange={update} /> Active</label><CrudButtons busy={busy} editId={editId} reset={reset} noun="schedule" /></form><AdminTable headers={['Course','Mode','Days','Start','Location','State','Actions']} rows={items.map((item) => [item.course?.title,item.mode,item.days?.join(', '),date.format(new Date(item.startDate)),item.location,item.isActive ? 'Active' : 'Inactive',<ActionButtons key={item._id} onEdit={() => select(item)} onDelete={() => deactivate(item._id)} deleteLabel="Deactivate" />])} /></div>;
}

function EnrollmentManager({ items, onSuccess, onError }) {
  const [busy, setBusy] = useState('');
  const update = async (id, field, value) => { setBusy(id); try { const r = await api(`/admin/enrollments/${id}`, { method: 'PATCH', body: { [field]: ['progress','attendance'].includes(field) ? Number(value) : value } }); onSuccess(r.message); } catch (err) { onError(err); } finally { setBusy(''); } };
  return <div><AdminHeading title="Enrollment records" text="Review all student registrations and update status, payment, progress and attendance." /><div className="table-wrap"><table className="data-table admin-data-table"><thead><tr><th>Student</th><th>Course</th><th>Reference</th><th>Status</th><th>Payment</th><th>Progress</th><th>Attendance</th></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td>{item.student?.firstName} {item.student?.lastName}<small className="table-subtext">{item.student?.email}</small></td><td>{item.course?.title}<small className="table-subtext">{item.course?.code}</small></td><td>{item.registrationReference}</td><td><select disabled={busy === item._id} value={item.status} onChange={(e) => update(item._id,'status',e.target.value)}>{['pending','confirmed','completed','cancelled'].map((v) => <option key={v}>{v}</option>)}</select></td><td><select disabled={busy === item._id} value={item.paymentStatus} onChange={(e) => update(item._id,'paymentStatus',e.target.value)}>{['unpaid','paid','refunded'].map((v) => <option key={v}>{v}</option>)}</select></td><td><input className="small-number" type="number" min="0" max="100" defaultValue={item.progress} onBlur={(e) => update(item._id,'progress',e.target.value)} />%</td><td><input className="small-number" type="number" min="0" max="100" defaultValue={item.attendance} onBlur={(e) => update(item._id,'attendance',e.target.value)} />%</td></tr>)}</tbody></table></div></div>;
}

function MessageManager({ items, onSuccess, onError }) {
  const [busy, setBusy] = useState('');
  const update = async (id, status) => { setBusy(id); try { const r = await api(`/admin/messages/${id}`, { method: 'PATCH', body: { status } }); onSuccess(r.message); } catch (err) { onError(err); } finally { setBusy(''); } };
  return <div><AdminHeading title="Contact messages" text="Review saved admissions enquiries and update their workflow status." />{items.length ? <div className="message-grid">{items.map((item) => <article className="panel message-card" key={item._id}><div className="message-heading"><div><span className={`status-badge status-${item.status}`}>{item.status}</span><h2>{item.subject}</h2></div><small>{date.format(new Date(item.createdAt))}</small></div><p>{item.message}</p><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a><label>Status<select disabled={busy === item._id} value={item.status} onChange={(e) => update(item._id,e.target.value)}>{['new','in-progress','resolved'].map((v) => <option key={v}>{v}</option>)}</select></label></article>)}</div> : <p className="empty-state">No contact messages found.</p>}</div>;
}

function AdminHeading({ title, text }) { return <div className="section-heading"><span className="eyebrow">Database management</span><h2>{title}</h2><p>{text}</p></div>; }
function TextField({ label, type = 'text', ...props }) { return <label>{label}<input type={type} {...props} /></label>; }
function NumberField(props) { return <TextField type="number" {...props} />; }
function SelectField({ label, options, placeholder, ...props }) { return <label>{label}<select {...props}>{placeholder ? <option value="">{placeholder}</option> : null}{options.map((option) => { const [value, text] = Array.isArray(option) ? option : [option, option]; return <option key={value} value={value}>{text}</option>; })}</select></label>; }
function CrudButtons({ busy, editId, reset, noun }) { return <div className="form-actions"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editId ? `Update ${noun}` : `Create ${noun}`}</button>{editId ? <button className="btn secondary" type="button" onClick={reset}>Cancel edit</button> : null}</div>; }
function ActionButtons({ onEdit, onDelete, deleteLabel }) { return <div className="table-actions"><button type="button" className="small-link button-link" onClick={onEdit}>Edit</button><button type="button" className="danger-link button-link" onClick={onDelete}>{deleteLabel}</button></div>; }
function AdminTable({ headers, rows }) { return <div className="table-wrap"><table className="data-table admin-data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>; }
