import { Activity, ShieldCheck, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Splash() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing database connection...");

  useEffect(() => {
    const sequence = [
      { p: 30, text: "Loading application settings..." },
      { p: 60, text: "Verifying backup schedule..." },
      { p: 100, text: "Ready." }
    ];

    let t = 0;
    sequence.forEach((step, idx) => {
      setTimeout(() => {
        setProgress(step.p);
        setStatus(step.text);
      }, (idx + 1) * 600);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white selection:bg-sky-500/30">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 mb-6">
          <Activity size={32} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-1">MediCare</h1>
        <p className="text-slate-400 text-sm mb-12">Electronic Medical Record System</p>
        
        <div className="w-full space-y-4">
          <div className="flex justify-between items-end text-xs font-medium text-slate-400">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
          
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex gap-6 mt-12 text-slate-600">
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck size={14} /> Local Secure
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Database size={14} /> Offline Ready
          </div>
        </div>

        <p className="text-xs text-slate-600 absolute bottom-8">
          © 2026 MediCare Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
