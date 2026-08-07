import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { Seo } from '../components/Seo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api, buildQuery } from '../services/api.js';
import { currency, date, formatTime, getErrorMessage } from '../utils/format.js';

export function CourseDetailsPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { addToBasket, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api(`/courses/${slug}`)
      .then(async (data) => {
        setCourse(data.course);
        const scheduleData = await api(`/schedules${buildQuery({ course: data.course._id })}`);
        setSchedules(scheduleData.items);
        if (scheduleData.items.length === 1) setScheduleId(scheduleData.items[0]._id);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    if (user?.role === 'admin') { setError('Administrator accounts manage course records and cannot submit student registrations.'); return; }
    if (!scheduleId) { setError('Select a timetable before adding the course to your basket.'); return; }
    setBusy(true); setError('');
    try {
      await addToBasket(course._id, scheduleId);
      navigate('/basket');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  if (loading) return <section className="section"><Loading label="Loading course details…" /></section>;
  if (!course) return <section className="section"><Alert type="error">{error || 'Course not found.'}</Alert><Link className="btn secondary" to="/courses">Back to courses</Link></section>;

  return (
    <>
      <Seo title={course.title} description={course.shortDescription} />
      <section className="course-detail-hero">
        <div><span className="eyebrow">{course.category?.name}</span><h1>{course.title}</h1><p>{course.shortDescription}</p><div className="meta detail-meta"><span>{course.code}</span><span>{course.durationWeeks} weeks</span><span>{course.level}</span><span>{currency.format(course.fee)}</span></div></div>
        <img src={course.image} alt={`${course.title} learning activity`} />
      </section>
      <section className="section two-column course-detail-grid">
        <article className="panel prose-panel">
          <h2>Course overview</h2><p>{course.description}</p>
          <h2>Learning outcomes</h2><ul className="tick-list">{course.learningOutcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
          <h2>Course team</h2><div className="instructor-inline"><img src={course.instructor?.image} alt={course.instructor?.name} /><div><strong>{course.instructor?.name}</strong><span>{course.instructor?.title}</span><p>{course.instructor?.biography}</p></div></div>
        </article>
        <aside className="panel registration-panel">
          <span className={`availability ${course.availableSeats <= 5 ? 'low' : ''}`}>{course.availableSeats} of {course.capacity} seats available</span>
          <h2>Select your timetable</h2>
          <Alert type="error">{error}</Alert>
          {schedules.length ? (
            <div className="schedule-options">{schedules.map((schedule) => (
              <label key={schedule._id} className={`schedule-option ${scheduleId === schedule._id ? 'selected' : ''}`}>
                <input type="radio" name="schedule" value={schedule._id} checked={scheduleId === schedule._id} onChange={() => setScheduleId(schedule._id)} />
                <strong>{schedule.mode}</strong><span>{schedule.days.join(' & ')}, {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}</span><span>Starts {date.format(new Date(schedule.startDate))}</span><small>{schedule.location}</small>
              </label>
            ))}</div>
          ) : <p className="empty-state">No active timetable is currently available for this course.</p>}
          <button className="btn primary full-width" type="button" onClick={handleAdd} disabled={busy || !schedules.length || course.availableSeats < 1 || user?.role === 'admin'}>{busy ? 'Adding course…' : user?.role === 'admin' ? 'Student account required' : course.availableSeats < 1 ? 'Course fully booked' : 'Add to course basket'}</button>
          <p className="form-help">{user?.role === 'admin' ? 'Use a student demonstration account to test the registration workflow.' : 'The selected course and timetable are stored in your server-managed session basket.'}</p>
        </aside>
      </section>
    </>
  );
}
