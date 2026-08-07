import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
export function NotFoundPage() { return <section className="section not-found"><Seo title="Page Not Found" /><span className="eyebrow">404 error</span><h1>Page not found</h1><p>The requested LearnSphere page does not exist.</p><Link className="btn primary" to="/">Return home</Link></section>; }
