import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api, buildQuery } from '../services/api.js';
import { currency, date, formatTime, getErrorMessage } from '../utils/format.js';

export function BasketPage() {
  const { basket, user, refreshBasket, updateBasketItem, removeBasketItem, checkout } = useAuth();
  const [scheduleMap, setScheduleMap] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    refreshBasket().catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, [refreshBasket]);

  useEffect(() => {
    Promise.all(basket.items.map(async (item) => {
      const data = await api(`/schedules${buildQuery({ course: item.course._id })}`);
      return [item.course._id, data.items];
    })).then((entries) => setScheduleMap(Object.fromEntries(entries))).catch((err) => setError(getErrorMessage(err)));
  }, [basket.items]);

  const selectSchedule = async (courseId, scheduleId) => {
    setBusy(courseId); setError('');
    try { await updateBasketItem(courseId, scheduleId); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(''); }
  };

  const remove = async (courseId) => {
    setBusy(courseId); setError('');
    try { await removeBasketItem(courseId); setNotice('Course removed from the basket.'); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(''); }
  };

  const confirm = async () => {
    if (user?.role === 'admin') { setError('Administrator accounts cannot create student enrolments. Log in with a student account to test checkout.'); return; }
    if (!user) { navigate('/login', { state: { from: { pathname: '/basket' } } }); return; }
    setBusy('checkout'); setError(''); setNotice('');
    try {
      const data = await checkout();
      navigate('/registration-success', { state: { enrollments: data.enrollments } });
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(''); }
  };

  return (
    <>
      <Seo title="Course Basket" description="Select schedules and confirm LearnSphere course registrations." />
      <PageHero eyebrow="Course basket" title="Review your selected courses">Your basket is stored in the server session and remains available across page navigation.</PageHero>
      <section className="section">
        <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert><Alert type="error" onClose={() => setError('')}>{error}</Alert>
        {loading ? <Loading label="Loading your course basket…" /> : !basket.items.length ? (
          <div className="panel empty-basket"><h2>Your basket is empty</h2><p>Browse the course catalogue and add one or more available courses.</p><Link className="btn primary" to="/courses">Browse courses</Link></div>
        ) : (
          <div className="basket-layout">
            <div className="basket-list">{basket.items.map((item) => (
              <article className="basket-item" key={item.course._id}>
                <img src={item.course.image} alt={item.course.title} />
                <div className="basket-content"><div className="basket-heading"><div><span className="tag">{item.course.category?.name}</span><h2>{item.course.title}</h2><p>{item.course.instructor?.name}</p></div><strong>{currency.format(item.course.fee)}</strong></div>
                  <label>Choose timetable<select value={item.schedule?._id || ''} disabled={busy === item.course._id} onChange={(event) => selectSchedule(item.course._id, event.target.value)}><option value="">Select a schedule</option>{(scheduleMap[item.course._id] || []).map((schedule) => <option key={schedule._id} value={schedule._id}>{schedule.mode} — {schedule.days.join(' & ')} {formatTime(schedule.startTime)} — starts {date.format(new Date(schedule.startDate))}</option>)}</select></label>
                  <button className="small-link button-link" type="button" onClick={() => remove(item.course._id)} disabled={busy === item.course._id}>{busy === item.course._id ? 'Updating…' : 'Remove course'}</button>
                </div>
              </article>
            ))}</div>
            <aside className="panel basket-summary"><h2>Registration summary</h2><div><span>Selected courses</span><strong>{basket.count}</strong></div><div><span>Course fees</span><strong>{currency.format(basket.subtotal)}</strong></div><p>One database seat will be reserved for each course when registration is confirmed.</p><button className="btn primary full-width" type="button" disabled={busy === 'checkout' || basket.items.some((item) => !item.schedule) || user?.role === 'admin'} onClick={confirm}>{busy === 'checkout' ? 'Confirming registration…' : user?.role === 'admin' ? 'Student account required' : user ? 'Confirm registration' : 'Log in to confirm'}</button>{basket.items.some((item) => !item.schedule) ? <p className="validation-note">Select a schedule for every course.</p> : user?.role === 'admin' ? <p className="validation-note">Administrator accounts cannot create student enrolments.</p> : null}</aside>
          </div>
        )}
      </section>
    </>
  );
}
