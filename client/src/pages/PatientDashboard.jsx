import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { 
  Activity, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Stethoscope, 
  AlertCircle,
  FileText,
  TrendingUp,
  Heart
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  
  // New Record Form
  const [vitals, setVitals] = useState({ bloodPressure: '', sugarLevel: '', weight: '' });
  const [booking, setBooking] = useState({ date: '', time: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docs, appts, hist] = await Promise.all([
        axios.get('/api/doctors'),
        axios.get('/api/appointments/patient'),
        axios.get('/api/health/history')
      ]);
      setDoctors(docs.data);
      setAppointments(appts.data);
      setHistory(hist.data);
    } catch (err) {
      console.error("Data fetch failed");
    }
  };

  const getNormalizedSlots = (slots = []) => {
    const defaultSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
    const targetSlots = (!slots || slots.length === 0) ? defaultSlots : slots;

    // 1. Convert everything to 24h for sorting
    const hours24 = targetSlots.map(s => {
      if (!s) return "00:00";
      if (s.includes('AM') || s.includes('PM')) {
        let [time, modifier] = s.split(' ');
        let [h, m] = time.split(':');
        let hour = parseInt(h);
        if (hour === 12) hour = 0;
        if (modifier === 'PM') hour += 12;
        return `${hour.toString().padStart(2, '0')}:${m}`;
      }
      return s.length === 4 ? `0${s}` : s;
    });

    // 2. Sort and Deduplicate
    const sorted24 = Array.from(new Set(hours24)).sort();

    // 3. Formatted to AM/PM
    return sorted24.map(s => {
      const [h, m] = s.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${m || '00'} ${ampm}`;
    });
  };


  const handleAddRecord = async (e) => {

    e.preventDefault();
    try {
      // Ensure numeric data is sent correctly
      const data = {
        ...vitals,
        sugarLevel: parseFloat(vitals.sugarLevel),
        weight: parseFloat(vitals.weight)
      };
      await axios.post('/api/health/add', data);
      alert('✅ Vitals logged successfully!');
      setVitals({ bloodPressure: '', sugarLevel: '', weight: '' });
      fetchData();
    } catch (err) {
      console.error("Vitals Log Error:", err);
      const msg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => `${e.field}: ${e.msg}`).join('\n')
        : (err.response?.data?.message || 'Failed to add record');
      alert(`❌ Error logging vitals:\n${msg}`);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/appointments/book', {
        doctorId: selectedDoctor._id,
        ...booking
      });
      alert('Appointment requested!');
      setShowBookModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const chartData = {
    labels: [...history].reverse().map(r => format(new Date(r.date), 'MMM dd')),
    datasets: [
      {
        label: 'Sugar Level (mg/dL)',
        data: [...history].reverse().map(r => r.sugarLevel),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Weight (kg)',
        data: [...history].reverse().map(r => r.weight),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ],
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Patient Dashboard</h1>
          <p className="text-gray-500 font-medium">Monitoring your recovery and health trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={FileText} onClick={() => navigate('/records')}>
            Medical Reports
          </Button>
          <Button icon={Plus} onClick={fetchData} disabled={loading} className={loading ? 'opacity-50' : ''}>
              {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>


      {/* KPI OverView */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100 dark:shadow-none">
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl"><Heart size={28} /></div>
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Latest BP</p>
              <h3 className="text-2xl font-black text-white">{history[0]?.bloodPressure || 'No Data'}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><TrendingUp size={28} /></div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Weight (kg)</p>
              <h3 className="text-2xl font-black text-gray-900">{history[0]?.weight || '--'}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Activity size={28} /></div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Sugar Level</p>
              <h3 className="text-2xl font-black text-gray-900">{history[0]?.sugarLevel || '--'} mg/dL</h3>
            </div>
          </CardContent>
        </Card>

        <Card className={history[0]?.riskLevel === 'red' ? 'bg-red-50' : 'bg-green-50'}>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${history[0]?.riskLevel === 'red' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Risk Status</p>
              <h3 className={`text-2xl font-black capitalize ${history[0]?.riskLevel === 'red' ? 'text-red-600' : 'text-green-600'}`}>
                {history[0]?.riskLevel || 'Normal'}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="min-h-[400px]">
            <CardHeader>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Health Progress Trend
              </h3>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {history.length > 0 ? (
                  <Line data={chartData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">No health records yet to visualize.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Doctors List */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold">Specialist Doctors</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map(doc => (
                  <div key={doc._id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                        {doc.userId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{doc.userId.name}</p>
                        <p className="text-xs text-gray-500">{doc.specialization} • {doc.experience}y Exp</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="px-4 text-xs font-bold text-primary" onClick={() => { setSelectedDoctor(doc); setShowBookModal(true); }}>
                      Book Session
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel: Appointments & Log Vitals */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <h3 className="text-lg font-bold">Log Daily Vitals</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <Input label="Blood Pressure" placeholder="Eg. 120/80" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} required />
                <Input label="Sugar Level (mg/dL)" type="number" placeholder="Eg. 100" value={vitals.sugarLevel} onChange={e => setVitals({...vitals, sugarLevel: e.target.value})} required />
                <Input label="Weight (kg)" type="number" placeholder="Eg. 70" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} required />
                <Button type="submit" className="w-full">Log Vitals</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold">Recent Requests</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.slice(0, 5).map(app => (
                  <div key={app._id} className="p-3 bg-white rounded-xl border border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{app.doctorId.userId.name}</p>
                      <p className="text-[10px] text-gray-500">{format(new Date(app.date), 'MMM dd')} at {app.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'approved' ? 'bg-green-100 text-green-600' : 
                      app.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal (Simplified) */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in zoom-in-95">
            <CardHeader>
              <h3 className="font-bold text-xl">Book Specialist</h3>
              <button onClick={() => setShowBookModal(false)} className="text-gray-400">×</button>
            </CardHeader>
            <CardContent>
               <div className="mb-6 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg text-white font-bold flex items-center justify-center">
                    {selectedDoctor?.userId?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedDoctor?.userId.name}</p>
                    <p className="text-xs text-gray-400">{selectedDoctor?.specialization}</p>
                  </div>
               </div>
               <form onSubmit={handleBook} className="space-y-4">
                  <Input type="date" label="Preferred Date" value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} required />
                  <div className="grid grid-cols-3 gap-2">
                    {getNormalizedSlots(selectedDoctor?.slots).map(s => (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => setBooking({...booking, time: s})}
                        className={`py-2 text-[10px] font-black rounded-xl border transition-all ${booking.time === s ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={!booking.time || !booking.date}>Confirm Booking</Button>
               </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
