import { Database, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Splash() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing database connection...');

  useEffect(() => {
    const sequence = [
      { p: 30, text: 'Loading application settings...' },
      { p: 60, text: 'Verifying backup schedule...' },
      { p: 100, text: 'Ready.' }
    ];

    const timers = sequence.map((step, idx) =>
      setTimeout(() => {
        setProgress(step.p);
        setStatus(step.text);
      }, (idx + 1) * 600)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white selection:bg-sky-500/30">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg shadow-sky-500/20">
          <img src="/Applogo.png" alt="Logo" className="h-full w-full object-contain block" />
        </div>

        <h1 className="mb-1 text-2xl font-bold tracking-tight">MediCare</h1>
        <p className="mb-12 text-sm text-slate-400">Electronic Medical Record System</p>

        <div className="w-full space-y-4">
          <div className="flex items-end justify-between text-xs font-medium text-slate-400">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-12 flex gap-6 text-slate-600">
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck size={14} /> Local Secure
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Database size={14} /> Offline Ready
          </div>
        </div>

        <p className="absolute bottom-8 text-xs text-slate-600">
          &copy; 2026 MediCare Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
