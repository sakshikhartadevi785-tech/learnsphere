import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { api } from '../services/api.js';
import { date, formatTime, getErrorMessage } from '../utils/format.js';

export function SchedulePage() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api('/schedules').then((data) => setItems(data.items)).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => mode === 'All' ? items : items.filter((item) => item.mode === mode), [items, mode]);
  return (
    <>
      <Seo title="Class Schedule" description="View current LearnSphere course schedules and delivery modes." />
      <PageHero eyebrow="Schedule" title="Class timetable">Filter current online, campus and weekend schedule records from the database.</PageHero>
      <section className="section">
        <div className="tool-row"><div className="filter-group" aria-label="Filter timetable by delivery mode">{['All','Online','On campus','Weekend'].map((item) => <button key={item} className={`filter-btn ${mode === item ? 'active' : ''}`} type="button" onClick={() => setMode(item)}>{item}</button>)}</div></div>
        <Alert type="error">{error}</Alert>
        {loading ? <Loading label="Loading class schedules…" /> : visible.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Course</th><th>Mode</th><th>Days</th><th>Time</th><th>Start date</th><th>Location</th></tr></thead><tbody>{visible.map((item) => <tr key={item._id}><td><Link className="small-link" to={`/courses/${item.course?.slug}`}>{item.course?.title}</Link><small className="table-subtext">{item.course?.code}</small></td><td><span className="status-badge">{item.mode}</span></td><td>{item.days.join(', ')}</td><td>{formatTime(item.startTime)}–{formatTime(item.endTime)}</td><td>{date.format(new Date(item.startDate))}</td><td>{item.location}</td></tr>)}</tbody></table></div> : <p className="empty-state">No schedules match the selected delivery mode.</p>}
      </section>
    </>
  );
}
