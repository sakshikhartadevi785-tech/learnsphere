import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { BasketPage } from './pages/BasketPage.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { CourseDetailsPage } from './pages/CourseDetailsPage.jsx';
import { CoursesPage } from './pages/CoursesPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { FaqPage } from './pages/FaqPage.jsx';
import { FeesPage } from './pages/FeesPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { InstructorsPage } from './pages/InstructorsPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { RegisterAccountPage } from './pages/RegisterAccountPage.jsx';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage.jsx';
import { SchedulePage } from './pages/SchedulePage.jsx';

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:slug" element={<CourseDetailsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="instructors" element={<InstructorsPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="basket" element={<BasketPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register-account" element={<RegisterAccountPage />} />
          <Route path="registration-success" element={<ProtectedRoute role="student"><RegistrationSuccessPage /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute role="student"><DashboardPage /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
