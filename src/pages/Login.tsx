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
        onLogin({ username: result.user.username, role: result.user.role });
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md shadow-sky-500/20 mb-4 overflow-hidden p-1">
            <img src="/Applogo.png" alt="Logo" className="w-full h-full object-contain block" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">MediCare EMR</h2>
          <p className="text-sm text-slate-500 mt-1">Secure local workspace access</p>
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
                  placeholder="Enter username"
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
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm outline-none"
                  placeholder="Enter password (min 6 chars)"
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
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleResetDemo}
              className="w-full text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset to Demo Credentials
            </button>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Default credentials: doctor / secure123
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
        <p>MediCare EMR System v2.0.0 (Encrypted Local Mode)</p>
        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
