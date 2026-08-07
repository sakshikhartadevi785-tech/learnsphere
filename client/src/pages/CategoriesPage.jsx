import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { api } from '../services/api.js';
import { getErrorMessage } from '../utils/format.js';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/categories'), api('/courses?limit=50')])
      .then(([categoryData, courseData]) => {
        setCategories(categoryData.items);
        setCounts(courseData.items.reduce((map, course) => ({ ...map, [course.category?._id]: (map[course.category?._id] || 0) + 1 }), {}));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title="Categories" description="Explore LearnSphere technology, business, design and management course categories." />
      <PageHero eyebrow="Categories" title="Learning categories">Browse database-backed categories and open the matching course catalogue.</PageHero>
      <section className="section">
        <Alert type="error">{error}</Alert>
        {loading ? <Loading label="Loading categories…" /> : (
          <div className="category-grid">{categories.map((category) => (
            <article className="category-card" key={category._id}><img src={category.image} alt={`${category.name} course category`} /><div><span className="tag">{counts[category._id] || 0} course{counts[category._id] === 1 ? '' : 's'}</span><h2>{category.name}</h2><p>{category.description}</p><Link to={`/courses?category=${category._id}`}>Explore {category.name}</Link></div></article>
          ))}</div>
        )}
      </section>
    </>
  );
}
