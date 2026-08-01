import { Activity, Lock, User, Eye, EyeOff, Key } from 'lucide-react';
import { useState } from 'react';
import { db } from '@/services/db';
import { validateCredentials } from '@/lib/auth';

interface LoginProps {
  onLogin: (user: { username: string; role: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const trimmedUsername = usernameInput.trim();
    const trimmedPassword = passwordInput.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setIsLoading(false);
      setError('Please enter both username and password.');
      return;
    }

    try {
      const result = await db.authenticateUser(trimmedUsername, trimmedPassword);
      if (result.success && result.user) {
        onLogin({ username: result.user.username, role: 'doctor' });
      } else {
        setError(result.error || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = () => {
    setUsernameInput('doctor');
    setPasswordInput('secure123');
    setError('');
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen text-slate-100 overflow-hidden p-4"
      style={{ backgroundImage: 'url("/login_bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Premium Background Overlay & Effects */}
      <div className="absolute inset-0 z-0 bg-slate-950/75 backdrop-blur-[3px]">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/10 blur-[128px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[128px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-slate-950/75 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden grid md:grid-cols-12">
        {/* Left Side: Stunning Medical Illustration Side Panel */}
        <div className="hidden md:flex md:col-span-6 bg-slate-950 p-10 flex-col justify-between relative overflow-hidden border-r border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-950/50 to-emerald-950/30 opacity-40 z-0" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-md p-1">
              <img src="/Applogo.png" alt="Logo" className="w-full h-full object-contain block" />
            </div>
            <span className="font-bold text-base tracking-wide bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">MediCare EMR</span>
          </div>

          <div className="relative z-10 py-10 flex flex-col items-center justify-center">
            {/* Custom SVG Medical Visualizer */}
            <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              {/* Grid Lines */}
              <path d="M 0,100 L 200,100 M 100,0 L 100,200" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Outer Glowing Ring */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="url(#sky-emerald)" strokeWidth="1.5" strokeDasharray="5 15 10 5" className="animate-[spin_40s_linear_infinite]" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="#1e293b" strokeWidth="1" />
              
              {/* Inner Glowing Ring */}
              <circle cx="100" cy="100" r="60" fill="none" stroke="url(#sky-glow)" strokeWidth="2" strokeDasharray="180 50" className="animate-[spin_20s_linear_infinite_reverse]" />
              
              {/* ECG Heartbeat Line */}
              <path 
                d="M 25,100 L 65,100 L 75,80 L 85,125 L 95,50 L 105,150 L 115,100 L 125,100 L 132,92 L 140,108 L 145,100 L 175,100" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-[pulse_2s_infinite]"
              />

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="sky-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="sky-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>

            <div className="mt-8 text-center space-y-2">
              <h3 className="text-md font-bold text-slate-200">Doctor Information Workspace</h3>
              <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                Integrated patient registry, longitudinal vitals charts, and clinic consultation tracker.
              </p>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-slate-500 flex justify-between w-full border-t border-slate-800/80 pt-4">
            <span>Encrypted Session Storage</span>
            <span>v2.0.0</span>
          </div>
        </div>

        {/* Right Side: The Sign In Panel */}
        <div className="col-span-12 md:col-span-6 p-8 flex flex-col justify-center">
          <div className="mb-6 flex flex-col items-center md:items-start">
            {/* Small Logo for mobile view */}
            <div className="md:hidden w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md mb-4 p-1">
              <img src="/Applogo.png" alt="Logo" className="w-full h-full object-contain block" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Please enter credentials to unlock clinic EMR</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-800 text-red-400 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-xs outline-none"
                  placeholder="doctor"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-xs outline-none"
                  placeholder="secure123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 gap-2 text-xs shadow-lg shadow-sky-550/10 mt-2"
            >
              {isLoading ? 'Authenticating...' : (
                <>
                  <Key size={14} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={handleResetDemo}
              className="w-full text-[10px] font-medium text-slate-400 hover:text-slate-200 py-1.5 rounded border border-slate-800 hover:bg-slate-900 transition-colors"
            >
              Reset to Demo Credentials
            </button>
            <p className="text-[9px] text-slate-500 text-center leading-relaxed">
              Default credentials: <span className="font-mono text-slate-400">doctor</span> / <span className="font-mono text-slate-400">secure123</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-500 space-y-1">
        <p>MediCare Doctor Workspace v2.0.0 (Encrypted Local Mode)</p>
        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
