import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../services/api.js';
import { currency, date, formatTime, getErrorMessage } from '../utils/format.js';

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api('/enrollments/dashboard').then(setData).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }, []);
  return (
    <>
      <Seo title="Student Dashboard" description="View your personal LearnSphere registration and progress records." />
      <PageHero eyebrow="Learner dashboard" title={`Welcome, ${user?.firstName || 'student'}`}>This protected page displays only the registrations linked to your authenticated user account.</PageHero>
      <section className="section">
        <Alert type="error">{error}</Alert>
        {loading ? <Loading label="Loading your learner records…" /> : data ? <>
          <div className="dashboard-grid">
            <article className="metric-card"><span>Total registrations</span><strong>{data.summary.totalEnrollments}</strong><p>All course enrolments</p></article>
            <article className="metric-card"><span>Active courses</span><strong>{data.summary.activeEnrollments}</strong><p>Confirmed or pending</p></article>
            <article className="metric-card"><span>Average progress</span><strong>{data.summary.averageProgress}%</strong><p>Across registered courses</p></article>
            <article className="metric-card"><span>Total paid</span><strong>{currency.format(data.summary.totalPaid)}</strong><p>Recorded course fees</p></article>
          </div>
          <div className="section-heading dashboard-heading"><span className="eyebrow">My courses</span><h2>Registration records</h2></div>
          {data.enrollments.length ? <div className="enrollment-grid">{data.enrollments.map((item) => (
            <article className="panel enrollment-card" key={item._id}><div className="enrollment-top"><img src={item.course?.image} alt={item.course?.title} /><div><span className={`status-badge status-${item.status}`}>{item.status}</span><h2>{item.course?.title}</h2><p>{item.course?.code} · {item.course?.instructor?.name}</p></div></div><dl className="details-list"><div><dt>Reference</dt><dd>{item.registrationReference}</dd></div><div><dt>Schedule</dt><dd>{item.schedule?.days?.join(' & ')}, {formatTime(item.schedule?.startTime)}–{formatTime(item.schedule?.endTime)}</dd></div><div><dt>Starts</dt><dd>{item.schedule?.startDate ? date.format(new Date(item.schedule.startDate)) : 'Not set'}</dd></div><div><dt>Payment</dt><dd>{currency.format(item.amount)} · {item.paymentStatus}</dd></div></dl><div className="progress-block"><div><span>Progress</span><strong>{item.progress}%</strong></div><div className="progress-track"><i style={{ width: `${item.progress}%` }} /></div><div><span>Attendance</span><strong>{item.attendance}%</strong></div><div className="progress-track"><i style={{ width: `${item.attendance}%` }} /></div></div></article>
          ))}</div> : <div className="panel empty-basket"><h2>No registrations yet</h2><p>Add a course to your basket and confirm registration to populate your dashboard.</p><Link className="btn primary" to="/courses">Browse courses</Link></div>}
        </> : null}
      </section>
    </>
  );
}
