import React, { useState, useEffect } from 'react';
import api from '../../services/api';

import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { 
  Users, 
  Search, 
  Filter, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Mail,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, filter]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/api/admin/users?search=${search}&role=${filter}`);

      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await api.patch(`/api/admin/users/status/${id}`, { status: newStatus });

      fetchUsers();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);

      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Patient Management</h1>
          <p className="text-gray-500 font-medium italic">Monitor and control entire user population.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-primary focus:ring-0 text-sm font-bold shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="patient">Patients</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-6">User Identity</th>
                  <th className="px-8 py-6">Role</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Registered</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-gray-50/50 group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5"><Mail size={12} /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'blocked' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="text-xs font-bold text-gray-600 capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          className={`p-2 rounded-lg transition-colors ${user.status === 'blocked' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                          title={user.status === 'blocked' ? "Unblock User" : "Block User"}
                          onClick={() => toggleStatus(user._id, user.status)}
                        >
                          {user.status === 'blocked' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => deleteUser(user._id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
