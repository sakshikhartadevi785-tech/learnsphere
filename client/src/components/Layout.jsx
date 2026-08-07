import { Outlet } from 'react-router-dom';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      <main id="main-content"><Outlet /></main>
      <Footer />
    </>
  );
}
