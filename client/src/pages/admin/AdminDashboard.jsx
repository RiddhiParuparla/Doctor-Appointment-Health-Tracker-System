import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Activity, 
  TrendingUp, 
  UserCheck, 
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {

  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: stats?.appointmentsPerDay?.map(d => d._id) || [],
    datasets: [{
      label: 'System Load',
      data: stats?.appointmentsPerDay?.map(d => d.count) || [],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { grid: { display: false } }
    }
  };

  if (loading) return <div className="animate-pulse p-8">Loading System Analytics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h1>
        <p className="text-gray-500 font-medium italic">HealthTrack Central Command & System-wide Analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-indigo-600" />} label="Total Patients" value={stats?.totalPatients} color="indigo" />
        <StatCard icon={<Stethoscope className="text-emerald-600" />} label="Total Doctors" value={stats?.totalDoctors} color="emerald" />
        <StatCard icon={<Calendar className="text-amber-600" />} label="Total Appointments" value={stats?.totalAppointments} color="amber" />
        <StatCard icon={<Activity className="text-indigo-600" />} label="Active Sessions" value={stats?.totalUsers} color="indigo" growth="+12%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader 
            title="Appointment Frequency" 
            icon={<TrendingUp className="text-indigo-600" />}
          />
          <CardContent className="h-64 mt-4">
            <Line data={chartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader 
            title="Recent Activity" 
            icon={<Clock className="text-gray-400" />}
          />
          <CardContent className="space-y-6">
            {stats?.recentActivity?.map(item => (
              <div key={item.id} className="flex items-start gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    item.type === 'warning' ? 'bg-red-500' : 
                    item.type === 'doctor' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} />
                <div>
                  <p className="text-xs font-bold text-gray-900">{item.text}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                    {item.rawTime ? formatDistanceToNow(new Date(item.rawTime), { addSuffix: true }) : item.time}
                  </p>
                </div>

              </div>
            ))}
            <Button variant="secondary" className="w-full text-[10px] font-black uppercase tracking-widest py-3 mt-4" icon={ArrowRight}>View Full Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, growth }) {
  return (
    <Card className="border-none shadow-xl shadow-gray-100/50">
      <CardContent className="flex items-center gap-6">
        <div className={`p-4 bg-${color}-50 rounded-2xl`}>{icon}</div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">{value}</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            {label}
            {growth && <span className="text-emerald-500 text-[10px]">{growth}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
