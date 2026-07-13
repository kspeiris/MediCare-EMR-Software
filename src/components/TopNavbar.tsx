import { Search, Bell, Calendar, Moon, Sun, X, Clock, Users, Stethoscope, CheckCircle2, User } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { db, Patient, Appointment } from '@/services/db';
import { Link, useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export function TopNavbar({ darkMode, setDarkMode, onLogout }: TopNavbarProps) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const doc = db.getDoctorProfile();
  const patients = db.getPatients();
  const appointments = db.getAppointments();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter patients based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return patients.filter((p: Patient) => 
      p.firstName.toLowerCase().includes(query) ||
      p.lastName.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.nic && p.nic.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query))
    );
  }, [patients, searchQuery]);

  // Today's appointments for notifications
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = useMemo(() => {
    return appointments.filter((a: Appointment) => a.date === today && a.status === 'Scheduled');
  }, [appointments, today]);

  const handleSearchResultClick = (patientId: string) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate(`/patients/${patientId}`);
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-6 h-14 w-full no-print">
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search patients by ID, Name, NIC, or Phone..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-9 pr-4 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[13px] text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>
        
        {/* Search Center Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 w-[500px] mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
            <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">EMR Global Search</span>
              <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
            </div>
            <div className="p-2 space-y-4 max-h-[300px] overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase mb-2 px-2">Suggestions</h4>
                  <Link to="/patients" onClick={() => setShowSearch(false)} className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                    <Users size={14} className="text-sky-500" /> View all Patients
                  </Link>
                  <Link to="/consultations" onClick={() => setShowSearch(false)} className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                    <Stethoscope size={14} className="text-emerald-500" /> Start Consultation
                  </Link>
                </div>
              ) : (
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase mb-2 px-2">Patient Matches</h4>
                  {searchResults.length > 0 ? (
                    searchResults.map((patient) => (
                      <button 
                        key={patient.id} 
                        onClick={() => handleSearchResultClick(patient.id)}
                        className="w-full text-left flex items-center justify-between px-2 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">{patient.firstName} {patient.lastName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {patient.id} • {patient.phone}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-3 text-[12px] text-slate-500">No patient matching query found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-slate-500 relative">
          
          <div ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="hover:text-slate-800 dark:hover:text-slate-100 relative p-1">
              <Bell size={16} />
              {todaysAppointments.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </button>
            
            {/* Notification Center Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Today's Reminders</span>
                  <span className="text-[11px] bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full font-medium">
                    {todaysAppointments.length} pending
                  </span>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {todaysAppointments.length > 0 ? (
                    todaysAppointments.map((apt) => {
                      const patient = patients.find(p => p.id === apt.patientId);
                      return (
                        <div 
                          key={apt.id} 
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/appointments');
                          }}
                          className="p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-3 items-start"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Clock size={14} />
                          </div>
                          <div>
                            <h5 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Upcoming Visit</h5>
                            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'} at {apt.time} ({apt.reason})
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-[12px]">
                      <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
                      No scheduled consultations left for today!
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link to="/appointments" onClick={() => setShowNotifications(false)} className="text-[12px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    View Daily Schedule
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/appointments')} className="hover:text-slate-800 dark:hover:text-slate-100 p-1"><Calendar size={16} /></button>
          <button onClick={() => setDarkMode(!darkMode)} className="hover:text-slate-800 dark:hover:text-slate-100 p-1">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="text-right">
            <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">{doc.name}</p>
            <p className="text-[9px] text-slate-400 uppercase font-semibold">{doc.specialization}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-[12px] cursor-pointer hover:bg-sky-200 dark:hover:bg-sky-900 transition-colors">
            {doc.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  );
}

