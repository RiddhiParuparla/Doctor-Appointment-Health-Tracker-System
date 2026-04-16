import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Download, 
  Printer, 
  Clock, 
  Stethoscope,
  ChevronRight,
  FileText,
  AlertCircle,
  Pill
} from 'lucide-react';
import { format } from 'date-fns';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('/api/prescriptions/patient');
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Prescriptions fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const filtered = prescriptions.filter(p => {
    const drName = p.doctorId.userId.name.toLowerCase();
    const docSpec = p.doctorId.specialization.toLowerCase();
    const matchesSearch = drName.includes(search.toLowerCase()) || docSpec.includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || p.doctorId.specialization === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDownloadPDF = (prescription) => {
    if (!prescription) return;
    
    const data = `HEALTH TRACKER - OFFICIAL MEDICAL PRESCRIPTION\n` +
      `==========================================\n` +
      `Issued On: ${format(new Date(prescription.date), 'MMMM dd, yyyy')}\n` +
      `Doctor: Dr. ${prescription.doctorId?.userId?.name || 'Specialist'}\n` +
      `Specialization: ${prescription.doctorId?.specialization || 'Clinical Medicine'}\n\n` +
      `MEDICATION LIST:\n` +
      prescription.medicines.map(m => `- ${m.name}: ${m.dosage} (${m.frequency})`).join('\n') +
      `\n\nCLINICAL INSTRUCTIONS:\n` +
      `${prescription.notes || 'No special instructions.'}\n\n` +
      `------------------------------------------\n` +
      `Next Checkup: May 15, 2026 (Recommended)\n` +
      `==========================================\n`;
    
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescription_Dr_${prescription.doctorId?.userId?.name?.replace(/\s+/g, '_') || 'Specialist'}_${format(new Date(prescription.date), 'yyyyMMdd')}.txt`;
    a.click();
  };

  const handleDownloadAll = () => {
    if (filteredPrescriptions.length === 0) return;
    
    let fullData = `HEALTH TRACKER - COMPLETE PRESCRIPTION HISTORY\n` +
      `==================================================\n` +
      `Exported On: ${format(new Date(), 'MMMM dd, yyyy')}\n` +
      `Patient: ${user?.name || 'Authorized User'}\n` +
      `==================================================\n\n`;
    
    filteredPrescriptions.forEach((p, idx) => {
      fullData += `PRESCRIPTION #${idx + 1}\n` +
        `Date: ${format(new Date(p.date), 'MMM dd, yyyy')}\n` +
        `Doctor: Dr. ${p.doctorId?.userId?.name || 'Specialist'}\n` +
        `Meds: ${p.medicines.map(m => `${m.name} (${m.dosage})`).join(', ')}\n` +
        `Notes: ${p.notes || 'N/A'}\n` +
        `--------------------------------------------------\n\n`;
    });
    
    const blob = new Blob([fullData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Complete_Prescription_History_${format(new Date(), 'yyyyMMdd')}.txt`;
    a.click();
  };



  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Main List Area */}
      <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Prescription Manager</h1>
            <p className="text-gray-500 font-medium italic">Your complete medication history and clinical records.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print History</Button>
            <Button icon={Download} onClick={handleDownloadAll} disabled={filteredPrescriptions.length === 0}>Download All</Button>
          </div>

        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by doctor or specialization..." 
              className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm"><Filter size={20} className="text-gray-400" /></div>
            <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-14 bg-white border border-gray-100 rounded-2xl px-6 text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
                <option value="All">All Specializations</option>
                <option>Cardiologist</option>
                <option>Neurologist</option>
                <option>Pediatrician</option>
                <option>Ophthalmologist</option>
                <option>Dentist</option>
                <option>Endocrinologist</option>
                <option>General Physician</option>

            </select>
          </div>
        </div>

        {/* Prescription Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(p => (
            <div 
              key={p._id} 
              onClick={() => setSelectedPrescription(p)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                selectedPrescription?._id === p._id ? 'bg-primary text-white border-primary shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${
                   selectedPrescription?._id === p._id ? 'bg-white/20' : 'bg-gray-50 text-primary'
                }`}>
                    {p.doctorId?.userId?.name?.[0] || '?'}
                </div>
                <div>
                   <h3 className={`text-xl font-bold ${selectedPrescription?._id === p._id ? 'text-white' : 'text-gray-900'}`}>{p.doctorId.userId.name}</h3>
                   <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-semibold">
                      <span className="flex items-center gap-1 opacity-70"><Stethoscope size={14} /> {p.doctorId.specialization}</span>
                      <span className="flex items-center gap-1 opacity-70"><Calendar size={14} /> {format(new Date(p.date), 'MMM dd, yyyy')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedPrescription?._id === p._id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-primary'
                      }`}>{p.medicines.length} Medicines</span>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <Button 
                    variant="ghost" 
                    className={selectedPrescription?._id === p._id ? 'text-white border-white/20' : 'text-gray-400'}
                    onClick={(e) => { e.stopPropagation(); handleDownloadPDF(p); }}
                >
                    <Download size={20} />
                </Button>

                <div className={`p-2 rounded-xl transition-all ${selectedPrescription?._id === p._id ? 'bg-white text-primary' : 'bg-gray-50 text-gray-300'}`}>
                    <ChevronRight size={24} />
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
             <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900">No Prescriptions Yet</h3>
                <p className="text-gray-500 font-medium">Book a session with a doctor to receive your digital prescription.</p>
                <Button className="mt-6" onClick={() => window.location.href='/doctors'}>Find Doctors</Button>
             </div>
          )}
        </div>
      </div>

      {/* Detail Sidebar / Drawer (Desktop) */}
      <div className="w-full lg:w-[450px] space-y-6">
        {selectedPrescription ? (
           <div className="bg-white rounded-[40px] border border-gray-100 h-full flex flex-col overflow-hidden shadow-2xl shadow-gray-200/50 animate-in slide-in-from-right duration-500">
              <div className="bg-primary p-8 text-white relative">
                 <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center font-black text-3xl mb-4">
                    {selectedPrescription.doctorId?.userId?.name?.[0] || '?'}
                 </div>
                 <h2 className="text-2xl font-black">{selectedPrescription.doctorId.userId.name}</h2>
                 <p className="text-indigo-100 font-bold tracking-tight">{selectedPrescription.doctorId.specialization} • Specialist</p>
                 <div className="absolute right-8 top-8 opacity-20"><FileText size={60} /></div>
              </div>

              <div className="flex-1 p-8 space-y-8 overflow-y-auto scrollbar-hide">
                 {/* Medicine List */}
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Pill size={16} /> Prescribed Medication
                    </h4>
                    <div className="space-y-3">
                        {selectedPrescription.medicines.map((m, idx) => (
                           <div key={idx} className="p-4 bg-gray-50 rounded-3xl flex items-center justify-between border border-transparent hover:border-indigo-100 transition-all group">
                              <div>
                                 <p className="font-black text-gray-900">{m.name}</p>
                                 <p className="text-xs text-gray-500 font-bold">{m.dosage} • {m.frequency}</p>
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all">
                                 <Clock size={16} />
                              </div>
                           </div>
                        ))}
                    </div>
                 </div>

                 {/* Doctor's Notes */}
                 <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <AlertCircle size={16} /> Clinical Instructions
                    </h4>
                    <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 text-sm italic font-medium text-amber-900 leading-relaxed">
                        “{selectedPrescription.notes || "No special instructions provided for this session."}”
                    </div>
                 </div>

                 {/* Timeline Metadata */}
                 <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-black uppercase tracking-widest">Next Checkup</span>
                        <span className="font-black text-gray-900">May 15, 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-black uppercase tracking-widest">Issuance Date</span>
                        <span className="font-black text-gray-900">{format(new Date(selectedPrescription.date), 'dd/MM/yyyy')}</span>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-gray-50 flex gap-4">
                 <Button border variant="ghost" className="flex-1 font-black">Share</Button>
                 <Button className="flex-1 font-black shadow-lg shadow-indigo-100" onClick={() => handleDownloadPDF(selectedPrescription)}>Download PDF</Button>
              </div>

           </div>
        ) : (
           <div className="bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-300 shadow-sm mb-6">
                 <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Selection Required</h3>
              <p className="text-gray-500 font-medium text-sm mt-2">Select a prescription from the list to view its full medical details and download documents.</p>
           </div>
        )}
      </div>
    </div>
  );
}
