import React, { useState } from 'react';
import api from '../services/api';

import { Card, CardHeader, CardContent, Button } from './ui';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, patientId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
        setError('Please provide a title and select a file');
        return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('notes', notes);

    try {
      const url = patientId ? `/api/health/reports/${patientId}` : '/api/health/reports';
      await api.post(url, formData, {

        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess();
      onClose();
    } catch (err) {

      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white p-0 border-none animate-in zoom-in-95 duration-300 overflow-hidden rounded-[32px]">
        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl"><Upload size={20} /></div>
                <h3 className="font-black text-lg">Add Medical Report</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 italic">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Report Title</label>
                    <input 
                        type="text" 
                        placeholder="e.g., Blood Analysis / MRI Scan"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-0 text-sm font-bold"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Category</label>
                        <select 
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-0 text-sm font-bold"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Lab Report</option>
                            <option>Imaging</option>
                            <option>Prescription</option>
                            <option>Vaccination</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Notes (Optional)</label>
                    <textarea 
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-0 text-sm font-bold h-24 resize-none"
                        placeholder="Add any additional context..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">File Attachment</label>
                    <div className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                        file ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-primary'
                    }`}>
                        <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <div className="space-y-2">
                             {file ? (
                                <>
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto"><CheckCircle size={24} /></div>
                                    <p className="text-sm font-black text-gray-900">{file.name}</p>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">File Ready for upload</p>
                                </>
                             ) : (
                                <>
                                    <div className="w-12 h-12 bg-white text-gray-300 rounded-2xl flex items-center justify-center mx-auto shadow-sm"><Upload size={24} /></div>
                                    <p className="text-sm font-bold text-gray-900">Drop file or click to browse</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PDF, JPG, PNG (Max 5MB)</p>
                                </>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-100"
                disabled={uploading}
            >
                {uploading ? (
                    <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Uploading Vault...</span>
                ) : 'Securely Upload Report'}
            </Button>
        </form>
      </Card>
    </div>
  );
}
