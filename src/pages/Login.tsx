import { Activity, Lock, User, Eye, EyeOff, Key } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameInput, setUsernameInput] = useState('doctor');
  const [passwordInput, setPasswordInput] = useState('password123');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate auth check using localStorage credentials
    setTimeout(() => {
      const storedUser = localStorage.getItem('emr_username') || 'doctor';
      const storedPass = localStorage.getItem('emr_password') || 'password123';

      if (usernameInput === storedUser && passwordInput === storedPass) {
        setIsLoading(false);
        onLogin();
      } else {
        setIsLoading(false);
        setError('Invalid username or password. Please try again.');
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-850 overflow-hidden">
        
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center shadow-md shadow-sky-500/20 mb-4">
            <Activity size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">MediCare EMR</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to your local workspace</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-md font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 gap-2"
            >
              {isLoading ? 'Authenticating...' : (
                <>
                  <Key size={16} />
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
        <p>MediCare EMR System v1.0.0 (Offline EMR Mode)</p>
        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}

