import { PageHero } from '../components/PageHero.jsx';
import { Seo } from '../components/Seo.jsx';

export function AboutPage() {
  return (
    <><Seo title="About" description="Learn about the LearnSphere course registration system." /><PageHero eyebrow="About LearnSphere" title="Built around simple course access" image="/images/computer-science.png" imageAlt="Students taking part in a computer science class">LearnSphere brings course discovery, timetables, session management and database-backed registration into one accessible system.</PageHero><section className="section feature-split reverse"><div><span className="eyebrow">Our learning approach</span><h2>Practical, guided and transparent</h2><p>The course catalogue was first designed as a client-side project. Deliverable 2 incrementally improves it with React components, Node.js, Express.js, MongoDB, authentication, sessions and complete data operations.</p><ul className="tick-list"><li>Reusable responsive React interface</li><li>Normalised MongoDB references and validation</li><li>Routes, controllers, services and models separated clearly</li><li>Student and administrator workflows protected by role</li><li>Importable JSON data and documented assumptions</li></ul></div><img src="/images/instructor-training.png" alt="Instructor preparing a practical training session" /></section></>
  );
}
