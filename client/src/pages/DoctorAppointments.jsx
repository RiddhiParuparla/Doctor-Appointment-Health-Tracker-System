import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Activity, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  MoreVertical,
  CheckCheck,
  ArrowRight
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/appointments/doctor');
      setAppointments(res.data);
      
      const today = new Date();
      const todayApps = res.data.filter(a => isSameDay(new Date(a.date), today));
      
      setStats({
        total: todayApps.length,
        pending: res.data.filter(a => a.status === 'pending').length,
        completed: res.data.filter(a => a.status === 'completed').length
      });
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/appointments/status/${id}`, { status });
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const fetchPatientDetails = async (app) => {
    setSelectedPatient(app);
    try {
      const res = await axios.get(`/api/health/history/${app.patientId._id}`);
      setPatientHistory(res.data);
    } catch (err) {
      setPatientHistory([]);
    }
  };

  const filtered = appointments.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.patientId.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Management Hub</h1>
          <p className="text-gray-500 font-medium italic">High-performance consultation and queue administration.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
           <QuickStat label="Today" value={stats.total} color="blue" />
           <QuickStat label="Requests" value={stats.pending} color="amber" />
           <QuickStat label="Done" value={stats.completed} color="emerald" />
        </div>
      </div>

      {/* Main Management Section */}
      <div className="flex flex-col lg:flex-row gap-8 relative items-start">
        
        <div className="flex-1 space-y-6 w-full">
           {/* Filters Bar */}
           <Card className="border-none shadow-xl shadow-gray-100/50 bg-white/80 backdrop-blur-md sticky top-4 z-30">
             <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                   <Input 
                      placeholder="Search patient name..." 
                      className="pl-12 h-12 bg-gray-50/50 border-none shadow-inner" 
                      value={search} 
                      onChange={e => setSearch(e.target.value)}
                   />
                </div>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                   {['all', 'pending', 'approved', 'completed'].map(s => (
                     <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            filter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                     >
                        {s}
                     </button>
                   ))}
                </div>
             </CardContent>
           </Card>

           {/* Appointments Table */}
           <Card className="border-none shadow-2xl shadow-gray-200/50 overflow-hidden min-h-[500px]">
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                             <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient</th>
                             <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                             <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Clinical Focus</th>
                             <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                             <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {filtered.map(app => (
                            <tr key={app._id} className="group hover:bg-gray-50/50 transition-colors">
                               <td className="px-6 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black shadow-sm group-hover:scale-110 transition-transform">
                                        {app.patientId.name?.[0] || '?'}
                                     </div>
                                     <div>
                                        <p className="font-black text-gray-900">{app.patientId.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{app.patientId.email}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <div className="flex flex-col">
                                     <span className="text-sm font-black text-gray-700">{format(new Date(app.date), 'MMM dd')}</span>
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                                        <Clock size={10} /> {app.time}
                                     </span>
                                  </div>
                               </td>
                               <td className="px-6 py-6 max-w-[200px]">
                                  <p className="text-xs font-bold text-gray-500 line-clamp-1 italic">
                                     "{app.notes || 'Routine follow-up consultation'}"
                                  </p>
                               </td>
                               <td className="px-6 py-6">
                                  <StatusBadge status={app.status} />
                               </td>
                               <td className="px-6 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     {app.status === 'pending' && (
                                       <>
                                         <ActionButton icon={XCircle} color="red" onClick={() => updateStatus(app._id, 'rejected')} />
                                         <ActionButton icon={CheckCircle} color="emerald" onClick={() => updateStatus(app._id, 'approved')} />
                                       </>
                                     )}
                                     {app.status === 'approved' && (
                                       <ActionButton icon={CheckCheck} color="blue" label="Mark Completed" onClick={() => updateStatus(app._id, 'completed')} />
                                     )}
                                     <Button variant="secondary" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 border-gray-100" onClick={() => fetchPatientDetails(app)}>
                                        View
                                     </Button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                    {filtered.length === 0 && (
                      <div className="py-20 text-center space-y-4">
                         <Search size={40} className="mx-auto text-gray-200" />
                         <p className="text-gray-400 font-bold text-sm">No matching appointments found.</p>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Clinical Slide Drawer (Selected Patient) */}
        {selectedPatient && (
          <div className="lg:w-[400px] h-[calc(100vh-200px)] sticky top-4 animate-in slide-in-from-right-8 duration-500">
             <Card className="h-full bg-gray-900 border-none shadow-3xl text-white overflow-hidden flex flex-col">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-primary to-emerald-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between border-white/5 py-6">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Clinical Insight</h3>
                   <button onClick={() => setSelectedPatient(null)} className="text-white/40 hover:text-white transition-colors"><XCircle size={20}/></button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-8 pb-10 custom-scrollbar">
                   {/* Patient Identity */}
                   <div className="text-center space-y-4 pt-4">
                      <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-center text-primary font-black text-4xl mx-auto shadow-2xl">
                         {selectedPatient.patientId.name?.[0] || '?'}
                      </div>
                      <div>
                         <h2 className="text-2xl font-black">{selectedPatient.patientId.name}</h2>
                         <p className="text-white/40 font-bold text-xs uppercase tracking-widest">{selectedPatient.patientId.email}</p>
                      </div>
                   </div>

                   {/* Vitals Hub */}
                   <div className="grid grid-cols-3 gap-3 px-2">
                       <VitalsBox label="Weight" value={patientHistory[0]?.weight || '--'} unit="kg" color="blue" />
                       <VitalsBox label="BP" value={patientHistory[0]?.bloodPressure || '--'} unit="mmHg" color="amber" />
                       <VitalsBox label="Sugar" value={patientHistory[0]?.sugarLevel || '--'} unit="mg/dl" color="emerald" />
                   </div>

                   {/* Clinical Notes */}
                   <div className="mx-2 space-y-4 bg-white/5 p-6 rounded-[32px] border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Patient Complaint</p>
                      <p className="text-sm font-bold text-white/70 leading-relaxed italic">
                        "{selectedPatient.notes || "No pre-visit notes provided by patient."}"
                      </p>
                   </div>

                   {/* Quick History List */}
                   <div className="mx-2 space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Previous Records</p>
                         <span className="text-[10px] text-primary font-black">{patientHistory.length} Total</span>
                      </div>
                      <div className="space-y-3">
                         {patientHistory.slice(0, 3).map((hist, idx) => (
                           <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-default">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Activity size={14} />
                                 </div>
                                 <p className="text-[10px] font-black uppercase">{format(new Date(hist.date), 'MMM dd, yyyy')}</p>
                              </div>
                              <ArrowRight size={14} className="text-white/20 group-hover:text-primary transition-colors" />
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Final Action */}
                    <div className="px-2 pt-4">
                       <Button className="w-full h-16 bg-white text-gray-900 border-none rounded-3xl font-black text-xs hover:bg-gray-100 transition-all shadow-xl shadow-black/20" icon={Activity} onClick={() => navigate(`/records?patientId=${selectedPatient.patientId._id}`)}>
                         Full Patient Dashboard
                       </Button>
                    </div>
                </CardContent>
             </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-blue-50 text-blue-600 border-blue-100',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-red-600 border-red-100'
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}

function ActionButton({ icon: Icon, color, label, onClick }) {
    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white',
        red: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
    }
  return (
    <button 
      onClick={onClick}
      title={label}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${colorMap[color]}`}
    >
      <Icon size={18} />
    </button>
  );
}

function QuickStat({ label, value, color }) {
    const styles = {
        blue: 'text-blue-600 bg-blue-50/50',
        amber: 'text-amber-600 bg-amber-50/50',
        emerald: 'text-emerald-600 bg-emerald-50/50'
    }
    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className={`px-4 py-3 text-center ${styles[color]}`}>
                <p className="text-xl font-black tracking-tight">{value}</p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</p>
            </CardContent>
        </Card>
    )
}

function VitalsBox({ label, value, unit, color }) {
    const colors = {
        blue: 'text-blue-400',
        amber: 'text-amber-400',
        emerald: 'text-emerald-400'
    }
    return (
        <div className="p-3 bg-white/5 rounded-3xl border border-white/5 text-center">
            <p className="text-[8px] text-white/30 uppercase font-bold mb-1">{label}</p>
            <p className={`text-sm font-black ${colors[color]}`}>{value}</p>
            <p className="text-[8px] text-white/20 font-bold uppercase">{unit}</p>
        </div>
    )
}
