import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Define which view is active
type AuthView = 'login' | 'register' | 'forgot_password';

export default function Auth() {
  const { session, roles, faculties, careers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<AuthView>('login');

  // Common form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration form fields
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [id_rol, setIdRol] = useState<string>('');
  const [id_facultad, setIdFacultad] = useState<string>('');
  const [id_carrera, setIdCarrera] = useState<string>('');

  // Derived state for dependent dropdown
  const filteredCareers = useMemo(() => {
    if (!id_facultad) return [];
    return careers.filter(c => c.id_facultad === id_facultad);
  }, [id_facultad, careers]);

  // Redirect if user is already logged in
  if (session) {
    return <Navigate to="/" />;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('¡Inicio de sesión exitoso!');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id_rol || !id_facultad || !id_carrera) {
        toast.error('Por favor, completa todos los campos.');
        return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
        toast.error('No se pudo crear el usuario. Inténtalo de nuevo.');
        setLoading(false);
        return;
    }

    const { error: profileError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      nombres,
      apellidos,
      correo_institucional: email,
      id_rol,
      id_facultad,
      id_carrera,
    });

    if (profileError) {
      toast.error(`Error creando el perfil: ${profileError.message}`);
    } else {
      toast.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
      setView('login'); // Switch to login view after successful registration
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password', // URL to redirect to after email confirmation
    });

    if (error) {
        toast.error(error.message);
    } else {
        toast.success('Se ha enviado un enlace de recuperación a tu correo.');
        setView('login');
    }
    setLoading(false);
  };


  const renderForm = () => {
    switch (view) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Correo Electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
            <div className="text-center mt-4">
                <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot_password'); }} className="text-sm text-indigo-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                </a>
            </div>
          </form>
        );
      case 'register':
        return (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Nombres</label>
                    <input type="text" value={nombres} onChange={e => setNombres(e.target.value)} className="input" required />
                </div>
                <div>
                    <label className="label">Apellidos</label>
                    <input type="text" value={apellidos} onChange={e => setApellidos(e.target.value)} className="input" required />
                </div>
            </div>
            <div>
              <label className="label">Correo Electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder='Debe tener al menos 6 caracteres' required />
            </div>
            <div>
                <label className="label">Rol</label>
                <select value={id_rol} onChange={e => setIdRol(e.target.value)} className="input" required>
                    <option value="" disabled>Selecciona un rol</option>
                    {roles.map(rol => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
                </select>
            </div>
            <div>
                <label className="label">Facultad</label>
                <select value={id_facultad} onChange={e => { setIdFacultad(e.target.value); setIdCarrera(''); }} className="input" required>
                    <option value="" disabled>Selecciona una facultad</option>
                    {faculties.map(fac => <option key={fac.id} value={fac.id}>{fac.nombre}</option>)}
                </select>
            </div>
            <div>
                <label className="label">Carrera</label>
                <select value={id_carrera} onChange={e => setIdCarrera(e.target.value)} className="input" required disabled={!id_facultad}>
                    <option value="" disabled>Selecciona una carrera</option>
                    {filteredCareers.map(car => <option key={car.id} value={car.id}>{car.nombre}</option>)}
                </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        );
        case 'forgot_password':
            return (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                        <label className="label">Correo Electrónico</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                    </button>
                </form>
            );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="flex border-b mb-6">
          <button 
            onClick={() => setView('login')} 
            className={`flex-1 py-2 text-center font-medium ${view === 'login' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
            Iniciar Sesión
          </button>
          <button 
            onClick={() => setView('register')} 
            className={`flex-1 py-2 text-center font-medium ${view === 'register' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
            Registro
          </button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
}