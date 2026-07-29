import { LayoutDashboard, Users, FileText, ClipboardList, Calendar, BarChart, HardDrive, Settings, LogOut, HelpCircle, FileBadge, ShieldAlert, X, Activity, UserRoundPlus, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Consultations', path: '/consultations', icon: FileText },
  { name: 'Prescriptions', path: '/prescriptions', icon: ClipboardList },
  { name: 'Certificates', path: '/certificates', icon: FileBadge },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Referrals', path: '/referrals', icon: UserRoundPlus },
  { name: 'Reminders', path: '/reminders', icon: Bell },
  { name: 'Analytics', path: '/analytics', icon: Activity },
  { name: 'Reports', path: '/reports', icon: BarChart },
  { name: 'Backup', path: '/backup', icon: HardDrive },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Activity Log', path: '/logs', icon: ShieldAlert },
  { name: 'Help', path: '/help', icon: HelpCircle },
];

interface SidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onLogout, isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden no-print"
          onClick={onClose}
        />
      )}
      <nav className={`fixed left-0 top-0 h-full w-[200px] bg-slate-900 text-slate-400 flex flex-col py-6 z-50 no-print transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-white p-0.5">
              <img src="/Applogo.png" alt="Logo" className="w-full h-full object-contain block" />
            </div>
            <div>
              <h1 className="font-extrabold text-[16px] tracking-tight text-slate-50 leading-tight">MediCare</h1>
              <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Doctor Workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-50 p-1">
            <X size={18} />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto space-y-0">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-5 py-2.5 text-[13px] transition-colors border-l-[3px] group",
                isActive
                  ? "bg-slate-800 text-sky-400 border-sky-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-50 border-transparent"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className={cn(isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-50")} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="px-5 mt-auto pt-5 border-t border-slate-800">
        <button onClick={onLogout} className="flex w-full items-center gap-3 py-2 text-[13px] text-slate-400 hover:text-slate-50 transition-colors">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
    </>
  );
}
