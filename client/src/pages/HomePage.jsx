import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { CourseCard } from '../components/CourseCard.jsx';
import { Loading } from '../components/Loading.jsx';
import { Seo } from '../components/Seo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../services/api.js';
import { getErrorMessage } from '../utils/format.js';

export function HomePage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courseTotal, setCourseTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const { addToBasket, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api('/courses?featured=true&limit=3'), api('/courses?limit=1'), api('/categories')])
      .then(([courseData, totalData, categoryData]) => {
        setCourses(courseData.items);
        setCourseTotal(totalData.pagination?.total || courseData.items.length);
        setCategories(categoryData.items);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (course) => {
    setBusyId(course._id);
    setError('');
    try {
      await addToBasket(course._id);
      navigate('/basket');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  };

  return (
    <>
      <Seo title="Home" description="Discover, select and register for practical LearnSphere courses." />
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Career-focused learning</span>
          <h1>Register for professional courses in a clear, secure way.</h1>
          <p>Browse live course data, select a timetable, keep choices in a server-managed session basket and confirm registration from one responsive application.</p>
          <div className="hero-actions">
            <Link className="btn primary" to="/courses">Explore Courses</Link>
            <Link className="btn secondary" to="/register-account">Create Student Account</Link>
          </div>
          <div className="stat-strip" aria-label="LearnSphere statistics">
            <strong>{courseTotal || '6+'}</strong><span>practical course routes</span>
            <strong>{categories.length || '4'}</strong><span>learning categories</span>
            <strong>3</strong><span>delivery modes</span>
          </div>
        </div>
        <div className="hero-media">
          <img src="/images/hero-campus.png" alt="Students walking on a modern learning campus" />
          <div className="floating-card"><strong>Database-connected registration</strong><span>Seats update when enrolment is confirmed</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><span className="eyebrow">How it works</span><h2>A complete registration journey</h2><p>Every stage is connected to the Express API and MongoDB database rather than hard-coded browser-only data.</p></div>
        <div className="cards-row">
          <article className="info-card"><span>01</span><h2>Choose your course</h2><p>Search by title, category, level or fee and open the complete course record.</p></article>
          <article className="info-card"><span>02</span><h2>Select a schedule</h2><p>Add a course to the session basket and choose a valid online, campus or weekend timetable.</p></article>
          <article className="info-card"><span>03</span><h2>Confirm registration</h2><p>Login, confirm enrolment and see the available seat count update in the database.</p></article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading split-heading"><div><span className="eyebrow">Featured courses</span><h2>Start with a practical learning track</h2></div><p>Course cards below are populated from MongoDB through the server-side API.</p></div>
        <Alert type="error">{error}</Alert>
        {loading ? <Loading label="Loading featured courses…" /> : (
          <div className="course-grid">{courses.map((course) => <CourseCard key={course._id} course={course} onAdd={user?.role === 'admin' ? undefined : handleAdd} busy={busyId === course._id} />)}</div>
        )}
        <div className="center-action"><Link className="btn secondary" to="/courses">View all courses</Link></div>
      </section>

      <section className="section feature-split">
        <img src="/images/student-laptop.png" alt="Student using a laptop for online learning" />
        <div><span className="eyebrow">Student control</span><h2>A real dashboard instead of sample content</h2><p>Logged-in students can view their own registration references, schedules, payments, progress and attendance.</p><ul className="tick-list"><li>Session-based login and logout</li><li>Server-side course basket</li><li>Protected learner and admin routes</li><li>Database-backed registration history</li></ul><Link className="btn primary" to="/dashboard">Open Dashboard</Link></div>
      </section>
    </>
  );
}
