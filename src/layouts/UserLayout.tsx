
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const UserLayout = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Portal de Usuario</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Hola, {profile?.nombres || 'Usuario'}</span>
            <button 
              onClick={handleLogout} 
              className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow-sm mb-4">
          <nav className="flex space-x-4">
            <Link to="/me" className="text-gray-600 hover:text-indigo-600">Mi Perfil</Link>
            <Link to="/me/attendance" className="text-gray-600 hover:text-indigo-600">Mis Asistencias</Link>
          </nav>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
