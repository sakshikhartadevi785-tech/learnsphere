import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getErrorMessage } from '../utils/format.js';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const data = await login(form); navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true }); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  return (
    <>
      <Seo title="Log In" description="Log in to your LearnSphere student or administrator account." />
      <PageHero eyebrow="Secure access" title="Log in to LearnSphere">A server-side session protects personal dashboard and administration data.</PageHero>
      <section className="section auth-shell"><form className="panel form-card auth-card" onSubmit={submit}><h2>Account login</h2><Alert type="error">{error}</Alert><label>Email address<input type="email" required autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input type="password" required autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><button className="btn primary full-width" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button><p>New student? <Link className="small-link" to="/register-account">Create an account</Link></p><div className="demo-credentials"><strong>Demonstration accounts</strong><code>student@learnsphere.test / Student123!</code><code>admin@learnsphere.test / Admin123!</code></div></form></section>
    </>
  );
}
