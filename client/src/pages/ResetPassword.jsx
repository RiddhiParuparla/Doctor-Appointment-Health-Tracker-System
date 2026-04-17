import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, Button, Input } from '../components/ui';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2, Timer, RefreshCw } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: New Password
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 1 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (timer === 0) return alert("OTP Expired. Please request a new one.");
    
    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { email: formData.email, otp: formData.otp });
      // If verification succeeds, go to step 2
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-soft-bg flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {step === 1 ? 'Verify Identity' : 'Secure Account'}
          </h1>
          <p className="text-gray-500 font-medium">
            {step === 1 
              ? 'Enter the 6-digit code sent to your email.' 
              : 'Credentials verified. Set your new secure password.'}
          </p>
        </div>

        <Card className="p-2 border-none shadow-2xl shadow-indigo-100/50">
          <CardContent className="pt-6">
            {!success ? (
              <div className="space-y-6">
                {/* Step Indicators */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <div className={`w-12 h-1 bg-gray-100 rounded-full relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-primary transition-all duration-500 ${step === 2 ? 'translate-x-0' : '-translate-x-full'}`}></div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                </div>

                {step === 1 ? (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <div className="flex justify-between items-end">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Time Remaining</label>
                        <div className={`flex items-center gap-2 font-black text-sm ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                            <Timer size={16} />
                            {timer}s
                        </div>
                    </div>
                    
                    <Input 
                      label="6-Digit OTP" 
                      placeholder="000000" 
                      value={formData.otp}
                      onChange={e => setFormData({...formData, otp: e.target.value})}
                      required
                      className="text-center text-2xl tracking-[0.5em] font-black"
                      autoComplete="one-time-code"
                      disabled={timer === 0}
                    />

                    {timer === 0 ? (
                        <div className="text-center space-y-3">
                            <p className="text-xs text-red-500 font-bold">The code has expired for security reasons.</p>
                            <Button variant="secondary" icon={RefreshCw} onClick={handleResend} className="w-full">
                                Resend New Code
                            </Button>
                        </div>
                    ) : (
                        <Button type="submit" loading={loading} className="w-full h-14 text-lg">
                          Verify Code
                        </Button>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <Input 
                      label="New Password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.newPassword}
                      onChange={e => setFormData({...formData, newPassword: e.target.value})}
                      required
                      icon={Lock}
                    />
                    <Input 
                      label="Confirm Password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                      icon={Lock}
                    />
                    <Button type="submit" loading={loading} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700">
                      Update Password
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 animate-bounce" />
                <h3 className="text-xl font-bold text-gray-900">Security Updated!</h3>
                <p className="text-gray-500 text-sm">Your new password is active. Redirecting to login...</p>
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
