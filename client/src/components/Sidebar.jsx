import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Activity, 
  FileText, 
  Settings, 
  LogOut, 
  Stethoscope, 
  UserPlus,
  ShieldCheck,
  Zap,
  Clock,
  BarChart3
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = {
    patient: [
      { name: 'Overview', path: '/', icon: LayoutDashboard },
      { name: 'Find Doctors', path: '/doctors', icon: Stethoscope },
      { name: 'My Appointments', path: '/appointments', icon: Calendar },
      { name: 'Health Library', path: '/records', icon: Activity },
      { name: 'Prescriptions', path: '/prescriptions', icon: FileText },
      { name: 'My Profile', path: '/profile', icon: Settings },
    ],
    doctor: [
      { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
      { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
      { name: 'Patients', path: '/doctor/patients', icon: Users },
      { name: 'Health Records', path: '/records', icon: Activity },
      { name: 'Schedule', path: '/doctor/schedule', icon: Clock },
      { name: 'My Profile', path: '/profile', icon: Settings },
    ],
    admin: [
      { name: 'Overview', path: '/admin', icon: LayoutDashboard },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
      { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
      { name: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
    ]

  };

  const activeMenu = menuItems[user?.role] || [];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Zap size={22} fill="currentColor" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">HealthTrack</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {activeMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? "bg-indigo-50 text-primary font-bold shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 space-y-2">
        <div className="px-4 py-3 bg-gray-50 rounded-2xl flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-primary font-bold text-xs">
                {user?.name?.[0] || '?'}
            </div>
            <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Loading...'}</p>
                <p className="text-[10px] text-gray-500 capitalize">{user?.role || 'User'}</p>
            </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
