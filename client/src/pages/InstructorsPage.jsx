import { useEffect, useState } from 'react';
import { Alert } from '../components/Alert.jsx';
import { Loading } from '../components/Loading.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { api } from '../services/api.js';
import { getErrorMessage } from '../utils/format.js';

export function InstructorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api('/instructors').then((data) => setItems(data.items)).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }, []);
  return (
    <>
      <Seo title="Instructors" description="Meet the LearnSphere teaching team." />
      <PageHero eyebrow="Instructors" title="Meet the teaching team">Instructor profiles are populated from the related MongoDB instructor collection.</PageHero>
      <section className="section"><Alert type="error">{error}</Alert>{loading ? <Loading label="Loading instructor profiles…" /> : <div className="instructor-grid">{items.map((item) => <article className="instructor-card" key={item._id}><img src={item.image} alt={item.name} /><h2>{item.name}</h2><p><strong>{item.title}</strong></p><p>{item.biography}</p><span>{item.specialisation}</span></article>)}</div>}</section>
    </>
  );
}
