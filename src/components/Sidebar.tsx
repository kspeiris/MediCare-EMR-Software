import { LayoutDashboard, Users, FileText, ClipboardList, Calendar, BarChart, HardDrive, Settings, LogOut, HelpCircle, Stethoscope, FileBadge, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Consultations', path: '/consultations', icon: FileText },
  { name: 'Prescriptions', path: '/prescriptions', icon: ClipboardList },
  { name: 'Certificates', path: '/certificates', icon: FileBadge },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Reports', path: '/reports', icon: BarChart },
  { name: 'Backup', path: '/backup', icon: HardDrive },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Activity Log', path: '/logs', icon: ShieldAlert },
  { name: 'Help', path: '/help', icon: HelpCircle },
];

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <nav className="fixed left-0 top-0 h-full w-[200px] bg-slate-900 text-slate-400 flex flex-col py-6 z-20 no-print">
      <div className="px-6 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-sky-500 flex items-center justify-center text-white">
          <Stethoscope size={18} />
        </div>
        <div>
          <h1 className="font-extrabold text-[16px] tracking-tight text-slate-50 leading-tight">MediCare</h1>
          <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">EMR System</p>
        </div>
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
  );
}

