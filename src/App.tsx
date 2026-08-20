import { HashRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { Consultations } from '@/pages/Consultations';
import { Prescriptions } from '@/pages/Prescriptions';
import { Certificates } from '@/pages/Certificates';
import { Appointments } from '@/pages/Appointments';
import { Reports } from '@/pages/Reports';
import { Backup } from '@/pages/Backup';
import { Settings } from '@/pages/Settings';
import { Analytics } from '@/pages/Analytics';
import { Referrals } from '@/pages/Referrals';
import { Reminders } from '@/pages/Reminders';
import { PatientProfile } from '@/pages/PatientProfile';
import { Splash } from '@/pages/Splash';
import { Login } from '@/pages/Login';
import { Help } from '@/pages/Help';
import { ActivityLog } from '@/pages/ActivityLog';
import { useState, useEffect, useCallback } from 'react';
import { db, initDatabase, setStorageItem, removeStorageItem } from '@/services/db';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);

  const checkSession = useCallback(() => {
    const authenticated = localStorage.getItem('emr_authenticated') === 'true';
    const user = db.getCurrentUser();
    if (authenticated && user) {
      setIsAuthenticated(true);
      setCurrentUser({ id: user.id, username: user.username, role: user.role });
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    async function loadDb() {
      await initDatabase();
      checkSession();
      const storedDark = localStorage.getItem('emr_dark_mode');
      setDarkMode(storedDark === 'true');
      setIsDbLoaded(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 1500);
    }
    loadDb();
  }, [checkSession]);

  useEffect(() => {
    if (!isDbLoaded) return;
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      setStorageItem('emr_dark_mode', 'true');
    } else {
      root.classList.remove('dark');
      setStorageItem('emr_dark_mode', 'false');
    }
  }, [darkMode, isDbLoaded]);

  const handleLogin = (user: { username: string; role: string }) => {
    setIsAuthenticated(true);
    setCurrentUser({ ...user, role: 'doctor', id: 'current-session' });
    setStorageItem('emr_authenticated', 'true');
    db.logActivity('Login', `User ${user.username} logged in successfully.`);
  };

  const handleLogout = () => {
    db.invalidateSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
    removeStorageItem('emr_authenticated');
    db.logActivity('Logout', 'User logged out securely.');
  };

  if (showSplash) {
    return <Splash />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
        <Sidebar onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 md:ml-[200px] flex flex-col h-screen overflow-hidden">
          <TopNavbar darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientProfile />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/logs" element={<ActivityLog />} />
              <Route path="/help" element={<Help />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/reminders" element={<Reminders />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
