import { Link, useLocation } from 'react-router-dom';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { currency, date, formatTime } from '../utils/format.js';

export function RegistrationSuccessPage() {
  const { state } = useLocation();
  const enrollments = state?.enrollments || [];
  return (
    <>
      <Seo title="Registration Confirmed" description="Your LearnSphere course registration has been confirmed." />
      <PageHero eyebrow="Registration complete" title="Your place has been confirmed">The enrolment record was created and the available course seat count was reduced in MongoDB.</PageHero>
      <section className="section success-shell"><div className="panel success-panel"><span className="success-icon" aria-hidden="true">✓</span><h2>Registration successful</h2>{enrollments.length ? <div className="confirmation-list">{enrollments.map((item) => <article key={item._id}><h3>{item.course?.title}</h3><p><strong>Reference:</strong> {item.registrationReference}</p><p><strong>Fee:</strong> {currency.format(item.amount)}</p><p><strong>Schedule:</strong> {item.schedule?.days?.join(' & ')}, {formatTime(item.schedule?.startTime)}–{formatTime(item.schedule?.endTime)}</p><p><strong>Start date:</strong> {item.schedule?.startDate ? date.format(new Date(item.schedule.startDate)) : 'Not set'}</p></article>)}</div> : <p>Your registration details are available in your dashboard.</p>}<div className="hero-actions"><Link className="btn primary" to="/dashboard">Open dashboard</Link><Link className="btn secondary" to="/courses">Browse more courses</Link></div></div></section>
    </>
  );
}
