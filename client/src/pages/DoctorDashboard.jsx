import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  FilePlus, 
  Clock, 
  User, 
  Activity,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ appointmentsToday: 0, totalPatients: 0, pendingPrescriptions: 0, specialization: 'General' });
  const [loading, setLoading] = useState(true);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [triagePatients, setTriagePatients] = useState([]);

  // Prescription Form
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '' }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, statsRes, triageRes] = await Promise.all([
        api.get('/api/appointments/doctor'),
        api.get('/api/doctors/stats'),
        api.get('/api/health/triage')
      ]);

      setAppointments(appointmentsRes.data);
      setStats(statsRes.data);
      setTriagePatients(triageRes.data);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/appointments/status/${id}`, { status });

      fetchData();
    } catch (err) {
      alert('Update failed');
    }
  };

  const fetchHistory = async (patientId) => {
    try {
      const res = await api.get(`/api/health/history/${patientId}`);

      setPatientHistory(res.data);
    } catch (err) {
      console.error("History fetch failed");
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '' }]);
  };

  const onSubmitPrescription = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patientId: selectedAppointment.patientId._id,
        medicines: JSON.stringify(medicines),
        notes: notes
      };
      
      await api.post('/api/prescriptions/add', payload);

      alert('Prescription added!');
      setShowPrescriptionModal(false);
      updateStatus(selectedAppointment._id, 'completed');
    } catch (err) {
      alert('Failed to add prescription');
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Specialist Hub</span>
             <span className="text-xs font-bold text-gray-400">• Online</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Dashboard</h1>
          <p className="text-gray-500 font-medium italic">Welcome back, Specialist. Your practice is operating at peak performance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Users} onClick={() => navigate('/doctor/patients')}>Full Directory</Button>
          <Button className="shadow-lg shadow-primary/20" icon={Calendar} onClick={() => navigate('/doctor/schedule')}>View Schedule</Button>
        </div>
      </div>

      {/* Top Clinical Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-500" />} label="Total Patients" value={stats.totalPatients} color="blue" sub="Active Care" />
        <StatCard icon={<Calendar className="text-amber-500" />} label="Sessions Today" value={stats.appointmentsToday} color="amber" sub="Consultations" />
        
        <div onClick={() => navigate('/doctor/schedule')} className="cursor-pointer transition-transform hover:scale-105">
           <StatCard icon={<Clock className="text-emerald-500" />} label="Manage Schedule" value="Open" color="emerald" sub="Practice Hours" />
        </div>

        <StatCard icon={<Activity className="text-indigo-500" />} label="Care Status" value={stats.specialization} color="indigo" sub="Department" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Appointment Queue */}
          <Card className="border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                <h3 className="text-lg font-black text-gray-900">Patient Consultation Queue</h3>
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-amber-100 text-amber-700 rounded-full uppercase tracking-widest">
                {appointments.filter(a => a.status === 'pending' || a.status === 'approved').length} Active
              </span>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-gray-50">
                 {appointments.filter(a => a.status === 'pending' || a.status === 'approved').map(app => (
                   <div key={app._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-all group">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white border border-gray-100 rounded-3xl flex items-center justify-center text-primary font-black text-2xl shadow-sm group-hover:scale-105 transition-transform">
                          {app.patientId.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-gray-900 text-lg">{app.patientId.name}</p>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                                app.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>{app.status}</span>
                          </div>
                          <p className="text-xs text-gray-400 font-bold tracking-tight">
                            {format(new Date(app.date), 'MMMM dd')} • {app.time}
                          </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       {app.status === 'pending' ? (
                         <>
                           <Button variant="danger" className="h-10 px-6 rounded-2xl" onClick={() => updateStatus(app._id, 'rejected')}>Reject</Button>
                           <Button className="h-10 px-6 rounded-2xl shadow-lg shadow-primary/10" onClick={() => updateStatus(app._id, 'approved')}>Approve</Button>
                         </>
                       ) : (
                         <Button icon={FilePlus} className="h-10 px-6 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-100" onClick={() => { setSelectedAppointment(app); fetchHistory(app.patientId._id); setShowPrescriptionModal(true); }}>
                           Issue Prescription
                         </Button>
                       )}
                       <Button variant="secondary" className="h-10 px-4 rounded-2xl" onClick={() => { setSelectedAppointment(app); fetchHistory(app.patientId._id); }}>
                         <ChevronRight size={18} />
                       </Button>
                     </div>
                   </div>
                 ))}
                 {appointments.filter(a => a.status === 'pending' || a.status === 'approved').length === 0 && (
                   <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300"><Calendar size={32}/></div>
                      <p className="text-gray-400 font-bold text-sm tracking-tight">No consultations in the queue.</p>
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Clinical Review */}
        <div className="space-y-8">
          <Card className="bg-gray-900 text-white border-none shadow-2xl overflow-hidden">
             <div className="h-1 bg-gradient-to-r from-indigo-500 to-primary w-full"></div>
             <CardHeader className="border-white/5 py-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                   <Activity size={18} className="text-indigo-400" />
                   Quick Clinical Insight
                </h3>
             </CardHeader>
             <CardContent className="space-y-6 pt-2 pb-8">
                {selectedAppointment ? (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 mx-2">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                          {selectedAppointment.patientId.name?.[0] || '?'}
                       </div>
                       <div>
                          <p className="font-black text-lg">{selectedAppointment.patientId.name}</p>
                          <p className="text-[10px] text-white/30 font-black tracking-widest">{selectedAppointment.patientId.email}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mx-2">
                       <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center group hover:bg-white/10 transition-all cursor-default">
                          <p className="text-[10px] text-white/40 uppercase font-black mb-1">Blood Pressure</p>
                          <p className="text-xl font-black text-indigo-400">{patientHistory[0]?.bloodPressure || '--'}</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center group hover:bg-white/10 transition-all cursor-default">
                          <p className="text-[10px] text-white/40 uppercase font-black mb-1">Blood Sugar</p>
                          <p className="text-xl font-black text-amber-400">{patientHistory[0]?.sugarLevel || '--'}</p>
                       </div>
                    </div>

                    <div className="mx-2 space-y-2">
                       <p className="text-[10px] text-white/40 uppercase font-black px-2 tracking-widest">Pre-Visit Notes</p>
                       <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-xs text-white/60 leading-relaxed italic">
                          "{selectedAppointment.notes || "The patient has not provided specific clinical symptoms for this consultation session."}"
                       </div>
                    </div>

                    <Button className="w-[calc(100%-1rem)] mx-2 bg-white text-gray-900 border-none h-12 font-black text-xs hover:bg-gray-100 transition-colors" onClick={() => navigate(`/records?patientId=${selectedAppointment.patientId._id}`)}>
                       Open Full Health Vault
                    </Button>
                  </>
                ) : (
                  <div className="py-20 text-center space-y-4 text-white/10">
                    <ClipboardList size={40} className="mx-auto" />
                    <p className="text-xs font-black uppercase tracking-widest px-8">Select a patient card to load clinical history</p>
                  </div>
                )}
             </CardContent>
          </Card>

          {/* High-Risk Watchlist */}
          <Card className="border-none shadow-xl shadow-red-100/20">
             <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Emergent Care Watchlist</h3>
                <AlertCircle size={16} className="text-red-500" />
             </CardHeader>
              <CardContent className="space-y-4">
                 {triagePatients.length > 0 ? (
                    triagePatients.map((p, idx) => (
                      <div key={idx} className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between group cursor-pointer hover:bg-red-50 transition-all" onClick={() => navigate(`/records?patientId=${p.patientId?._id}`)}>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">!</div>
                           <div>
                               <p className="text-xs font-black text-gray-900">{p.patientId?.name || 'Unknown Patient'}</p>
                               <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">Critical {p.bloodPressure ? 'BP' : 'Sugar'} alert</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-red-300 group-hover:text-red-500 transition-colors" />
                      </div>
                    ))
                 ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                       <CheckCircle size={24} className="mx-auto text-gray-300 mb-2" />
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Emergent Alerts</p>
                    </div>
                 )}
                 <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-red-500 tracking-widest" onClick={() => navigate('/doctor/patients')}>View Risk Analysis</Button>
              </CardContent>
          </Card>
        </div>
      </div>

      {/* Prescription Pad Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
          <Card className="w-full max-w-2xl animate-in zoom-in-95 duration-300 p-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] bg-white overflow-hidden">
             <div className="bg-primary p-8 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl"><ClipboardList size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Digital Prescription Pad</h3>
                        <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-70">Clinical Finalization</p>
                    </div>
                </div>
                <button onClick={() => setShowPrescriptionModal(false)} className="text-white/60 hover:text-white transition-colors text-3xl font-light">×</button>
             </div>
             
             <CardContent className="p-10">
               <form onSubmit={onSubmitPrescription} className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Medication List</p>
                        <Button variant="ghost" type="button" onClick={handleAddMedicine} className="text-[10px] text-primary font-black uppercase tracking-widest">
                           + Add Medicine
                        </Button>
                     </div>
                     <div className="space-y-3">
                        {medicines.map((med, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-3xl border border-gray-100 items-end animate-in slide-in-from-top-2 duration-300">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase ml-2">Medicine Name</p>
                                <Input placeholder="e.g. Paracetamol" className="bg-white" border value={med.name} onChange={e => {
                                  const newMed = [...medicines];
                                  newMed[index].name = e.target.value;
                                  setMedicines(newMed);
                                }} required />
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase ml-2">Dosage</p>
                                <Input placeholder="e.g. 500mg" className="bg-white" border value={med.dosage} onChange={e => {
                                  const newMed = [...medicines];
                                  newMed[index].dosage = e.target.value;
                                  setMedicines(newMed);
                                }} required />
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase ml-2">Frequency</p>
                                <Input placeholder="e.g. 1-0-1" className="bg-white" border value={med.frequency} onChange={e => {
                                  const newMed = [...medicines];
                                  newMed[index].frequency = e.target.value;
                                  setMedicines(newMed);
                                }} required />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Specialist's Clinical Observations</p>
                     <textarea 
                        className="w-full min-h-[120px] p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                        placeholder="Detail the patient diagnosis, dietary advice, and lifestyle recommendations..."
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}
                        required
                     />
                  </div>
                  
                  <div className="pt-4">
                     <Button type="submit" variant="primary" className="w-full h-16 rounded-[32px] text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20" icon={CheckCircle}>
                        Confirm & Close Session
                     </Button>
                  </div>
               </form>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }) {
    return (
        <Card className="border-none shadow-xl shadow-gray-100/50 group hover:shadow-2xl transition-all duration-300">
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-3xl bg-${color}-50 flex items-center justify-center shadow-inner`}>{icon}</div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{sub}</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left">{value}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mt-1">{label}</p>
                </div>
            </CardContent>
        </Card>
    )
}
