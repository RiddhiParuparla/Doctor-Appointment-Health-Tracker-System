import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, Heart, Zap } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, Input } from '../components/ui';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {

      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      
      const homeMap = { patient: '/', doctor: '/doctor', admin: '/admin' };
      navigate(homeMap[res.data.user.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-soft-bg flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mx-auto rotate-3">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">HealthTrack</h1>
          <p className="text-gray-500 font-medium">Secure Portal for Patients & Doctors</p>
        </div>

        <Card className="p-2 border-none shadow-2xl shadow-indigo-100/50">
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-400 font-semibold">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="doctor@healthtrack.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} icon={LogIn} className="w-full h-14 text-lg">
                Continue to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm font-semibold">
          Don't have an account? {' '}
          <Link to="/register" className="text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
