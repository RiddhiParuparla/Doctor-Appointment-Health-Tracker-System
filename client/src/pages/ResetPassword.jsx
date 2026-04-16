import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, Button, Input } from '../components/ui';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-bg flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reset Password</h1>
          <p className="text-gray-500 font-medium">Verify your OTP and set a new password.</p>
        </div>

        <Card className="p-2 border-none shadow-2xl shadow-indigo-100/50">
          <CardContent className="pt-6">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input 
                  label="Email Address" 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <Input 
                  label="Enter 6-Digit OTP" 
                  placeholder="000000" 
                  value={formData.otp}
                  onChange={e => setFormData({...formData, otp: e.target.value})}
                  required
                />
                <Input 
                  label="New Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  required
                  icon={Lock}
                />
                <Button type="submit" loading={loading} className="w-full h-14 text-lg">
                  Update Password
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 animate-bounce" />
                <h3 className="text-xl font-bold text-gray-900">Success!</h3>
                <p className="text-gray-500 text-sm">Your password has been changed. Redirecting to login...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
