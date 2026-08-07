import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { api } from '../services/api.js';
import { currency, getErrorMessage } from '../utils/format.js';

export function FeesPage() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [material, setMaterial] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api('/courses?limit=50&sort=fee-asc').then((data) => { setCourses(data.items); setCourseId(data.items[0]?._id || ''); }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }, []);
  const selected = courses.find((course) => course._id === courseId);
  const values = useMemo(() => {
    const courseFee = selected?.fee || 0;
    const subtotal = courseFee + Number(material);
    const saving = subtotal * Number(discount) / 100;
    return { courseFee, subtotal, saving, total: subtotal - saving };
  }, [selected, material, discount]);
  return (
    <>
      <Seo title="Course Fees" description="Estimate LearnSphere course costs using live database fee records." />
      <PageHero eyebrow="Fees" title="Course fee estimator">Course fees are read from MongoDB; the final amount is also verified by the server during registration.</PageHero>
      <section className="section two-column">
        <div className="panel form-card calculator">
          <h2>Estimate fees</h2><Alert type="error">{error}</Alert>
          {loading ? <Loading label="Loading course fees…" /> : <>
            <label>Course package<select value={courseId} onChange={(event) => setCourseId(event.target.value)}>{courses.map((course) => <option key={course._id} value={course._id}>{course.title} — {currency.format(course.fee)}</option>)}</select></label>
            <label>Learning material<select value={material} onChange={(event) => setMaterial(Number(event.target.value))}><option value="0">Digital material included — £0</option><option value="45">Printed workbook — £45</option><option value="75">Workbook and exam practice — £75</option></select></label>
            <label>Illustrative discount<select value={discount} onChange={(event) => setDiscount(Number(event.target.value))}><option value="0">No discount</option><option value="10">Student discount — 10%</option><option value="15">Early registration — 15%</option></select></label>
          </>}
        </div>
        <div className="panel total-panel"><h2>Estimated total</h2><strong>{currency.format(values.total)}</strong><p>Course {currency.format(values.courseFee)} + materials {currency.format(Number(material))} − illustrative saving {currency.format(values.saving)}.</p><p className="form-help">The demonstration checkout charges the authoritative course fee stored in the database. Discounts shown here are estimates only.</p>{selected ? <Link to={`/courses/${selected.slug}`} className="btn secondary">Continue to course</Link> : null}</div>
      </section>
      <section className="section pricing-grid"><article><h2>Starter</h2><strong>from £160</strong><p>Short courses for study confidence and digital foundations.</p></article><article><h2>Professional</h2><strong>from £280</strong><p>Career-focused certificates with practical project work.</p></article><article><h2>Advanced</h2><strong>from £540</strong><p>Longer evening programmes for working professionals.</p></article></section>
    </>
  );
}
