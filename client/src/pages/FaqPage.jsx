import { useState } from 'react';
import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';

const faqs = [
  ['Do I need an account before adding a course?', 'No. You can add courses to the server-managed session basket first. You must create an account or log in before confirming registration.'],
  ['What happens when I confirm registration?', 'The server checks your login, validates every selected schedule, prevents duplicate enrolment, creates the enrolment record and atomically reduces the available seat count.'],
  ['Can I register for the same course twice?', 'No. A unique database constraint and server-side validation prevent a student from registering for the same course more than once.'],
  ['How are passwords protected?', 'Passwords are never stored as plain text. The server creates a unique salt and derives a secure scrypt hash before saving the account.'],
  ['Can administrators edit courses?', 'Yes. The protected administration area supports creating, reading, updating and deactivating courses, categories, instructors and schedules.'],
  ['Does the site work on mobile devices?', 'Yes. Navigation, cards, forms, tables, dashboard panels and administration tools adapt to mobile, tablet and desktop widths.']
];

export function FaqPage() {
  const [open, setOpen] = useState(0);
  return <><Seo title="Frequently Asked Questions" description="Answers about LearnSphere accounts, registration and course management." /><PageHero eyebrow="Support" title="Registration questions">Find clear answers about accounts, sessions, schedules, payments and database updates.</PageHero><section className="section faq-list">{faqs.map(([question, answer], index) => <article key={question}><button className="faq-question" type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>{question}<span>{open === index ? '−' : '+'}</span></button><div className={`faq-answer ${open === index ? 'open' : ''}`}><p>{answer}</p></div></article>)}</section></>;
}
