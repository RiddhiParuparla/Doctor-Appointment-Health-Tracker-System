import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { 
  Users, 
  Search, 
  User, 
  Mail, 
  Phone, 
  AlertCircle, 
  ChevronRight, 
  ShieldAlert,
  Archive,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/doctors/patients');

      setPatients(res.data);
    } catch (err) {
      console.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Patient Portfolio</h1>
          <p className="text-gray-500 font-medium italic">Your active clinical roster and historical case directory.</p>
        </div>
        <div className="flex gap-3">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-center px-8">
             <p className="text-2xl font-black text-primary">{patients.length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Consulted</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by patient name or email..." 
            className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="h-14 px-6 rounded-2xl" icon={Filter}>Filters</Button>
           <Button variant="secondary" className="h-14 px-6 rounded-2xl" icon={Archive}>Archived</Button>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient._id} className="group hover:border-primary/20 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 border-none shadow-xl shadow-gray-100/50 overflow-hidden">
             <div className="h-2 bg-gray-100 group-hover:bg-primary transition-colors"></div>
             <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                   <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      {patient.name?.[0] || '?'}
                   </div>
                   <button 
                     onClick={() => navigate(`/records?patientId=${patient._id}`)}
                     className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                   >
                     <ChevronRight size={20} />
                   </button>
                </div>

                <div>
                   <h3 className="text-xl font-black text-gray-900 leading-tight">{patient.name}</h3>
                   <div className="flex flex-col gap-1 mt-2">
                      <p className="text-xs text-gray-500 font-bold flex items-center gap-2"><Mail size={12} /> {patient.email}</p>
                      <p className="text-xs text-gray-500 font-bold flex items-center gap-2"><Phone size={12} /> {patient.phone || 'No phone recorded'}</p>
                   </div>
                </div>

                {/* Emergency Info Preview */}
                <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100/30 space-y-2">
                   <div className="flex items-center gap-2">
                      <ShieldAlert size={14} className="text-red-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Specialist Alert Info</p>
                   </div>
                   <p className="text-xs font-bold text-gray-600 italic">
                      {typeof patient.emergencyInfo === 'object' && patient.emergencyInfo !== null
                        ? `${patient.emergencyInfo.bloodGroup || 'Unspecified'} • ${patient.emergencyInfo.allergies || 'No allergies recorded'}`
                        : (typeof patient.emergencyInfo === 'string' ? patient.emergencyInfo : "No critical medical alerts registered.")}
                   </p>
                </div>

                <div className="pt-2">
                   <Button 
                     onClick={() => navigate(`/records?patientId=${patient._id}`)}
                     className="w-full h-12 bg-white text-gray-900 border border-gray-100 rounded-2xl font-black text-xs hover:border-primary hover:text-primary transition-all shadow-none group-hover:shadow-lg group-hover:shadow-indigo-50"
                   >
                     Deep Clinical Review
                   </Button>
                </div>
             </CardContent>
          </Card>
        ))}

        {filteredPatients.length === 0 && (
           <div className="col-span-full py-32 text-center space-y-4 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-gray-200 shadow-sm">
                 <Search size={40} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-gray-900">No Patients Found</h3>
                 <p className="text-gray-500 font-medium">Try adjusting your search terms or filters.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
