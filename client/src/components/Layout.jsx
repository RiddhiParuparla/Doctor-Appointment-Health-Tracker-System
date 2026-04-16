import React from 'react';
import { Sidebar } from './Sidebar';
import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }) {
  const { user } = useAuth();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`flex min-h-screen ${isDark ? 'dark bg-slate-950' : 'bg-soft-bg'}`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-96 max-w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search records, doctors, patients..." 
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-all"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-8 bg-gray-100 dark:bg-slate-800 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'Loading...'}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wider">{user?.role || 'User'} Tier</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-black flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none">
                {user?.name?.[0] || '?'}
              </div>
            </div>
          </div>
        </header>

        <section className="p-8">
          {children}
        </section>
      </main>
    </div>
  );
}
