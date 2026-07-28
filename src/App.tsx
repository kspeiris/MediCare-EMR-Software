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
import { useState, useEffect, useCallback } from 'react';
import { db, initDatabase, setStorageItem, removeStorageItem } from '@/services/db';

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/': ['admin', 'doctor', 'receptionist'],
  '/patients': ['admin', 'doctor', 'receptionist'],
  '/patients/:id': ['admin', 'doctor', 'receptionist'],
  '/consultations': ['admin', 'doctor'],
  '/prescriptions': ['admin', 'doctor'],
  '/certificates': ['admin', 'doctor'],
  '/appointments': ['admin', 'doctor', 'receptionist'],
  '/reports': ['admin', 'doctor'],
  '/backup': ['admin'],
  '/settings': ['admin', 'doctor', 'receptionist'],
  '/logs': ['admin'],
  '/help': ['admin', 'doctor', 'receptionist']
};

function RequireRole({ children, allowedRoles, currentRole }: { children: React.ReactNode; allowedRoles: string[]; currentRole?: string }) {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-red-500">Access Denied</h2>
        <p className="text-sm text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }
  return <>{children}</>;
}

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
    setCurrentUser({ ...user, id: 'current-session' });
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
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
        <Sidebar onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentRole={currentUser?.role} />
        <div className="flex-1 md:ml-[200px] flex flex-col h-screen overflow-hidden">
          <TopNavbar darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientProfile />} />
              <Route path="/consultations" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/consultations']} currentRole={currentUser?.role}><Consultations /></RequireRole>} />
              <Route path="/prescriptions" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/prescriptions']} currentRole={currentUser?.role}><Prescriptions /></RequireRole>} />
              <Route path="/certificates" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/certificates']} currentRole={currentUser?.role}><Certificates /></RequireRole>} />
              <Route path="/appointments" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/appointments']} currentRole={currentUser?.role}><Appointments /></RequireRole>} />
              <Route path="/reports" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/reports']} currentRole={currentUser?.role}><Reports /></RequireRole>} />
              <Route path="/backup" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/backup']} currentRole={currentUser?.role}><Backup /></RequireRole>} />
              <Route path="/settings" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/settings']} currentRole={currentUser?.role}><Settings /></RequireRole>} />
              <Route path="/logs" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/logs']} currentRole={currentUser?.role}><ActivityLog /></RequireRole>} />
              <Route path="/help" element={<RequireRole allowedRoles={ROUTE_PERMISSIONS['/help']} currentRole={currentUser?.role}><Help /></RequireRole>} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
