import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, Button, Input } from '../components/ui';
import { Mail, ArrowLeft, Key } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-bg flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Forgot Password?</h1>
          <p className="text-gray-500 font-medium">No worries, we will send you an OTP.</p>
        </div>

        <Card className="p-2 border-none shadow-2xl shadow-indigo-100/50">
          <CardContent className="pt-6">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  icon={Mail}
                />
                <Button type="submit" loading={loading} className="w-full h-14 text-lg">
                  Send OTP Code
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Mail size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">OTP Sent!</h3>
                <p className="text-gray-500 text-sm">We've sent a 6-digit code to your email. Redirecting to reset page...</p>
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
