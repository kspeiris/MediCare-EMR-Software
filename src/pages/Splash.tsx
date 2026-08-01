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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white selection:bg-sky-500/30 overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-4">
        {/* Animated Background Heartbeat */}
        <div className="absolute -top-16 opacity-10 animate-pulse">
          <svg width="240" height="80" viewBox="0 0 240 80" fill="none">
            <path
              d="M 10 40 H 80 L 90 20 L 100 60 L 110 5 L 120 75 L 130 40 H 230"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-xl shadow-sky-500/20">
          <img src="/Applogo.png" alt="Logo" className="h-full w-full object-contain block" />
        </div>

        <h1 className="mb-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">MediCare</h1>
        <p className="mb-12 text-sm text-slate-500">Electronic Medical Record System</p>

        <div className="w-full space-y-4">
          <div className="flex items-end justify-between text-[11px] font-medium text-slate-400">
            <span className="truncate pr-4">{status}</span>
            <span className="font-mono">{progress}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-12 flex gap-6 text-slate-500">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <ShieldCheck size={14} className="text-sky-500" /> Local Secure
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Database size={14} className="text-emerald-500" /> Offline Ready
          </div>
        </div>

        <p className="absolute bottom-8 text-[10px] text-slate-600">
          &copy; 2026 MediCare Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
