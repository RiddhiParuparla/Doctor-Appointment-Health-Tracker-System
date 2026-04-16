import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { Search, Stethoscope, Star, Globe, ShieldCheck, MapPin } from 'lucide-react';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  // Booking State
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [booking, setBooking] = useState({ date: '', time: '' });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/appointments/book', {
        doctorId: selectedDoctor._id,
        ...booking
      });
      alert('✅ Appointment requested successfully!');
      setShowBookModal(false);
      setBooking({ date: '', time: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || doc.specialization === filter;
    return matchesSearch && matchesFilter;
  });

  const getNormalizedSlots = (slots = []) => {
    if (!slots || slots.length === 0) return [];

    // 1. Convert everything to 24h for sorting
    const hours24 = slots.map(s => {
      if (!s) return "00:00";
      if (s.includes('AM') || s.includes('PM')) {
        let [time, modifier] = s.split(' ');
        let [h, m] = time.split(':');
        let hour = parseInt(h);
        if (hour === 12) hour = 0;
        if (modifier === 'PM') hour += 12;
        return `${hour.toString().padStart(2, '0')}:${m}`;
      }
      return s.length === 4 ? `0${s}` : s; // normalize 9:00 to 09:00
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



  const specializations = ['All', ...new Set(doctors.map(d => d.specialization))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Find Specialists</h1>
          <p className="text-gray-500 font-medium">Connect with top-rated medical professionals.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or specialization..." 
            className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="h-14 bg-white border border-gray-100 rounded-2xl px-6 text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <Card key={doc._id} className="group hover:border-primary/20 transition-all border-none shadow-xl shadow-gray-100/50">
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                    {doc.userId?.name?.[0] || '?'}
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Available Today
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{doc.userId.name}</h3>
                  <p className="text-primary text-sm font-bold mt-1 tracking-tight flex items-center gap-1">
                    <Stethoscope size={14} /> {doc.specialization}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold py-2 border-y border-gray-50">
                  <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /> 4.9</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-blue-400" /> {doc.experience}+ Years</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> City Hospital</span>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Available Slots</p>
                  <div className="flex flex-wrap gap-2">
                    {getNormalizedSlots(doc.slots).slice(0, 3).map(s => (
                      <span key={s} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold border border-gray-100 italic">
                        {s}
                      </span>
                    ))}
                    {doc.slots.length > 3 && <span className="text-gray-300 text-[10px] font-bold">+{doc.slots.length - 3} more</span>}
                  </div>

                </div>

                <Button 
                  onClick={() => { setSelectedDoctor(doc); setShowBookModal(true); }}
                  className="w-full h-12 text-sm font-black tracking-wide shadow-none group-hover:shadow-lg group-hover:shadow-indigo-100"
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No Specialists Found</h3>
          <p className="text-gray-500 font-medium">Try searching for a different name or category.</p>
        </div>
      )}

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in zoom-in-95">
            <CardHeader>
              <h3 className="font-bold text-xl text-gray-900">Book Specialist</h3>
              <button 
                onClick={() => setShowBookModal(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
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
                        className={`py-2 text-[10px] font-black rounded-lg border transition-all ${booking.time === s ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
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
