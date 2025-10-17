
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Users, Clock } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

const KpiCard = ({ title, value, icon: Icon }: KpiCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="p-3 bg-indigo-500 text-white rounded-full">
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ today: 0, users: 0 });
  const [latest, setLatest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch stats
        const { count: todayCount } = await supabase
          .from('asistencias')
          .select('*' , { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString());

        const { count: usersCount } = await supabase
          .from('perfiles')
          .select('*' , { count: 'exact', head: true });

        const { data: latestData, error: latestError } = await supabase
          .from('asistencias')
          .select('created_at, session, perfiles!inner(nombres,apellidos)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (latestError) throw latestError;

        setStats({ today: todayCount || 0, users: usersCount || 0 });
        setLatest(latestData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Asistencias del Día" value={loading ? '...' : stats.today} icon={Calendar} />
        <KpiCard title="Usuarios Registrados" value={loading ? '...' : stats.users} icon={Users} />
        <KpiCard title="Última Sesión" value={loading ? '...' : latest[0]?.session || 'N/A'} icon={Clock} />
      </div>

      {/* Latest Records */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Últimos Registros</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesión</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-4">Cargando...</td></tr>
              ) : latest.length > 0 ? (
                latest.map((rec, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.perfiles.nombres} {rec.perfiles.apellidos}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.created_at).toLocaleTimeString('es-ES')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.session}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-center py-4">No hay registros recientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
