import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { Card, CardHeader, CardContent, Button, Input } from '../components/ui';
import { User, ShieldAlert, Phone, Heart, Save, Activity, Mail } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/profile');

      setProfile(res.data);
    } catch (err) {
      console.error("Profile fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/auth/profile', profile);

      alert('✅ Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold">Loading Vault...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity Vault</h1>
        <p className="text-gray-500 font-medium">Manage your personal details and secure your medical profile.</p>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <Card className="md:col-span-2 border-none shadow-xl shadow-gray-100/50">
            <CardHeader icon={<User className="text-primary" />} title="Primary Information" />
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Medical Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                <Input label="Email Address" value={profile.email} disabled />
            </CardContent>
        </Card>

        {/* Medical Essentials */}
        <Card className="border-none shadow-xl shadow-gray-100/50">
            <CardHeader icon={<Heart className="text-red-500" />} title="Medical Essentials" />
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Blood Group</label>
                    <select 
                        value={profile.emergencyInfo?.bloodGroup || 'Unknown'} 
                        onChange={e => setProfile({...profile, emergencyInfo: {...profile.emergencyInfo, bloodGroup: e.target.value}})}
                        className="w-full h-12 bg-gray-50 border border-transparent rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-primary/20 transition-all outline-none"
                    >
                        <option value="A+">A Positive (A+)</option>
                        <option value="A-">A Negative (A-)</option>
                        <option value="B+">B Positive (B+)</option>
                        <option value="B-">B Negative (B-)</option>
                        <option value="O+">O Positive (O+)</option>
                        <option value="O-">O Negative (O-)</option>
                        <option value="AB+">AB Positive (AB+)</option>
                        <option value="AB-">AB Negative (AB-)</option>
                        <option value="Unknown">Unknown</option>
                    </select>
                </div>
                <Input 
                    label="Allergies (Comma separated)" 
                    placeholder="e.g. Peanuts, Aspirin" 
                    value={profile.emergencyInfo?.allergies?.join(', ') || ''} 
                    onChange={e => setProfile({...profile, emergencyInfo: {...profile.emergencyInfo, allergies: e.target.value.split(',').map(s => s.trim())}})}
                />
            </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-none shadow-xl shadow-gray-100/50">
            <CardHeader icon={<Phone className="text-amber-500" />} title="Emergency Contact" />
            <CardContent className="space-y-4">
                <Input label="Contact Name" value={profile.emergencyInfo?.emergencyContact?.name || ''} onChange={e => setProfile({...profile, emergencyInfo: {...profile.emergencyInfo, emergencyContact: {...profile.emergencyInfo.emergencyContact, name: e.target.value}}})} />
                <Input label="Phone Number" value={profile.emergencyInfo?.emergencyContact?.phone || ''} onChange={e => setProfile({...profile, emergencyInfo: {...profile.emergencyInfo, emergencyContact: {...profile.emergencyInfo.emergencyContact, phone: e.target.value}}})} />
                <Input label="Relationship" value={profile.emergencyInfo?.emergencyContact?.relation || ''} onChange={e => setProfile({...profile, emergencyInfo: {...profile.emergencyInfo, emergencyContact: {...profile.emergencyInfo.emergencyContact, relation: e.target.value}}})} />
            </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="px-12 h-14 text-sm font-black shadow-xl shadow-indigo-100" disabled={saving}>
                {saving ? 'Saving...' : 'Secure & Save Profile'}
            </Button>
        </div>
      </form>
    </div>
  );
}
