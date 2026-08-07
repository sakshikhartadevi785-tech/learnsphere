import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getErrorMessage } from '../utils/format.js';

export function RegisterAccountPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('Password confirmation does not match.'); return; }
    setBusy(true);
    try { const { confirmPassword, ...payload } = form; await register(payload); navigate('/basket'); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  return (
    <>
      <Seo title="Create Account" description="Create a LearnSphere student account for course registration." />
      <PageHero eyebrow="Student account" title="Create your LearnSphere account">Account details are validated by the API and the password is protected with a salted scrypt hash.</PageHero>
      <section className="section auth-shell"><form className="panel form-card auth-card wide" onSubmit={submit}><h2>Student details</h2><Alert type="error">{error}</Alert><div className="form-grid"><label>First name<input name="firstName" value={form.firstName} onChange={update} required minLength="2" maxLength="50" autoComplete="given-name" /></label><label>Last name<input name="lastName" value={form.lastName} onChange={update} required minLength="2" maxLength="50" autoComplete="family-name" /></label><label>Email address<input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></label><label>Phone number<input name="phone" value={form.phone} onChange={update} maxLength="30" autoComplete="tel" /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} required minLength="8" maxLength="72" autoComplete="new-password" aria-describedby="passwordHelp" /></label><label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required minLength="8" maxLength="72" autoComplete="new-password" /></label></div><p id="passwordHelp" className="form-help">Use 8–72 characters with an uppercase letter, lowercase letter and number.</p><button className="btn primary full-width" disabled={busy}>{busy ? 'Creating account…' : 'Create student account'}</button><p>Already registered? <Link className="small-link" to="/login">Log in</Link></p></form></section>
    </>
  );
}
