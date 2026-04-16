import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { 
  Stethoscope, 
  Search, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Award,
  Wallet
} from 'lucide-react';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/admin/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const setApproval = async (id, isApproved) => {
    try {
      await axios.patch(`/api/admin/doctors/approve/${id}`, { isApproved });
      fetchDoctors();
    } catch (err) {
      alert("Verification update failed");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Specialist Verification</h1>
        <p className="text-gray-500 font-medium italic">Verify and authorize medical credentials for practicing doctors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doctor => (
          <Card key={doctor._id} className={`group border-none shadow-xl transition-all duration-300 ${!doctor.isApproved ? 'ring-2 ring-amber-100 ring-offset-4 ring-offset-white' : ''}`}>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  {doctor.userId?.name?.[0]}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  doctor.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {doctor.isApproved ? 'Verified' : 'Pending Review'}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 leading-tight">{doctor.userId?.name}</h3>
                <p className="text-sm font-bold text-primary italic mt-1">{doctor.specialization}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><Award size={10} /> Experience</p>
                  <p className="text-sm font-black text-gray-900">{doctor.experience} Years</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><Wallet size={10} /> Consult Fee</p>
                  <p className="text-sm font-black text-gray-900">₹{doctor.fees || 500}</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                {doctor.isApproved ? (
                  <Button 
                    variant="secondary" 
                    className="flex-1 bg-red-50 text-red-600 border-none font-black text-[10px] uppercase tracking-widest"
                    onClick={() => setApproval(doctor._id, false)}
                  >
                    Revoke Access
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="flex-1 font-black text-[10px] uppercase tracking-widest"
                      onClick={() => setApproval(doctor._id, true)}
                    >
                      Approve Doctor
                    </Button>
                    <Button variant="ghost" className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><XCircle size={20} /></Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-gray-300 shadow-sm">
                <Stethoscope size={40} />
            </div>
            <p className="text-gray-500 font-medium">No specialized clinical profiles found for verification.</p>
          </div>
      )}
    </div>
  );
}
