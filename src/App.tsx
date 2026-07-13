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
import { PatientProfile } from '@/pages/PatientProfile';
import { Splash } from '@/pages/Splash';
import { Login } from '@/pages/Login';
import { Help } from '@/pages/Help';
import { ActivityLog } from '@/pages/ActivityLog';
import { useState, useEffect } from 'react';
import { db } from '@/services/db';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('emr_authenticated') === 'true';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('emr_dark_mode') === 'true';
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('emr_dark_mode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('emr_dark_mode', 'false');
    }
  }, [darkMode]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('emr_authenticated', 'true');
    db.logActivity('Login', 'Doctor logged in successfully.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('emr_authenticated');
    db.logActivity('Logout', 'Doctor logged out.');
  };

  if (showSplash) {
    return <Splash />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 ml-[200px] flex flex-col h-screen overflow-hidden">
          <TopNavbar darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />
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
              <Route path="/logs" element={<ActivityLog />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}


