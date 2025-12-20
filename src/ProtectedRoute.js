import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute() {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
