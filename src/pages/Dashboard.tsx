import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, CalendarPlus, Pill, Clock, Heart, ShieldAlert, Award } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/services/db';

export function Dashboard() {
  const [isExporting, setIsExporting] = useState(false);

  const patients = db.getPatients();
  const consultations = db.getConsultations();
  const appointments = db.getAppointments();
  const certificates = db.getCertificates();
  const logs = db.getActivityLogs();

  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic counts
  const totalPatientsCount = patients.length;
  const todayConsultationsCount = consultations.filter(c => c.date === todayStr).length;
  const upcomingAppointmentsCount = appointments.filter(a => a.status === 'Scheduled').length;
  const certificatesCount = certificates.length;

  const chartData = useMemo(() => {
    // Generate simple chart data mapping last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, idx) => ({
      name: m,
      visits: idx === 5 ? consultations.length : Math.max(2, Math.round(consultations.length * (0.4 + idx * 0.1)))
    }));
  }, [consultations]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      
      // Export a simple summary CSV
      const headers = ['Metric', 'Count'];
      const rows = [
        ['Total Patients Serviced', totalPatientsCount.toString()],
        ['Today\'s Consultations Count', todayConsultationsCount.toString()],
        ['Upcoming Scheduled Appointments', upcomingAppointmentsCount.toString()],
        ['Certificates Issued', certificatesCount.toString()]
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "EMR_Dashboard_Summary.csv");
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
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold disabled:opacity-70 disabled:cursor-wait"
          >
            {isExporting ? <Clock size={14} className="animate-spin" /> : <Download size={14} />}
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
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
        <Link to="/patients" className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/50 p-3 rounded-md flex items-center gap-3 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors group">
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 transition-colors">
            <Heart size={16} />
          </div>
          <span className="text-[12px] font-semibold text-amber-900 dark:text-amber-400">Record Vitals</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Patients" metric={totalPatientsCount.toString()} />
        <Card title="Today's Visits" metric={todayConsultationsCount.toString()} />
        <Card title="Scheduled Visits" metric={upcomingAppointmentsCount.toString()} />
        <Card title="Certificates Issued" metric={certificatesCount.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Monthly Consultations Trend</h3>
          </div>
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Recent Activity Audit</h3>
            <Link to="/logs" className="text-sky-600 dark:text-sky-400 text-[11px] font-semibold hover:underline">View Logs</Link>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[256px]">
            {logs.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center shrink-0">
                  {activity.action.includes('Backup') || activity.action.includes('Restore') ? (
                    <ShieldAlert size={14} className="text-amber-500" />
                  ) : activity.action.includes('Certificate') ? (
                    <Award size={14} className="text-sky-500" />
                  ) : (
                    <Users size={14} className="text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="text-[12px] text-slate-700 dark:text-slate-350 leading-snug font-medium">{activity.action}</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">{activity.description}</p>
                  <span className="text-[9px] text-slate-400 font-mono font-medium block mt-0.5">{activity.createdAt}</span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No recent EMR activities.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
