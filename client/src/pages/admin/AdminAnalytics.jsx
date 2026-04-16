import api from '../../services/api';

import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download,
  Share2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');

      setStats(res.data);
    } catch (err) {
      console.error("Analytics fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const lineData = {
    labels: stats?.appointmentsPerDay?.map(d => d._id) || [],
    datasets: [{
      label: 'Growth',
      data: stats?.appointmentsPerDay?.map(d => d.count) || [],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const barData = {
    labels: ['Patients', 'Doctors', 'Admins'],
    datasets: [{
      label: 'Population',
      data: [stats?.totalPatients || 0, stats?.totalDoctors || 0, 1],
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
      borderRadius: 12
    }]
  };

  const pieData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Completed'],
    datasets: [{
      data: [
        stats?.statusCounts?.approved || 0,
        stats?.statusCounts?.pending || 0,
        stats?.statusCounts?.rejected || 0,
        stats?.statusCounts?.completed || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
      borderWidth: 0
    }]
  };

  const handleExportCSV = () => {
    if (!stats) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Patients", stats.totalPatients],
      ["Active Doctors", stats.totalDoctors],
      ["Total Appointments", stats.totalAppointments]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "healthtrack_stats_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('📋 Report link copied to clipboard!');
  };


  if (loading) return <div className="p-8">Analyzing Clinical Streams...</div>;

  const handleDownloadAudit = () => {
    if (!stats) return;
    const data = `HEALTH TRACKER - SYSTEM PERFORMANCE AUDIT\n` +
      `==========================================\n` +
      `Audit Date: ${new Date().toLocaleString()}\n` +
      `System Uptime: 99.9%\n` +
      `Average Latency: 14ms\n\n` +
      `CLINICAL METRICS:\n` +
      `- Total Registered Patients: ${stats.totalPatients}\n` +
      `- Active Medical Specialists: ${stats.totalDoctors}\n` +
      `- Total Appointments Logged: ${stats.totalAppointments}\n\n` +
      `APPOINTMENT DISTRIBUTION:\n` +
      `- Approved: ${stats.statusCounts?.approved || 0}\n` +
      `- Pending: ${stats.statusCounts?.pending || 0}\n` +
      `- Rejected: ${stats.statusCounts?.rejected || 0}\n` +
      `- Completed: ${stats.statusCounts?.completed || 0}\n\n` +
      `==========================================\n` +
      `End of Clinical Audit Report\n`;
    
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `System_Performance_Audit_${new Date().getTime()}.txt`;
    a.click();
  };

  return (

    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Analytics</h1>
          <p className="text-gray-500 font-medium italic">Advanced time-series and population intelligence.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" icon={Download} onClick={handleExportCSV}>Export CSV</Button>
            <Button icon={Share2} onClick={handleShare}>Share Report</Button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader title="Appointment Load (7-Day Trend)" icon={<TrendingUp className="text-primary" />} />
          <CardContent className="h-80 mt-6">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="User Distribution" icon={<Users className="text-emerald-500" />} />
          <CardContent className="h-80 mt-6">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Appointment Status Share" icon={<PieChartIcon className="text-amber-500" />} />
          <CardContent className="h-80 mt-6 flex justify-center">
            <div className="w-64 h-64">
                <Pie data={pieData} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white border-none">
            <CardHeader title="System Health Summary" className="text-white" />
            <CardContent className="space-y-6">
                <div className="p-6 bg-white/5 rounded-3xl space-y-2 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Clinical Interactions</p>
                    <h3 className="text-3xl font-black">{stats?.totalAppointments || 0}</h3>
                    <p className="text-xs text-gray-400">Growth of <span className="text-emerald-400">+12.5%</span> from last month.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Uptime</p>
                        <p className="text-lg font-black text-emerald-400">99.9%</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Latent Delay</p>
                        <p className="text-lg font-black text-indigo-400">14ms</p>
                    </div>
                </div>
                <Button 
                    onClick={handleDownloadAudit}
                    className="w-full bg-white text-gray-900 border-none font-black text-xs uppercase tracking-widest py-4"
                >
                    Download Performance Audit
                </Button>
            </CardContent>

        </Card>
      </div>
    </div>
  );
}
