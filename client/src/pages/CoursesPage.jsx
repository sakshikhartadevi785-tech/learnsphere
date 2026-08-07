import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { CourseCard } from '../components/CourseCard.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api, buildQuery } from '../services/api.js';
import { getErrorMessage } from '../utils/format.js';

export function CoursesPage() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: searchParams.get('search') || '', category: searchParams.get('category') || '', level: searchParams.get('level') || '', sort: searchParams.get('sort') || 'title', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');
  const { addToBasket, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api('/categories').then((data) => setCategories(data.items)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      api(`/courses${buildQuery({ ...filters, limit: 6 })}`)
        .then((data) => { setCourses(data.items); setPagination(data.pagination); })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, filters.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value, page: name === 'page' ? value : 1 }));

  const handleAdd = async (course) => {
    setBusyId(course._id); setError(''); setNotice('');
    try {
      await addToBasket(course._id);
      setNotice(`${course.title} was added to your course basket.`);
    } catch (err) {
      if (err.status === 409 && String(err.message).includes('already')) navigate('/basket');
      else setError(getErrorMessage(err));
    } finally { setBusyId(''); }
  };

  return (
    <>
      <Seo title="Courses" description="Search live LearnSphere course records by category, level and fee." />
      <PageHero eyebrow="Courses" title="Explore available courses">Search practical learning tracks populated from the MongoDB course collection.</PageHero>
      <section className="section" aria-labelledby="course-list-heading">
        <div className="section-heading split-heading"><div><span className="eyebrow">Course catalogue</span><h2 id="course-list-heading">Find a course that matches your goal</h2></div><p>{pagination.total} active course{pagination.total === 1 ? '' : 's'} currently available.</p></div>
        <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>
        <Alert type="error" onClose={() => setError('')}>{error}</Alert>
        <div className="tool-row filters-panel">
          <label className="search-box"><span>Search courses</span><input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} type="search" placeholder="Title, code or description" /></label>
          <label><span>Category</span><select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
          <label><span>Level</span><select value={filters.level} onChange={(event) => updateFilter('level', event.target.value)}><option value="">All levels</option>{['Starter','Beginner','Intermediate','Advanced'].map((level) => <option key={level}>{level}</option>)}</select></label>
          <label><span>Sort</span><select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="title">Title</option><option value="fee-asc">Fee: low to high</option><option value="fee-desc">Fee: high to low</option><option value="duration">Duration</option><option value="newest">Newest</option></select></label>
        </div>
        {loading ? <Loading label="Loading course records…" /> : courses.length ? (
          <><div className="course-grid">{courses.map((course) => <CourseCard key={course._id} course={course} onAdd={user?.role === 'admin' ? undefined : handleAdd} busy={busyId === course._id} />)}</div>
          <div className="pagination" aria-label="Course catalogue pages"><button type="button" className="btn ghost" disabled={pagination.page <= 1} onClick={() => updateFilter('page', pagination.page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.pages}</span><button type="button" className="btn ghost" disabled={pagination.page >= pagination.pages} onClick={() => updateFilter('page', pagination.page + 1)}>Next</button></div></>
        ) : <p className="empty-state">No matching courses found. Change one or more filters.</p>}
      </section>
    </>
  );
}
