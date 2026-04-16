import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button } from '../components/ui';
import { Calendar, Clock, Stethoscope, Video, MapPin, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('/api/appointments/patient');
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this consultation request?")) return;
    try {
      await axios.patch(`/api/appointments/cancel/${id}`);
      
      const refreshRes = await axios.get('/api/appointments/patient');
      setAppointments(refreshRes.data);
      alert("✅ Appointment cancelled successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Cancellation failed";
      alert(`❌ Cancellation Error: ${errorMsg}`);
    }
  };


  const getStatusStyle = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Consultation Log</h1>
        <p className="text-gray-500 font-medium">Manage and track your medical appointments.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-3xl"></div>)
        ) : appointments.length > 0 ? (
          appointments.map((app) => (
            <Card key={app._id} className="border-none shadow-xl shadow-gray-100/50 group">
              <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                    app.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {app.doctorId.userId.name.charAt(0)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-gray-900">{app.doctorId.userId.name}</h3>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                            {getStatusIcon(app.status)} {app.status}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium tracking-tight flex items-center gap-2">
                      <Stethoscope size={14} className="text-primary" /> {app.doctorId.specialization} Specialist
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-gray-900">{format(new Date(app.date), 'EEEE, MMM dd')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl"><Clock size={20} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time Slot</p>
                      <p className="text-sm font-bold text-gray-900">{app.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                    {app.status !== 'rejected' && app.status !== 'completed' && (
                        <Button 
                          variant="ghost" 
                          className="text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleCancel(app._id)}
                        >
                          Cancel
                        </Button>
                    )}
                    {app.status === 'approved' && (
                        <Button className="text-xs font-black shadow-none bg-emerald-500 hover:bg-emerald-600">Join Call</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-50/50 border-dashed border-2 border-gray-100">
            <CardContent className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-gray-300">
                <Calendar size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Start Your Care Journey</h3>
                <p className="text-gray-500 text-sm font-medium">You don't have any scheduled appointments yet.</p>
              </div>
              <Button onClick={() => window.location.href='/doctors'} className="mt-4">
                Schedule First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4">
        <AlertCircle size={20} className="text-primary shrink-0 mt-1" />
        <p className="text-xs text-primary font-bold leading-relaxed">
          Important: Please join your online consultations at least 5 minutes before the scheduled time. 
          If you need to cancel, do so at least 24 hours in advance to avoid rescheduling fees.
        </p>
      </div>
    </div>
  );
}
