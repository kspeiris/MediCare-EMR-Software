import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, CalendarPlus, Pill, FileText, Clock, Heart, ShieldAlert, Award, Stethoscope, ClipboardList, BellRing, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { getLocalDate, parseDate } from '@/lib/dates';
import { Link } from 'react-router-dom';
import { db, onDbChange } from '@/services/db';
import { Patient, Consultation, Appointment, Reminder } from '@/services/db';

export function Dashboard() {
  const [isExporting, setIsExporting] = useState(false);
  const [patients, setPatients] = useState(() => db.getPatientsSync());
  const [consultations, setConsultations] = useState(() => db.getConsultationsSync());
  const [appointments, setAppointments] = useState(() => db.getAppointmentsSync());
  const [certificates, setCertificates] = useState(() => db.getCertificatesSync());
  const [logs, setLogs] = useState(() => db.getActivityLogsSync());
  const [prescriptions, setPrescriptions] = useState(() => db.getPrescriptionsSync());
  const [reminders, setReminders] = useState(() => db.getRemindersSync());
  const [isGeneratingReminders, setIsGeneratingReminders] = useState(false);

  const loadData = () => {
    db.getPatients().then(setPatients);
    db.getConsultations().then(setConsultations);
    db.getAppointments().then(setAppointments);
    db.getCertificates().then(setCertificates);
    db.getActivityLogs().then(setLogs);
    db.getPrescriptions().then(setPrescriptions);
    db.getReminders().then(setReminders);
  };

  useEffect(() => {
    loadData();
    const unsub1 = onDbChange('patients:changed', loadData);
    const unsub2 = onDbChange('consultations:changed', loadData);
    const unsub3 = onDbChange('appointments:changed', loadData);
    const unsub4 = onDbChange('certificates:changed', loadData);
    const unsub5 = onDbChange('logs:changed', loadData);
    const unsub6 = onDbChange('prescriptions:changed', loadData);
    const unsub7 = onDbChange('reminders:changed', loadData);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); unsub7(); };
  }, []);

  const todayStr = getLocalDate();

  const patientMap = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach(p => map.set(p.id, p));
    return map;
  }, [patients]);

  const patientName = (id: string) => {
    const p = patientMap.get(id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient';
  };

  const activePatientsCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeIds = new Set(
      consultations
        .filter(c => new Date(c.date) >= thirtyDaysAgo)
        .map(c => c.patientId)
    );
    return activeIds.size;
  }, [consultations]);

  const overdueFollowUpsCount = useMemo(() => {
    return consultations.filter(c => {
      if (!c.followupDate) return false;
      return c.followupDate < todayStr;
    }).length;
  }, [consultations, todayStr]);

  const missedAppointmentsCount = useMemo(() => {
    return appointments.filter(a => {
      if (a.status !== 'Cancelled') return false;
      return a.date < todayStr;
    }).length;
  }, [appointments, todayStr]);

  const overdueChartReviewCount = useMemo(() => {
    return consultations.filter(c => c.date < todayStr).length;
  }, [consultations, todayStr]);

  const pendingPrescriptionRefills = useMemo(() => {
    return prescriptions.length;
  }, [prescriptions]);

  const activeRemindersCount = useMemo(() => {
    return reminders.filter(r => r.status === 'pending').length;
  }, [reminders]);

  const generateReminders = async () => {
    setIsGeneratingReminders(true);
    try {
      await db.generateReminders();
      loadData();
    } catch (error) {
      console.error('Failed to generate reminders:', error);
    } finally {
      setIsGeneratingReminders(false);
    }
  };

  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const now = new Date();
    return months.map((m, idx) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const year = monthDate.getFullYear();
      const month = String(monthDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      const count = consultations.filter(c => c.date && c.date.startsWith(monthStr)).length;
      return { name: m, visits: count };
    });
  }, [consultations]);

  const todayConsultations = useMemo(
    () => consultations.filter(c => c.date === todayStr).sort((a, b) => a.time.localeCompare(b.time)),
    [consultations, todayStr]
  );

  const todayAppointments = useMemo(
    () => appointments.filter(a => a.date === todayStr).sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, todayStr]
  );

  const overdueFollowUps = useMemo(
    () => consultations.filter(c => c.followupDate && c.followupDate < todayStr).sort((a, b) => a.followupDate!.localeCompare(b.followupDate!)),
    [consultations, todayStr]
  );

  const upcomingReminders = useMemo(
    () => appointments.filter(a => a.date >= todayStr && a.status === 'Scheduled').sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [appointments, todayStr]
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const headers = ['Metric', 'Count'];
      const rows = [
        ['Total Patients', patients.length.toString()],
        ['Active Patients (30d)', activePatientsCount.toString()],
        ["Today's Consultations", todayConsultations.length.toString()],
        ['Upcoming Scheduled Appointments', appointments.filter(a => a.status === 'Scheduled').length.toString()],
        ['Overdue Follow-ups', overdueFollowUpsCount.toString()],
        ['Missed Appointments', missedAppointmentsCount.toString()],
        ['Overdue Chart Reviews', overdueChartReviewCount.toString()],
        ['Active Reminders', activeRemindersCount.toString()],
        ['Pending Prescriptions', prescriptions.length.toString()],
        ['Certificates Issued', certificates.length.toString()]
      ];
      const csvContent = "data:text/csv;charset=utf-8," +
        [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      const encodedUri = encodeURIComponent(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'EMR_Dashboard_Summary.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 800);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Welcome back! Here is what is happening today.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateReminders}
            disabled={isGeneratingReminders}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold disabled:opacity-70 disabled:cursor-wait"
          >
            {isGeneratingReminders ? <Clock size={14} className="animate-spin" /> : <BellRing size={14} />}
            {isGeneratingReminders ? "Generating..." : "Generate Reminders"}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold disabled:opacity-70 disabled:cursor-wait"
          >
            {isExporting ? <Clock size={14} className="animate-spin" /> : <Download size={14} />}
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Active Patients</span>
          <span className="text-[20px] font-bold text-sky-600 dark:text-sky-300">{activePatientsCount}</span>
          <span className="text-[11px] text-slate-500">Seen in last 30 days</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Overdue Follow-ups</span>
          <span className="text-[20px] font-bold text-amber-600 dark:text-amber-300">{overdueFollowUpsCount}</span>
          <span className="text-[11px] text-slate-500">Past due date</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pending Prescriptions</span>
          <span className="text-[20px] font-bold text-emerald-600 dark:text-emerald-300">{prescriptions.length}</span>
          <span className="text-[11px] text-slate-500">Total issued</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chart Reviews</span>
          <span className="text-[20px] font-bold text-rose-600 dark:text-rose-300">{overdueChartReviewCount}</span>
          <span className="text-[11px] text-slate-500">Past consultations</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Active Reminders</span>
          <span className="text-[20px] font-bold text-indigo-600 dark:text-indigo-300">{activeRemindersCount}</span>
          <span className="text-[11px] text-slate-500">Pending notifications</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Patients</span>
          <span className="text-[20px] font-bold text-slate-700 dark:text-slate-200">{patients.length}</span>
          <span className="text-[11px] text-slate-500">Registered patients</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Today's Appointments</span>
          <span className="text-[20px] font-bold text-indigo-600 dark:text-indigo-300">{todayAppointments.length}</span>
          <span className="text-[11px] text-slate-500">Scheduled today</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Missed Appointments</span>
          <span className="text-[20px] font-bold text-rose-600 dark:text-rose-300">{missedAppointmentsCount}</span>
          <span className="text-[11px] text-slate-500">Cancelled & past</span>
        </div>
        </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/patients" className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-sky-100 dark:hover:bg-sky-950/40 transition-colors group">
          <div className="bg-sky-100 dark:bg-sky-900 p-2 rounded text-sky-600 dark:text-sky-400 group-hover:bg-sky-200 transition-colors">
            <Users size={16} />
          </div>
          <span className="text-[12px] font-semibold text-sky-900 dark:text-sky-400">New Patient</span>
        </Link>
        <Link to="/appointments" className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-colors group">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 transition-colors">
            <CalendarPlus size={16} />
          </div>
          <span className="text-[12px] font-semibold text-indigo-900 dark:text-indigo-400">Schedule Visit</span>
        </Link>
        <Link to="/prescriptions" className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors group">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 transition-colors">
            <Pill size={16} />
          </div>
          <span className="text-[12px] font-semibold text-emerald-900 dark:text-emerald-400">Prescribe</span>
        </Link>
        <Link to="/consultations" className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors group">
          <div className="bg-rose-100 dark:bg-rose-900 p-2 rounded text-rose-600 dark:text-rose-400 group-hover:bg-rose-200 transition-colors">
            <FileText size={16} />
          </div>
          <span className="text-[12px] font-semibold text-rose-900 dark:text-rose-400">Consultation</span>
        </Link>
        <Link to="/consultations" className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-colors group">
          <div className="bg-violet-100 dark:bg-violet-900 p-2 rounded text-violet-600 dark:text-violet-400 group-hover:bg-violet-200 transition-colors">
            <Stethoscope size={16} />
          </div>
          <span className="text-[12px] font-semibold text-violet-900 dark:text-violet-400">New Consultation</span>
        </Link>
        <Link to="/certificates" className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors group">
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 transition-colors">
            <Award size={16} />
          </div>
          <span className="text-[12px] font-semibold text-amber-900 dark:text-amber-400">Issue Certificate</span>
        </Link>
        <Link to="/patients" className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-teal-100 dark:hover:bg-teal-950/40 transition-colors group">
          <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded text-teal-600 dark:text-teal-400 group-hover:bg-teal-200 transition-colors">
            <ClipboardList size={16} />
          </div>
          <span className="text-[12px] font-semibold text-teal-900 dark:text-teal-400">Patient Registry</span>
        </Link>
        <Link to="/backup" className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-md flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
          <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded text-slate-600 dark:text-slate-300 group-hover:bg-slate-300 transition-colors">
            <ShieldAlert size={16} />
          </div>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">Backup Data</span>
        </Link>
      </div>

      {/* Today's Work */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Today's Work</h3>
          <span className="text-[10px] text-slate-500 font-semibold">{todayStr}</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Consultations</h4>
            {todayConsultations.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {todayConsultations.slice(0, 10).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">{patientName(c.patientId)}</p>
                      <p className="text-[10px] text-slate-500">{c.time} · {c.diagnosis || 'No diagnosis'}</p>
                    </div>
                    <Link to={`/patients/${c.patientId}`} className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold hover:underline">View</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-500">No consultations scheduled today.</p>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Appointments</h4>
            {todayAppointments.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {todayAppointments.slice(0, 10).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">{patientName(a.patientId)}</p>
                      <p className="text-[10px] text-slate-500">{a.time} · {a.reason || 'No reason'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.status === 'Scheduled' ? 'bg-sky-50 text-sky-700 border border-sky-200' : a.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-500">No appointments scheduled today.</p>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Reminders</h4>
            {reminders.filter(r => r.status === 'pending').length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reminders.filter(r => r.status === 'pending').slice(0, 10).map(r => {
                  const isOverdue = r.dueDate < todayStr;
                  const patientNameStr = patientName(r.patientId);
                  return (
                    <Link 
                      key={r.id} 
                      to={r.type === 'appointment' ? '/appointments' : r.type === 'prescription_refill' ? '/prescriptions' : r.type === 'chart_review' ? '/reports' : '/consultations'}
                      className={`flex items-center justify-between p-2 rounded border hover:bg-white dark:hover:bg-slate-900 transition-colors ${isOverdue ? 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}
                    >
                      <div>
                        <p className={`text-[12px] font-semibold ${isOverdue ? 'text-rose-800 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'}`}>{patientNameStr}</p>
                        <p className={`text-[10px] ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>{r.title} - {r.message.substring(0, 40)}</p>
                      </div>
                      <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-700' : 'text-slate-600'}`}>{isOverdue ? 'Overdue' : r.dueDate}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-slate-500">No reminders at this time.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Monthly Consultations Trend</h3>
          </div>
          <div className="h-64 p-4">
            {consultations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '6px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '12px', padding: '8px' }}
                    cursor={{ fill: 'var(--tooltip-cursor)' }}
                  />
                  <Bar dataKey="visits" fill="#0284c7" radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No consultation data yet</p>
                  <p className="text-xs text-slate-400 mt-1">The trend chart will appear once visits are recorded.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Recent Activity Audit</h3>
            <Link to="/logs" className="text-sky-600 dark:text-sky-400 text-[11px] font-semibold hover:underline">View Logs</Link>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[256px]">
            {logs.length > 0 ? (
              logs.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {activity.action.includes('Backup') || activity.action.includes('Restore') ? (
                      <ShieldAlert size={14} className="text-amber-500" />
                    ) : activity.action.includes('Certificate') ? (
                      <Award size={14} className="text-sky-500" />
                    ) : (
                      <Users size={14} className="text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-snug font-medium">{activity.action}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{activity.description}</p>
                    <span className="text-[9px] text-slate-400 font-mono font-medium block mt-0.5">{activity.createdAt}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center py-8">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No recent activity yet</p>
                  <p className="text-xs text-slate-400 mt-1">Actions will appear here as the clinic workflow runs.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
