import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Loading } from './Loading.jsx';

export function ProtectedRoute({ children, role }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) return <main className="section"><Loading label="Checking your session…" /></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}
