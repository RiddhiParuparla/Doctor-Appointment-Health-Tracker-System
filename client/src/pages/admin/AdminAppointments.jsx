import api from '../../services/api';

import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock, 
  MoreHorizontal,
  XCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/api/admin/appointments');

      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch system appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/appointments/status/${id}`, { status });

      fetchAppointments();
    } catch (err) {
      alert("Override failed");
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Appointments</h1>
        <p className="text-gray-500 font-medium italic">Global oversight and clinical session management.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-6">Patient</th>
                  <th className="px-8 py-6">Medical Specialist</th>
                  <th className="px-8 py-6">Schedule</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt._id} className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-black text-gray-900">{apt.patientId?.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{apt.patientId?.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 text-primary rounded-lg flex items-center justify-center font-black text-xs italic">S</div>
                        <p className="text-xs font-bold text-gray-600">
                          {apt.doctorId?.userId?.name?.startsWith('Dr.') ? apt.doctorId.userId.name : `Dr. ${apt.doctorId?.userId?.name}`}
                        </p>

                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-gray-900 flex items-center gap-2"><Calendar size={12} className="text-gray-400" /> {format(new Date(apt.date), 'MMM dd, yyyy')}</p>
                        <p className="text-[10px] font-bold text-indigo-500 flex items-center gap-2 uppercase tracking-widest"><Clock size={12} /> {apt.time}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        apt.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        apt.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                           {apt.status === 'pending' && (
                               <Button 
                                variant="ghost" 
                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                                onClick={() => updateStatus(apt._id, 'approved')}
                                title="Force Approve"
                               >

                                   <CheckCircle2 size={18} />
                               </Button>
                           )}
                           {apt.status !== 'rejected' && (
                               <Button 
                                variant="ghost" 
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                onClick={() => updateStatus(apt._id, 'rejected')}
                                title="Cancel (Admin Override)"
                               >
                                   <XCircle size={18} />
                               </Button>
                           )}
                           <Button variant="ghost" className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><MoreHorizontal size={18} /></Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {appointments.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-gray-300 shadow-sm font-black italic">A</div>
            <p className="text-gray-500 font-medium">No system-wide appointments found in logs.</p>
          </div>
      )}
    </div>
  );
}
