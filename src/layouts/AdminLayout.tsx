
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, QrCode, Users, ClipboardList, LogOut } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scanner', label: 'Escanear QR', icon: QrCode },
  { href: '/users', label: 'Usuarios', icon: Users },
  { href: '/attendance', label: 'Asistencias', icon: ClipboardList },
];

const AdminLayout = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const getPageTitle = () => {
    return navLinks.find(link => link.href === location.pathname)?.label || 'Admin';
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-bold">AsistenciaApp</div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${location.pathname === link.href ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
              <link.icon className="w-5 h-5 mr-3" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin: {profile?.full_name || 'Usuario'}</span>
              <button onClick={handleLogout} className="flex items-center text-sm text-gray-600 hover:text-red-600">
                <LogOut className="w-4 h-4 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
