import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const links = [
  ['/', 'Home'],
  ['/courses', 'Courses'],
  ['/categories', 'Categories'],
  ['/schedule', 'Schedule'],
  ['/instructors', 'Instructors'],
  ['/fees', 'Fees'],
  ['/dashboard', 'Dashboard'],
  ['/contact', 'Contact']
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, basket, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="notice-bar">
        <span>New July intake open</span>
        <span>Flexible weekday and weekend classes</span>
        <span>Secure session course basket</span>
      </div>
      <div className="nav-shell">
        <Link className="brand" to="/" aria-label="LearnSphere home" onClick={() => setOpen(false)}>
          <img src="/images/logo.png" alt="LearnSphere logo" />
          <span><strong>LearnSphere</strong><small>Online Course Registration</small></span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        ><span /><span /><span /></button>
        <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Main navigation">
          {links.filter(([to]) => !(to === '/dashboard' && user?.role === 'admin')).map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >{label}</NavLink>
          ))}
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>Admin</NavLink>
          ) : null}
        </nav>
        <div className="header-actions">
          {user?.role !== 'admin' ? (
            <Link className="basket-link" to="/basket" aria-label={`Course basket with ${basket.count} item${basket.count === 1 ? '' : 's'}`}>
              Basket <span>{basket.count}</span>
            </Link>
          ) : null}
          {user ? (
            <button className="nav-cta button-reset" type="button" onClick={handleLogout}>Log out</button>
          ) : (
            <Link className="nav-cta" to="/login">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
