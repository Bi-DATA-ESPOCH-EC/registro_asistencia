import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && profile && (!profile.roles_usuarios?.nombre || !allowedRoles.includes(profile.roles_usuarios.nombre))) {
    // Redirect if user role is not allowed
    return <Navigate to="/me" replace />;
  }

  return <Outlet />;
};
