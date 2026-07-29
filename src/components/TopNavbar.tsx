import { Search, Bell, Calendar, Moon, Sun, X, Clock, Users, Stethoscope, CheckCircle2, User, Menu, Pill, AlertTriangle, FileText, File, Filter, Star, Bookmark } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { db, Patient, Appointment, Reminder, Consultation, Prescription, MedicalDocument } from '@/services/db';
import { Link, useNavigate } from 'react-router-dom';
import { getLocalDate } from '@/lib/dates';
import { onDbChange } from '@/services/db';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    diagnosis?: string;
    dateFrom?: string;
    dateTo?: string;
    medication?: string;
    status?: string;
  };
  createdAt: string;
}

interface TopNavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function TopNavbar({ darkMode, setDarkMode, onLogout, onToggleSidebar }: TopNavbarProps) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'patients' | 'consultations' | 'prescriptions' | 'documents' | 'appointments'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState({ diagnosis: '', dateFrom: '', dateTo: '', medication: '', status: '' });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [doc, setDoc] = useState<{ name: string; regNumber: string; specialization: string; clinicName: string; clinicAddress: string; phone: string; email: string; profilePic?: string }>({ name: '', regNumber: '', specialization: '', clinicName: '', clinicAddress: '', phone: '', email: '' });
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    const [p, a, d, r, c, pres, docs] = await Promise.all([
      db.getPatients(),
      db.getAppointments(),
      db.getDoctorProfile(),
      db.getReminders(),
      db.getConsultations(),
      db.getPrescriptions(),
      db.getDocuments()
    ]);
    setPatients(p);
    setAppointments(a);
    setDoc(d);
    setReminders(r);
    setConsultations(c);
    setPrescriptions(pres);
    setDocuments(docs);
  };

  useEffect(() => {
    loadData();
    const unsub1 = onDbChange('patients:changed', loadData);
    const unsub2 = onDbChange('appointments:changed', loadData);
    const unsub3 = onDbChange('reminders:changed', loadData);
    const unsub4 = onDbChange('consultations:changed', loadData);
    const unsub5 = onDbChange('prescriptions:changed', loadData);
    const unsub6 = onDbChange('documents:changed', loadData);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('emr_saved_searches');
    if (saved) {
      try { setSavedSearches(JSON.parse(saved)); } catch (e) { console.error('Failed to parse saved searches', e); }
    }
    const favs = localStorage.getItem('emr_favorite_patients');
    if (favs) {
      try { setFavorites(JSON.parse(favs)); } catch (e) { console.error('Failed to parse favorites', e); }
    }
  }, []);

  const today = getLocalDate();
  const todaysReminders = useMemo(() => {
    const pending = reminders.filter(r => r.status === 'pending');
    const todayReminders = pending.filter(r => r.dueDate === today);
    const overdueReminders = pending.filter(r => r.dueDate < today);
    const upcomingReminders = pending.filter(r => r.dueDate > today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return [...overdueReminders, ...todayReminders, ...upcomingReminders.slice(0, 5)];
  }, [reminders, today]);

  const reminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'followup': return <Clock size={14} className="text-sky-500" />;
      case 'appointment': return <Calendar size={14} className="text-indigo-500" />;
      case 'chart_review': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'prescription_refill': return <Pill size={14} className="text-emerald-500" />;
    }
  };

  const reminderColor = (type: Reminder['type']) => {
    switch (type) {
      case 'followup': return 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400';
      case 'appointment': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400';
      case 'chart_review': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400';
      case 'prescription_refill': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400';
    }
  };

  const saveSearch = (name: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(), name, query: searchQuery, filters: { ...filters }, createdAt: new Date().toISOString()
    };
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('emr_saved_searches', JSON.stringify(updated));
  };

  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('emr_saved_searches', JSON.stringify(updated));
  };

  const applySavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query);
    setFilters({ diagnosis: search.filters.diagnosis || '', dateFrom: search.filters.dateFrom || '', dateTo: search.filters.dateTo || '', medication: search.filters.medication || '', status: search.filters.status || '' });
    setShowSearch(true);
  };

  const toggleFavorite = (patientId: string) => {
    const updated = favorites.includes(patientId) ? favorites.filter(id => id !== patientId) : [...favorites, patientId];
    setFavorites(updated);
    localStorage.setItem('emr_favorite_patients', JSON.stringify(updated));
  };

  const isFavorite = (patientId: string) => favorites.includes(patientId);

  const matchesQuery = (text: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return text.toLowerCase().includes(q);
  };

  const matchesFilters = (item: any, type: string) => {
    if (type === 'consultations') {
      if (filters.diagnosis && !item.diagnosis?.toLowerCase().includes(filters.diagnosis.toLowerCase())) return false;
      if (filters.dateFrom && item.date < filters.dateFrom) return false;
      if (filters.dateTo && item.date > filters.dateTo) return false;
    }
    if (type === 'prescriptions') {
      if (filters.medication && !item.medicines?.some((m: any) => m.name?.toLowerCase().includes(filters.medication.toLowerCase()))) return false;
      if (filters.dateFrom && item.date < filters.dateFrom) return false;
      if (filters.dateTo && item.date > filters.dateTo) return false;
    }
    if (type === 'appointments') {
      if (filters.dateFrom && item.date < filters.dateFrom) return false;
      if (filters.dateTo && item.date > filters.dateTo) return false;
      if (filters.status && item.status !== filters.status) return false;
    }
    if (type === 'documents') {
      if (filters.dateFrom && item.uploadDate < filters.dateFrom) return false;
      if (filters.dateTo && item.uploadDate > filters.dateTo) return false;
    }
    return true;
  };

  const patientResults = useMemo(() => patients.filter(p => matchesQuery(`${p.firstName} ${p.lastName} ${p.id} ${p.nic || ''} ${p.phone || ''}`) && matchesFilters(p, 'patients')), [patients, searchQuery, filters]);
  const consultationResults = useMemo(() => consultations.filter(c => matchesQuery(`${c.id} ${c.chiefComplaint} ${c.diagnosis} ${c.treatmentPlan} ${c.clinicalNotes} ${c.patientId}`) && matchesFilters(c, 'consultations')), [consultations, searchQuery, filters]);
  const prescriptionResults = useMemo(() => prescriptions.filter(p => { const medText = p.medicines?.map((m: any) => `${m.name} ${m.dosage}`).join(' ') || ''; return matchesQuery(`${p.id} ${p.patientId} ${medText}`) && matchesFilters(p, 'prescriptions'); }), [prescriptions, searchQuery, filters]);
  const documentResults = useMemo(() => documents.filter(d => matchesQuery(`${d.id} ${d.name} ${d.type} ${d.patientId}`) && matchesFilters(d, 'documents')), [documents, searchQuery, filters]);
  const appointmentResults = useMemo(() => appointments.filter(a => { const patient = patients.find(p => p.id === a.patientId); const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''; return matchesQuery(`${a.id} ${a.reason} ${a.notes} ${a.patientId} ${patientName}`) && matchesFilters(a, 'appointments'); }), [appointments, patients, searchQuery, filters]);

  const totalResults = patientResults.length + consultationResults.length + prescriptionResults.length + documentResults.length + appointmentResults.length;
  const patientName = (id: string) => { const p = patients.find(p => p.id === id); return p ? `${p.firstName} ${p.lastName}` : 'Unknown'; };

  const handleSearchResultClick = (type: string, id: string, patientId?: string) => {
    setShowSearch(false); setSearchQuery('');
    if (type === 'patient') navigate(`/patients/${id}`);
    else if (type === 'consultation') navigate(`/consultations`);
    else if (type === 'prescription') navigate(`/prescriptions`);
    else if (type === 'document') navigate(`/patients/${patientId}`);
    else if (type === 'appointment') navigate(`/appointments`);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Scheduled' || status === 'pending') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">Scheduled</span>;
    if (status === 'Completed' || status === 'completed') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
    if (status === 'Cancelled' || status === 'cancelled') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
  };

  const tabs = [
    { key: 'all', label: 'All', count: totalResults },
    { key: 'patients', label: 'Patients', count: patientResults.length },
    { key: 'consultations', label: 'Consultations', count: consultationResults.length },
    { key: 'prescriptions', label: 'Prescriptions', count: prescriptionResults.length },
    { key: 'documents', label: 'Documents', count: documentResults.length },
    { key: 'appointments', label: 'Appointments', count: appointmentResults.length },
  ] as const;

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-6 h-14 w-full no-print">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="md:hidden hover:text-slate-800 dark:hover:text-slate-100 p-1 -ml-2">
          <Menu size={20} />
        </button>
        <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search patients, consultations, prescriptions, documents..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-9 pr-4 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[13px] text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>
        
        {/* Search Center Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 min-w-[500px] max-w-[600px] mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
            <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Global Search</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="text-slate-400 hover:text-slate-600 p-1" title="Advanced Filters">
                  <Filter size={12} />
                </button>
                <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="text" placeholder="Diagnosis..." value={filters.diagnosis} onChange={(e) => setFilters(f => ({ ...f, diagnosis: e.target.value }))} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-100 outline-none" />
                  <input type="text" placeholder="Medication..." value={filters.medication} onChange={(e) => setFilters(f => ({ ...f, medication: e.target.value }))} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-100 outline-none" />
                  <input type="date" placeholder="From" value={filters.dateFrom} onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-100 outline-none" />
                  <input type="date" placeholder="To" value={filters.dateTo} onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-100 outline-none" />
                  <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-100 outline-none">
                    <option value="">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                  <button onClick={() => saveSearch(prompt('Save search as:') || searchQuery)} className="px-2 py-1 rounded border border-sky-200 text-sky-700 hover:bg-sky-50 text-[11px] font-semibold">
                    <Bookmark size={10} className="inline mr-1" /> Save Search
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 px-2 py-1.5 text-[10px] font-semibold transition-colors ${activeTab === tab.key ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Saved Searches */}
            {savedSearches.length > 0 && searchQuery === '' && (
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Saved Searches</span>
                <div className="flex flex-wrap gap-1">
                  {savedSearches.map(search => (
                    <button key={search.id} onClick={() => applySavedSearch(search)} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <Bookmark size={10} /> {search.name}
                      <X size={10} className="text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteSavedSearch(search.id); }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div className="p-3">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase mb-2 px-1">Quick Access</h4>
                  <Link to="/patients" onClick={() => setShowSearch(false)} className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"><Users size={14} className="text-sky-500" /> View all Patients</Link>
                  <Link to="/consultations" onClick={() => setShowSearch(false)} className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"><Stethoscope size={14} className="text-emerald-500" /> Start Consultation</Link>
                </div>
              ) : totalResults === 0 ? (
                <p className="px-3 py-4 text-[12px] text-slate-500 text-center">No results found across all records.</p>
              ) : (
                <div className="p-1 space-y-1">
                  {(activeTab === 'all' || activeTab === 'patients') && patientResults.slice(0, 5).map(patient => (
                    <button key={`patient-${patient.id}`} onClick={() => handleSearchResultClick('patient', patient.id)} className="w-full text-left flex items-center justify-between px-2 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                      <div className="flex items-center gap-2"><User size={14} className="text-sky-500" /><span className="font-medium text-slate-900 dark:text-slate-100">{patient.firstName} {patient.lastName}</span></div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(patient.id); }} className="p-0.5"><Star size={12} className={isFavorite(patient.id) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} /></button>
                        <span className="text-[11px] text-slate-400">{patient.id}</span>
                      </div>
                    </button>
                  ))}

                  {(activeTab === 'all' || activeTab === 'consultations') && consultationResults.slice(0, 5).map(consultation => (
                    <button key={`consultation-${consultation.id}`} onClick={() => handleSearchResultClick('consultation', consultation.id)} className="w-full text-left flex items-center justify-between px-2 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                      <div className="flex items-center gap-2"><FileText size={14} className="text-emerald-500" /><div><span className="font-medium text-slate-900 dark:text-slate-100">{consultation.chiefComplaint || 'Consultation'}</span><span className="text-[11px] text-slate-400 block">{patientName(consultation.patientId)} • {consultation.date}</span></div></div>
                      <span className="text-[10px] text-slate-500">{consultation.diagnosis}</span>
                    </button>
                  ))}

                  {(activeTab === 'all' || activeTab === 'prescriptions') && prescriptionResults.slice(0, 5).map(prescription => (
                    <button key={`prescription-${prescription.id}`} onClick={() => handleSearchResultClick('prescription', prescription.id)} className="w-full text-left flex items-center justify-between px-2 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                      <div className="flex items-center gap-2"><Pill size={14} className="text-violet-500" /><div><span className="font-medium text-slate-900 dark:text-slate-100">RX {prescription.id}</span><span className="text-[11px] text-slate-400 block">{patientName(prescription.patientId)} • {prescription.date}</span></div></div>
                      <span className="text-[10px] text-slate-500">{prescription.medicines?.length || 0} meds</span>
                    </button>
                  ))}

                  {(activeTab === 'all' || activeTab === 'documents') && documentResults.slice(0, 5).map(doc => (
                    <button key={`document-${doc.id}`} onClick={() => handleSearchResultClick('document', doc.id, doc.patientId)} className="w-full text-left flex items-center justify-between px-2 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                      <div className="flex items-center gap-2"><File size={14} className="text-amber-500" /><div><span className="font-medium text-slate-900 dark:text-slate-100">{doc.name}</span><span className="text-[11px] text-slate-400 block">{patientName(doc.patientId)} • {doc.type}</span></div></div>
                      <span className="text-[10px] text-slate-500">{doc.uploadDate}</span>
                    </button>
                  ))}

                  {(activeTab === 'all' || activeTab === 'appointments') && appointmentResults.slice(0, 5).map(apt => (
                    <button key={`appointment-${apt.id}`} onClick={() => handleSearchResultClick('appointment', apt.id)} className="w-full text-left flex items-center justify-between px-2 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-indigo-500" /><div><span className="font-medium text-slate-900 dark:text-slate-100">{apt.reason || 'Appointment'}</span><span className="text-[11px] text-slate-400 block">{patientName(apt.patientId)} • {apt.date} {apt.time}</span></div></div>
                      {getStatusBadge(apt.status)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites */}
            {favorites.length > 0 && searchQuery === '' && (
              <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Favorites</span>
                <div className="flex flex-wrap gap-1">
                  {favorites.slice(0, 10).map(pid => {
                    const patient = patients.find(p => p.id === pid);
                    if (!patient) return null;
                    return <button key={pid} onClick={() => handleSearchResultClick('patient', pid)} className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/30 text-[10px] text-amber-700 dark:text-amber-400 hover:bg-amber-100"><Star size={10} className="text-amber-500" /> {patient.firstName} {patient.lastName}</button>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-slate-500 relative">
          
          <div ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="hover:text-slate-800 dark:hover:text-slate-100 relative p-1 cursor-pointer">
              <Bell size={16} />
              {todaysReminders.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                  {todaysReminders.length}
                </span>
              )}
            </button>
            
            {/* Notification Center Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Reminders & Alerts</span>
                  <span className="text-[11px] bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full font-medium">
                    {todaysReminders.length} Active
                  </span>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {todaysReminders.length > 0 ? (
                    todaysReminders.map((reminder) => {
                      const patient = patients.find(p => p.id === reminder.patientId);
                      const isOverdue = reminder.dueDate < today;
                      return (
                        <div 
                          key={reminder.id} 
                          onClick={() => {
                            setShowNotifications(false);
                            if (reminder.type === 'appointment') navigate('/appointments');
                            else if (reminder.type === 'prescription_refill') navigate('/prescriptions');
                            else if (reminder.type === 'chart_review') navigate('/reports');
                            else navigate('/consultations');
                          }}
                          className={`p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-3 items-start ${isOverdue ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${reminderColor(reminder.type)}`}>
                            {reminderIcon(reminder.type)}
                          </div>
                          <div>
                            <h5 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{reminder.title}</h5>
                            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'} • Due: {reminder.dueDate}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[250px]">{reminder.message}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-[12px]">
                      <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
                      All caught up! No reminders.
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link to="/reminders" onClick={() => setShowNotifications(false)} className="text-[12px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    View All Reminders
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/appointments')} className="hover:text-slate-800 dark:hover:text-slate-100 p-1 cursor-pointer"><Calendar size={16} /></button>
          <button onClick={() => setDarkMode(!darkMode)} className="hover:text-slate-800 dark:hover:text-slate-100 p-1 cursor-pointer">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">{doc.name}</p>
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-semibold">{doc.specialization}</p>
          </div>
          {doc.profilePic ? (
            <img src={doc.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-[12px] cursor-pointer hover:bg-sky-200 dark:hover:bg-sky-900 transition-colors">
              {doc.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
