import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button } from '../components/ui';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Scale, 
  Calendar, 
  FileText, 
  Plus, 
  AlertCircle,
  Download,
  Share2,
  ClipboardList
} from 'lucide-react';
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
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReportModal from '../components/ReportModal';


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

export default function HealthLibrary() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vitals');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [reports, setReports] = useState([]);
  const [searchParams] = useSearchParams();

  const patientId = searchParams.get('patientId');

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    if (user?.role === 'doctor' && !patientId) {
      setLoading(false);
      return;
    }
    
    try {
      const histUrl = patientId ? `/api/health/history/${patientId}` : '/api/health/history';
      const prescUrl = patientId ? `/api/prescriptions/doctor/view/${patientId}` : '/api/prescriptions/patient';
      const reportsUrl = patientId ? `/api/health/reports/${patientId}` : '/api/health/reports';

      // We use individual try-catches or settle all promises to prevent one failure from breaking everything
      const results = await Promise.allSettled([
        axios.get(histUrl),
        axios.get(prescUrl),
        axios.get(reportsUrl)
      ]);

      if (results[0].status === 'fulfilled') setHistory(results[0].value.data);
      else console.error("History fetch failed", results[0].reason);

      if (results[1].status === 'fulfilled') setPrescriptions(results[1].value.data);
      else console.error("Prescriptions fetch failed", results[1].reason);

      if (results[2].status === 'fulfilled') setReports(results[2].value.data);
      else console.error("Reports fetch failed", results[2].reason);

    } catch (err) {
      console.error("General fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = `HEALTH TRACKER - CLINICAL SUMMARY\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Patient: ${latest.patientId?.name || 'User'}\n\n` +
      `VITALS HISTORY:\n` +
      history.map(h => `${format(new Date(h.date), 'yyyy-mm-dd')}: BP ${h.bloodPressure}, Sugar ${h.sugarLevel}, Weight ${h.weight}kg`).join('\n') +
      `\n\nPRESCRIPTIONS:\n` +
      prescriptions.map(p => `Dr. ${p.doctorId?.userId?.name}: ${p.medicines.map(m => m.name).join(', ')}`).join('\n');
    
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthTracker_Summary_${latest.patientId?.name || 'User'}.txt`;
    a.click();
  };

  const latest = history[0] || {};
  
  const calculateBMI = (w) => (w / (1.75 * 1.75)).toFixed(1);
  const bmi = latest.weight ? calculateBMI(latest.weight) : '--';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { display: false } },
      x: { grid: { display: false } }
    }
  };

  const bpData = {
    labels: [...history].reverse().map(r => format(new Date(r.date), 'MMM d')),
    datasets: [{
      label: 'Systolic',
      data: [...history].reverse().map(r => parseInt(r.bloodPressure?.split('/')[0] || r.bloodPressure)),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const sugarData = {
    labels: [...history].reverse().map(r => format(new Date(r.date), 'MMM d')),
    datasets: [{
      label: 'Sugar Level',
      data: [...history].reverse().map(r => r.sugarLevel),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Safe specialist list generation
  const specialists = Array.from(new Set(prescriptions.map(p => p.doctorId?._id)))
    .filter(id => id) // remove nulls
    .map(id => prescriptions.find(p => p.doctorId?._id === id).doctorId);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
             {latest.patientId?.name || user?.name ? `${latest.patientId?.name || user?.name}'s History` : 'Health Library'}
          </h1>
          <p className="text-gray-500 font-medium italic">
             {latest.patientId?.email || user?.email ? `Reviewing records for ${latest.patientId?.email || user?.email}` : 'Your centralized medical history and digital health vault.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Download} onClick={handleExport}>Export All Data</Button>
            {(user?.role === 'patient' || (user?.role === 'doctor' && patientId)) && (
                <Button icon={Plus} onClick={() => setShowReportModal(true)}>Add New Report</Button>
            )}
        </div>


      </div>

      {user?.role === 'doctor' && !patientId ? (
          <div className="bg-indigo-50 border-2 border-dashed border-indigo-100 rounded-[40px] p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-primary shadow-sm">
                  <ClipboardList size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-900 leading-tight">No Patient Selected</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto">Please navigate to your <span className="text-primary font-bold">Appointments Hub</span> and select a patient to review their clinical history.</p>
              <Button onClick={() => window.location.href='/doctor/appointments'} className="mt-4">Go to Appointments</Button>
          </div>
      ) : (
          <>
            {/* Top Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Heart className="text-red-500" />} label="Blood Pressure" value={latest.bloodPressure || 'No Data'} color="red" time={latest.date} />
                <StatCard icon={<Activity className="text-amber-500" />} label="Sugar Level" value={`${latest.sugarLevel || '--'} mg/dL`} color="amber" time={latest.date} />
                <StatCard icon={<Scale className="text-blue-500" />} label="Body Weight" value={`${latest.weight || '--'} kg`} color="blue" time={latest.date} />
                <StatCard icon={<TrendingUp className="text-indigo-500" />} label="BMI Index" value={bmi} color="indigo" sub={bmi !== '--' ? (bmi < 25 ? 'Normal' : 'Overweight') : ''} />
            </div>

            {/* Emergency & Alerts Strip */}
            <div className="p-6 bg-red-50/50 rounded-[32px] border border-red-100/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4 text-left mr-auto">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Clinical Emergency Memo</p>
                        <p className="text-sm font-black text-gray-900 italic">
                             {typeof latest.patientId?.emergencyInfo === 'object' && latest.patientId?.emergencyInfo !== null
                                ? `Blood: ${latest.patientId.emergencyInfo.bloodGroup || 'Unspecified'} • Allergies: ${latest.patientId.emergencyInfo.allergies || 'None'}`
                                : (latest.patientId?.emergencyInfo || "No critical medical alerts or emergency contact registered.")}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="bg-white border-red-100 text-red-600 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest" icon={Heart}>Priority Vitals</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl w-fit">
                {['vitals', 'reports', 'history', 'emergency'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'vitals' && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader icon={<Heart className="text-primary" />} title="Blood Pressure Trend" />
                                <CardContent className="h-48 mt-4">
                                    <Line data={bpData} options={chartOptions} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader icon={<Activity className="text-amber-500" />} title="Sugar Level Trend" />
                                <CardContent className="h-48 mt-4">
                                    <Line data={sugarData} options={chartOptions} />
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader title="Recent Health Records" />
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <th className="pb-4 pt-2">Date</th>
                                                <th className="pb-4 pt-2">BP</th>
                                                <th className="pb-4 pt-2">Sugar</th>
                                                <th className="pb-4 pt-2">Weight</th>
                                                <th className="pb-4 pt-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(row => (
                                                <tr key={row._id} className="border-b border-gray-50/50 group hover:bg-gray-50/50 transition-all">
                                                    <td className="py-4 text-xs font-bold text-gray-900">{format(new Date(row.date), 'MMM dd, yyyy')}</td>
                                                    <td className="py-4 text-xs text-gray-600">{row.bloodPressure}</td>
                                                    <td className="py-4 text-xs text-gray-600">{row.sugarLevel} mg/dL</td>
                                                    <td className="py-4 text-xs text-gray-600">{row.weight} kg</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black capitalize ${
                                                            row.riskLevel === 'red' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                        }`}>{row.riskLevel}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                        </>
                    )}

                    {activeTab === 'reports' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reports.length > 0 ? reports.map(report => (
                                <Card key={report._id} className="group hover:border-primary transition-all duration-300">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 bg-gray-50 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <span className="px-2 py-1 bg-gray-50 text-[10px] font-black uppercase tracking-widest rounded-lg">{report.category}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 line-clamp-1">{report.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{format(new Date(report.date), 'MMM dd, yyyy')}</p>
                                        </div>
                                        {report.notes && <p className="text-xs text-gray-500 font-medium line-clamp-2 italic">"{report.notes}"</p>}
                                        <a 
                                            href={`http://localhost:5000${report.fileUrl}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <Button variant="secondary" className="w-full text-[10px] font-black uppercase tracking-widest py-3" icon={Download}>Download Report</Button>
                                        </a>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="col-span-2 py-20 text-center space-y-4 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-gray-300">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">No medical reports found in the vault.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                         <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Clinical Event Timeline</h4>
                            <div className="relative border-l-2 border-gray-100 ml-4 pl-8 space-y-10 py-4">
                                {history.map((record, idx) => (
                                    <div key={record._id} className="relative">
                                        <div className="absolute -left-[41px] top-0 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full"></div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{format(new Date(record.date), 'MMMM dd, yyyy')}</p>
                                            <h4 className="font-bold text-gray-900">Health Vitals Logged</h4>
                                            <p className="text-xs text-gray-500">BP: {record.bloodPressure} • Weight: {record.weight}kg • Status: {record.riskLevel.toUpperCase()}</p>
                                        </div>
                                    </div>
                                ))}
                                {prescriptions.map((p) => (
                                    <div key={p._id} className="relative">
                                        <div className="absolute -left-[41px] top-0 w-5 h-5 bg-white border-4 border-amber-500 rounded-full"></div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{format(new Date(p.date), 'MMMM dd, yyyy')}</p>
                                            <h4 className="font-bold text-gray-900">Prescription Issued</h4>
                                            <p className="text-xs text-gray-500">By Dr. {p.doctorId?.userId?.name || 'Specialist'} ({p.medicines.length} Medicines)</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    )}

                    {activeTab === 'emergency' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-red-50/30 border-red-100">
                                <CardHeader icon={<AlertCircle className="text-red-500" />} title="Critical Information" />
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400">Blood Group</p>
                                            <p className="font-black text-gray-900">{latest.patientId?.emergencyInfo?.bloodGroup || 'O+'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400">Status</p>
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black">ACTIVE MONITORING</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400">Allergies</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {(latest.patientId?.emergencyInfo?.allergies || []).length > 0 ? latest.patientId.emergencyInfo.allergies.map(a => (
                                                <span key={a} className="px-2 py-1 bg-white border border-red-100 rounded-lg text-xs font-bold text-red-600">{a}</span>
                                            )) : <span className="text-xs text-gray-500 italic">No allergies reported</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader icon={<Heart size={20} className="text-indigo-500" />} title="Emergency Contact" />
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <p className="text-xs font-black text-gray-900">{latest.patientId?.emergencyInfo?.emergencyContact?.name || 'Secondary Contact'}</p>
                                        <p className="text-xs text-gray-500">{latest.patientId?.emergencyInfo?.emergencyContact?.phone || '+91 99887-76655'}</p>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{latest.patientId?.emergencyInfo?.emergencyContact?.relation || 'Guardian'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                </div>


                <div className="space-y-8">
                    <Card className="bg-primary text-white border-none shadow-xl shadow-indigo-100">
                        <CardContent className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-white/20 rounded-2xl"><Plus size={24} /></div>
                                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Digital Vault</div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Medical Report Upload</h3>
                                <p className="text-indigo-100/70 text-sm font-medium mt-1">Safely store PDFs, Lab results, and Imaging files.</p>
                            </div>
                             <Button border className="w-full bg-white text-primary border-none mt-4 font-black" onClick={() => setShowReportModal(true)}>
                                Open Upload Tool
                             </Button>

                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50 border-amber-100/50">
                        <CardHeader icon={<AlertCircle className="text-amber-500" />} title="System Alerts" />
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white rounded-2xl border border-amber-100 flex gap-3 text-xs">
                                <Activity className="text-amber-500 shrink-0" size={18} />
                                <div>
                                    <p className="font-black text-gray-900">Vitals Insight</p>
                                    <p className="text-gray-500 font-medium mt-0.5">
                                        {history.length > 2 
                                            ? (parseInt(history[0].bloodPressure) > parseInt(history[1].bloodPressure) 
                                                ? 'Your Blood Pressure shows a slight upward trend. Consider monitoring sodium.'
                                                : 'Your vitals have remained stable over the last week. Keep it up!')
                                            : 'Continue logging vitals for better clinical insights.'}
                                    </p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader icon={<Share2 size={20} />} title="Health Summary PDF" />
                        <CardContent className="space-y-4 text-center py-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                                <FileText size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-900 px-4">Generate a full medical summary for your next visit.</p>
                            <Button variant="ghost" className="w-full text-xs font-black text-primary" onClick={() => setShowSummaryModal(true)}>Preview Summary</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </>
      )}

      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0 border-none animate-in zoom-in-95 duration-300">
                <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black">Medical Health Summary</h2>
                        <p className="text-gray-400 text-sm font-medium">Generated on {format(new Date(), 'MMMM dd, yyyy')}</p>
                    </div>
                    <button onClick={() => { setShowSummaryModal(false); setShowContacts(false); }} className="text-gray-400 hover:text-white text-3xl font-bold transition-colors">×</button>
                </div>

                <div className="p-10 space-y-10">
                    <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-gray-100 pb-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Name</p>
                            <p className="text-2xl font-black text-gray-900">{latest.patientId?.name || user?.name || 'Loading Patient...'}</p>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">ID: #{latest.patientId?._id?.slice(-8) || user?._id?.slice(-8) || 'HT-XXXXX'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                            <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p><p className="font-bold text-gray-900 text-sm">{latest.patientId?.email || user?.email || 'N/A'}</p></div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Blood Group</p>
                                <p className="font-bold text-gray-900 text-sm">{latest.patientId?.emergencyInfo?.bloodGroup || 'O+ Positive (Est.)'}</p>
                            </div>
                            <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">BMI Index</p><p className="font-bold text-emerald-600 text-sm">{bmi} (Healthy)</p></div>
                            <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p><p className="font-bold text-indigo-600 text-sm uppercase">Active Care</p></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                           <Activity size={16} className="text-primary" /> Current Clinical Status
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Latest Blood Pressure</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{latest.bloodPressure || 'N/A'}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Sugar Level</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{latest.sugarLevel || '--'} mg/dL</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{latest.weight || '--'} kg</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                           <FileText size={16} className="text-primary" /> Active Prescriptions
                        </h4>
                        <div className="border border-gray-100 rounded-3xl overflow-hidden">
                            <table className="w-full text-left font-bold">
                                <thead className="bg-gray-50">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                        <th className="px-6 py-4">Medicine</th>
                                        <th className="px-6 py-4">Dosage</th>
                                        <th className="px-6 py-4">Prescribed By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.flatMap(p => p.medicines.map((m, idx) => (
                                        <tr key={`${p._id}-${idx}`} className="border-b border-gray-50 text-xs text-gray-600 group hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-gray-900">{m.name}</td>
                                            <td className="px-6 py-4">{m.dosage}</td>
                                            <td className="px-6 py-4 text-indigo-600 font-bold">{p.doctorId?.userId?.name || 'Specialist'}</td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {showContacts && (
                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                                <Plus size={16} className="text-primary" /> Specialist Contact Directory
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {specialists.map(doc => (
                                    <div key={doc._id} className="p-6 bg-indigo-50/30 rounded-[32px] border border-indigo-100 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                            {doc.userId?.name?.[0] || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-gray-900">{doc.userId?.name || 'Specialist'}</p>
                                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{doc.specialization}</p>
                                            <div className="mt-1">
                                                <p className="text-xs text-gray-500">{doc.userId.email}</p>
                                                <p className="text-xs text-gray-500">{doc.userId.phone || "+91 98765-43210"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-xs font-bold text-indigo-900 max-w-lg flex gap-3 italic">
                            <AlertCircle className="text-indigo-500 shrink-0" size={18} />
                            <p>This is a digitally generated clinical summary. Consult your physician before changing medication.</p>
                        </div>
                        <div className="flex items-center gap-2">
                           {!showContacts && <Button onClick={() => setShowContacts(true)} className="px-8 font-black">Contact Doctor</Button>}
                           <Button border variant="secondary" icon={Download} onClick={handleExport}>Download</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      )}

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)}
        patientId={patientId}
        onUploadSuccess={fetchData}
      />
    </div>
  );
}


function StatCard({ icon, label, value, color, time, sub }) {
    return (
        <Card className="border-none shadow-xl shadow-gray-100/50">
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-${color}-50`}>{icon}</div>
                    {time && <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{format(new Date(time), 'd MMM')}</span>}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900">{value}</h3>
                    <p className="text-xs font-bold text-gray-400 capitalize flex items-center gap-1.5 mt-0.5">
                        {label} {sub && <span className="text-emerald-500 tracking-tight">• {sub}</span>}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
