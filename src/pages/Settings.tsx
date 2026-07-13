import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Loader2, Key, Shield, Signature } from 'lucide-react';
import { db, DoctorProfile } from '@/services/db';

export function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [doctor, setDoctor] = useState<DoctorProfile>(() => db.getDoctorProfile());

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        
        // Draw existing signature if exists
        if (doctor.signature) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = doctor.signature;
        }
      }
    }
  }, [doctor.signature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDoctor(prev => ({ ...prev, signature: undefined }));
    setSignatureSaved(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const updatedDoctor = { ...doctor, signature: dataUrl };
    setDoctor(updatedDoctor);
    db.saveDoctorProfile(updatedDoctor);
    db.logActivity('Settings Changed', 'Doctor digital signature updated.');
    setSignatureSaved(true);
    setTimeout(() => setSignatureSaved(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveComplete(false);
    
    setTimeout(() => {
      db.saveDoctorProfile(doctor);
      setIsSaving(false);
      setSaveComplete(true);
      setTimeout(() => setSaveComplete(false), 3000);
    }, 800);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    const storedPass = localStorage.getItem('emr_password') || 'password123';
    if (currentPassword !== storedPass) {
      setPassError('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    localStorage.setItem('emr_password', newPassword);
    db.logActivity('Settings Changed', 'Doctor login password updated.');
    setPassSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Manage your clinic profile, digital signature, and security options.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Clinic Profile */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-4">Doctor & Clinic Profile</h3>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Doctor / Specialist Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" 
                    value={doctor.name}
                    onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Registration Number</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" 
                    value={doctor.regNumber}
                    onChange={(e) => setDoctor({ ...doctor, regNumber: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Clinic Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" 
                    value={doctor.clinicName}
                    onChange={(e) => setDoctor({ ...doctor, clinicName: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Specialization</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" 
                    value={doctor.specialization}
                    onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Contact Email</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" 
                    value={doctor.email}
                    onChange={(e) => setDoctor({ ...doctor, email: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" 
                    value={doctor.phone}
                    onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Clinic Address</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" 
                  value={doctor.clinicAddress}
                  onChange={(e) => setDoctor({ ...doctor, clinicAddress: e.target.value })}
                  required 
                />
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-slate-900 dark:bg-sky-600 text-white px-4 py-2 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed font-semibold"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : "Save Profile"}
                </button>
                {saveComplete && (
                  <span className="text-[12px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Profile updated successfully
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Security / Password Change */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-slate-400" size={18} />
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Security Credentials</h3>
            </div>
            {passError && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">{passError}</div>
            )}
            {passSuccess && (
              <div className="mb-4 p-2 bg-emerald-50 text-emerald-600 text-xs rounded border border-emerald-200">Password changed successfully.</div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:ring-2 focus:ring-sky-500/20 outline-none text-slate-900 dark:text-slate-100" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:ring-2 focus:ring-sky-500/20 outline-none text-slate-900 dark:text-slate-100" 
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors flex items-center gap-1"
              >
                <Key size={14} /> Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Digital Signature Pad */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Signature className="text-slate-400" size={18} />
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Digital Signature</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Draw your signature below. This will appear on all prescriptions and clinic letters.</p>
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={260}
                height={140}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair w-full block"
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <button 
                onClick={clearSignature}
                className="text-[11px] text-red-500 font-semibold hover:underline"
              >
                Clear
              </button>
              <div className="flex items-center gap-2">
                {signatureSaved && (
                  <span className="text-[11px] text-emerald-600 font-semibold">Saved!</span>
                )}
                <button 
                  onClick={saveSignature}
                  className="bg-slate-900 dark:bg-sky-600 text-white px-3 py-1 rounded text-[11px] font-semibold hover:bg-slate-800 dark:hover:bg-sky-700"
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

