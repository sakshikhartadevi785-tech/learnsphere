import { useState } from 'react';
import { Alert } from '../components/Alert.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';
import { api } from '../services/api.js';
import { getErrorMessage } from '../utils/format.js';

export function ContactPage() {
  const initial = { name: '', email: '', subject: '', message: '' };
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const data = await api('/contact', { method: 'POST', body: form }); setNotice(data.message); setForm(initial); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  return (
    <>
      <Seo title="Contact Admissions" description="Send a database-backed enquiry to LearnSphere admissions." />
      <PageHero eyebrow="Contact" title="Contact admissions">Messages are validated by the API and stored for administrator review.</PageHero>
      <section className="section two-column">
        <form className="panel form-card" onSubmit={submit}><h2>Send a message</h2><Alert type="success">{notice}</Alert><Alert type="error">{error}</Alert><label>Your name<input name="name" value={form.name} onChange={update} required minLength="2" maxLength="100" /></label><label>Email address<input name="email" type="email" value={form.email} onChange={update} required /></label><label>Subject<input name="subject" value={form.subject} onChange={update} required minLength="3" maxLength="160" /></label><label>Message<textarea name="message" rows="7" value={form.message} onChange={update} required minLength="20" maxLength="2000" /></label><button className="btn primary" disabled={busy}>{busy ? 'Submitting message…' : 'Submit message'}</button></form>
        <aside className="panel contact-panel"><h2>Admissions office</h2><p><strong>Email</strong><br />admissions@learnsphere.example</p><p><strong>Telephone</strong><br />+44 020 0000 1245</p><p><strong>Opening hours</strong><br />Monday to Saturday, 9:00 AM–6:00 PM</p><p><strong>Address</strong><br />LearnSphere Professional Learning Centre<br />Birmingham, United Kingdom</p></aside>
      </section>
    </>
  );
}
