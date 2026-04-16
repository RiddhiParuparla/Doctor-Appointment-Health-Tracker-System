import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

import { Card, CardContent, Button, Input } from '../components/ui';
import { UserPlus, Stethoscope, User } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', formData);

      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-bg flex flex-col items-center justify-center p-6 py-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 font-medium text-sm">Join the HealthTrack Network</p>
        </div>

        <Card className="p-2 border-none shadow-2xl shadow-indigo-100/50">
          <CardContent className="space-y-6">
            <div className="flex p-1 bg-gray-50 rounded-xl">
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${formData.role === 'patient' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                onClick={() => setFormData({...formData, role: 'patient'})}
              >
                <User size={18} />
                I'm a Patient
              </button>
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${formData.role === 'doctor' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                onClick={() => setFormData({...formData, role: 'doctor'})}
              >
                <Stethoscope size={18} />
                I'm a Doctor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input 
                label="Full Name" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />

              {formData.role === 'doctor' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <Input 
                    label="Specialization" 
                    placeholder="E.g. Cardiology" 
                    value={formData.specialization}
                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                    required
                  />
                  <Input 
                    label="Experience (Years)" 
                    type="number" 
                    placeholder="E.g. 5" 
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                    required
                  />
                </div>
              )}

              <Button type="submit" loading={loading} icon={UserPlus} className="w-full h-14 text-lg mt-4">
                Register Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm font-semibold">
          Already have an account? {' '}
          <Link to="/login" className="text-primary hover:underline font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
