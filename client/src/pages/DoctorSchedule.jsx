import api from '../services/api';

import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { 
  Calendar, 
  Clock, 
  Settings, 
  CheckCircle, 
  Stethoscope, 
  Briefcase,
  Save,
  AlertCircle
} from 'lucide-react';

export default function DoctorSchedule() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const allSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "01:00 PM", "02:00 PM", 
    "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/doctors/profile');

      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSlot = (slot) => {
    const newSlots = profile.slots.includes(slot)
      ? profile.slots.filter(s => s !== slot)
      : [...profile.slots, slot];
    setProfile({ ...profile, slots: newSlots });
  };

  const handleToggleDay = (day) => {
    const newDays = profile.availability.includes(day)
      ? profile.availability.filter(d => d !== day)
      : [...profile.availability, day];
    setProfile({ ...profile, availability: newDays });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/doctors/profile', profile);

      alert('✅ Professional profile and schedule updated successfully!');
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return (
    <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Practice Schedule</h1>
          <p className="text-gray-500 font-medium italic">Configure your clinical availability and consultation windows.</p>
        </div>
        <Button 
          disabled={saving} 
          onClick={handleSave} 
          className="h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 font-black"
        >
          {saving ? 'Processing...' : <><Save size={20} /> Save Configurations</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Config */}
        <div className="space-y-8">
           <Card className="border-none shadow-xl shadow-gray-100/50">
              <CardHeader icon={<Settings className="text-primary"/>} title="Professional Vitals" />
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Clinical Specialization</label>
                    <Input 
                        value={profile.specialization} 
                        onChange={e => setProfile({...profile, specialization: e.target.value})}
                        border
                        placeholder="e.g. Senior Cardiologist"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Years of Experience</label>
                    <Input 
                        type="number"
                        value={profile.experience} 
                        onChange={e => setProfile({...profile, experience: e.target.value})}
                        border
                    />
                 </div>
                 <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-3">
                    <AlertCircle className="text-primary shrink-0" size={18} />
                    <p className="text-[10px] font-bold text-indigo-900 italic leading-relaxed">
                        These details are visible to patients during the consultation booking process.
                    </p>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-xl shadow-gray-100/50 bg-gray-900 text-white">
              <CardHeader title="Consultation Status" />
              <CardContent>
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                       <p className="font-black">Direct Booking</p>
                       <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Currently Enabled</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Schedule Grid */}
        <div className="lg:col-span-2 space-y-8">
           {/* Weekly Availability */}
           <Card className="border-none shadow-xl shadow-gray-100/50">
              <CardHeader icon={<Calendar className="text-primary"/>} title="Weekly Operational Days" />
              <CardContent>
                 <div className="flex flex-wrap gap-3">
                    {allDays.map(day => {
                        const isSelected = profile.availability.includes(day);
                        return (
                           <button
                             key={day}
                             onClick={() => handleToggleDay(day)}
                             className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                               isSelected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/20'
                             }`}
                           >
                              {day}
                           </button>
                        );
                    })}
                 </div>
              </CardContent>
           </Card>

           {/* Time Slots */}
           <Card className="border-none shadow-xl shadow-gray-100/50">
              <CardHeader icon={<Clock className="text-primary"/>} title="Clinical Consultation Slots" />
              <CardContent className="space-y-6">
                 <p className="text-xs font-bold text-gray-500 italic">Select the time windows you are available for patient appointments.</p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allSlots.map(slot => {
                        const isSelected = profile.slots.includes(slot);
                        return (
                           <button
                             key={slot}
                             onClick={() => handleToggleSlot(slot)}
                             className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all group ${
                               isSelected ? 'bg-indigo-50 border-primary/30' : 'bg-white border-gray-100 hover:border-gray-200'
                             }`}
                           >
                              <span className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                                 {slot}
                              </span>
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                 isSelected ? 'bg-primary border-primary text-white' : 'bg-gray-50 border-gray-100 group-hover:border-gray-300'
                              }`}>
                                 {isSelected && <CheckCircle size={12} />}
                              </div>
                           </button>
                        );
                    })}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
