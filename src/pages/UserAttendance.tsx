
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// Define a type for attendance records
type Attendance = {
  id: number;
  created_at: string;
  session: string;
  type: string;
};

export default function UserAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [sessionFilter, setSessionFilter] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      setLoading(true);
      let query = supabase
        .from('asistencias')
        .select('id, created_at, session, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dateFilter.start) {
        query = query.gte('created_at', dateFilter.start);
      }
      if (dateFilter.end) {
        query = query.lte('created_at', `${dateFilter.end} 23:59:59`);
      }
      if (sessionFilter) {
        query = query.eq('session', sessionFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendance:', error);
      } else {
        setAttendance(data as Attendance[]);
      }
      setLoading(false);
    };

    fetchAttendance();
  }, [user, dateFilter, sessionFilter]);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
        date: date.toLocaleDateString('es-ES'),
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Mi Historial de Asistencia</h2>
      
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="date" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} className="input" />
        <input type="date" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} className="input" />
        <select value={sessionFilter} onChange={e => setSessionFilter(e.target.value)} className="input">
          <option value="">Todas las Sesiones</option>
          <option value="A">Sesión A</option>
          <option value="B">Sesión B</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sesión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
            ) : attendance.length > 0 ? (
              attendance.map(record => {
                const { date, time } = formatDateTime(record.created_at);
                return (
                    <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{time}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.session}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.type}</td>
                    </tr>
                )
              })
            ) : (
              <tr><td colSpan={4} className="text-center py-4">No hay registros de asistencia.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simple input style for filters
const styles = `
.input {
    display: block;
    width: 100%;
    padding: 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    border: 1px solid #D1D5DB;
}
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
