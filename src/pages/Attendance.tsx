
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

// Define types
type AttendanceRecord = {
  created_at: string;
  session: string;
  type: string;
  profiles: {
    full_name: string;
    email: string;
    role: string;
    faculty: string;
    career: string;
  };
};

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start: '', end: '', session: '', role: '', faculty: '', career: '' });

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      let query = supabase
        .from('asistencias')
        .select('created_at, session, type, profiles(full_name, email, role, faculty, career)');

      // Apply filters
      if (filters.start) query = query.gte('created_at', filters.start);
      if (filters.end) query = query.lte('created_at', `${filters.end} 23:59:59`);
      if (filters.session) query = query.eq('session', filters.session);
      if (filters.role) query = query.eq('profiles.role', filters.role);
      if (filters.faculty) query = query.ilike('profiles.faculty', `%${filters.faculty}%`);
      if (filters.career) query = query.ilike('profiles.career', `%${filters.career}%`);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        toast.error('Error al cargar asistencias.');
        console.error(error);
      } else {
        setRecords(data as any);
      }
      setLoading(false);
    };

    fetchAttendance();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const exportToCsv = () => {
    if (records.length === 0) {
        toast.error("No hay datos para exportar.");
        return;
    }
    const headers = ['Nombre', 'Email', 'Fecha', 'Hora', 'Sesión', 'Tipo', 'Rol', 'Facultad', 'Carrera'];
    const rows = records.map(rec => [
        rec.profiles.full_name,
        rec.profiles.email,
        new Date(rec.created_at).toLocaleDateString('es-ES'),
        new Date(rec.created_at).toLocaleTimeString('es-ES'),
        rec.session,
        rec.type,
        rec.profiles.role,
        rec.profiles.faculty,
        rec.profiles.career
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'asistencias.csv';
    link.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Registros de Asistencia</h2>
        <button onClick={exportToCsv} className="btn-primary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <input type="date" name="start" value={filters.start} onChange={handleFilterChange} className="input" />
        <input type="date" name="end" value={filters.end} onChange={handleFilterChange} className="input" />
        <input type="text" name="faculty" placeholder="Facultad" value={filters.faculty} onChange={handleFilterChange} className="input" />
        <input type="text" name="career" placeholder="Carrera" value={filters.career} onChange={handleFilterChange} className="input" />
        <select name="session" value={filters.session} onChange={handleFilterChange} className="input">
            <option value="">Sesión</option><option value="A">A</option><option value="B">B</option>
        </select>
        <select name="role" value={filters.role} onChange={handleFilterChange} className="input">
            <option value="">Rol</option><option value="user">Usuario</option><option value="admin">Admin</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesión</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrera</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
                ) : records.length > 0 ? (
                    records.map((rec, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">{rec.profiles.full_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.created_at).toLocaleString('es-ES')}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{rec.session}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{rec.profiles.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{rec.profiles.career}</td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={5} className="text-center py-4">No se encontraron registros con los filtros actuales.</td></tr>
                )}
            </tbody>
            
        </table>
      </div>
    </div>
  );
}
