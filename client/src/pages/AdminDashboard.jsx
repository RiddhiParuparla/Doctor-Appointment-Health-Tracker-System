import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  TrendingUp, 
  Trash2, 
  ShieldCheck, 
  Search,
  Activity,
  UserCheck
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, appointmentsPerDay: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [resStats, resUsers] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users')
      ]);
      setStats(resStats.data);
      setUsers(resUsers.data);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user? This action is permanent.')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const chartData = {
    labels: stats.appointmentsPerDay.map(d => d._id),
    datasets: [
      {
        label: 'Appointments',
        data: stats.appointmentsPerDay.map(d => d.count),
        backgroundColor: '#4F46E5',
        borderRadius: 8,
      }
    ],
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Administration</h1>
          <p className="text-gray-500 font-medium">Global oversight of doctors, patients, and system performance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={ShieldCheck}>Security Audit</Button>
          <Button icon={TrendingUp}>Export Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
          <CardContent className="flex items-center gap-5">
            <div className="p-3 bg-white/20 rounded-xl"><Users size={32} /></div>
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Total Patients</p>
              <h3 className="text-3xl font-black">{stats.totalPatients}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600 text-white border-none shadow-xl shadow-emerald-100">
          <CardContent className="flex items-center gap-5">
            <div className="p-3 bg-white/20 rounded-xl"><Stethoscope size={32} /></div>
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Active Doctors</p>
              <h3 className="text-3xl font-black">{stats.totalDoctors}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white border-none shadow-xl">
          <CardContent className="flex items-center gap-5">
            <div className="p-3 bg-white/20 rounded-xl"><Calendar size={32} /></div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Global Appts</p>
              <h3 className="text-3xl font-black">{stats.totalAppointments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Appointment Momentum (Last 7 Days)
            </h3>
          </CardHeader>
          <CardContent className="h-[350px]">
            {stats.appointmentsPerDay.length > 0 ? (
                <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">No time-series data available yet.</div>
            )}
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <h3 className="text-lg font-bold">Quick User Control</h3>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by name/email..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             
             <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.map(user => (
                   <div key={user._id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-50 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${user.role === 'doctor' ? 'bg-indigo-100 text-primary' : 'bg-emerald-100 text-secondary'}`}>
                            {user.role.charAt(0).toUpperCase()}
                         </div>
                         <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                         </div>
                      </div>
                      {user.role !== 'admin' && (
                         <button 
                            onClick={() => deleteUser(user._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                         >
                            <Trash2 size={14} />
                         </button>
                      )}
                   </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
