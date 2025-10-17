
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Home() {
  const { loading, session, profile } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // Or a spinner component
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (profile) {
    if (profile.roles_usuarios?.nombre === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/me" replace />;
  }

  // If we get here, loading is false, session exists, but profile is null.
  // This is the error state.
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Autenticación</h1>
        <p className="text-gray-700">
          No se pudo cargar tu perfil. Esto puede deberse a un problema con los permisos de tu cuenta.
          Por favor, contacta a un administrador.
        </p>
      </div>
    </div>
  );
}
