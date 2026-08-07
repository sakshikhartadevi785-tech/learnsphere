import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Link className="footer-brand" to="/"><img src="/images/logo.png" alt="LearnSphere logo" /><span>LearnSphere</span></Link>
          <p>Course discovery, secure registration and learner support powered by a React interface, Express API and MongoDB data.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link to="/courses">Courses</Link>
          <Link to="/basket">Course Basket</Link>
          <Link to="/fees">Fees</Link>
          <Link to="/schedule">Schedule</Link>
        </div>
        <div>
          <h3>Support</h3>
          <Link to="/faq">FAQs</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/dashboard">Learner Dashboard</Link>
          <Link to="/about">About</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <p>admissions@learnsphere.example<br />+44 020 0000 1245<br />Monday to Saturday, 9:00 AM–6:00 PM</p>
        </div>
      </div>
      <div className="footer-bottom"><p>&copy; 2026 LearnSphere. Academic demonstration system.</p></div>
    </footer>
  );
}
