import { useState, useEffect, useMemo } from 'react';
import { Download, LineChart, CalendarRange } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TrendChart } from '@/components/analytics/TrendChart';
import { AgingChart } from '@/components/analytics/AgingChart';
import { BreakdownCharts } from '@/components/analytics/BreakdownCharts';
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { computeAnalytics, AnalyticsPeriod } from '@/lib/analytics';
import { db, onDbChange } from '@/services/db';

type Mode = 'bar' | 'line';

export function Analytics() {
  const [patients, setPatients] = useState(() => db.getPatientsSync());
  const [consultations, setConsultations] = useState(() => db.getConsultationsSync());
  const [prescriptions, setPrescriptions] = useState(() => db.getPrescriptionsSync());
  const [appointments, setAppointments] = useState(() => db.getAppointmentsSync());
  const [period, setPeriod] = useState<AnalyticsPeriod>('monthly');
  const [mode, setMode] = useState<Mode>('bar');

  useEffect(() => {
    const load = async () => {
      setPatients(await db.getPatients());
      setConsultations(await db.getConsultations());
      setPrescriptions(await db.getPrescriptions());
      setAppointments(await db.getAppointments());
    };
    load();
    const unsub1 = onDbChange('patients:changed', load);
    const unsub2 = onDbChange('consultations:changed', load);
    const unsub3 = onDbChange('prescriptions:changed', load);
    const unsub4 = onDbChange('appointments:changed', load);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  const analytics = useMemo(
    () => computeAnalytics(patients, consultations, prescriptions, appointments, period),
    [patients, consultations, prescriptions, appointments, period]
  );

  const handleExportCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Visits', analytics.totalVisits],
      ['Total Diagnoses', analytics.totalDiagnoses],
      ['Total Prescriptions', analytics.totalPrescriptions],
      ['Total Follow-ups', analytics.totalFollowUps],
      ['No-show Rate (%)', analytics.noShowRate],
      ['Avg Visits per Patient', analytics.avgVisitsPerPatient]
    ];
    const csvContent = "data:text/csv;charset=utf-8," +
      [headers.join(','), ...rows.map(r => r.map(val => `"${String(val ?? '')}"`).join(','))].join('\n');
    const encodedUri = encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Analytics_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Real-time trends, aging charts, and population breakdowns.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-1 py-1">
            {(['daily', 'weekly', 'monthly', 'yearly'] as AnalyticsPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={p === period ? 'bg-sky-500 text-white px-2 py-1 rounded text-[11px] font-semibold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 px-2 py-1 rounded text-[11px] font-semibold'}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMode(m => m === 'bar' ? 'line' : 'bar')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1.5 rounded text-[11px] font-semibold hover:border-sky-300 transition-colors cursor-pointer"
            title="Toggle chart type"
          >
            <LineChart size={14} className="inline-block mr-1" />
            {mode === 'bar' ? 'Bar' : 'Line'}
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1.5 rounded text-[11px] font-semibold hover:border-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <AnalyticsCard title="Visits" metric={analytics.totalVisits} accent="sky" sub="Consultations" />
        <AnalyticsCard title="Diagnoses" metric={analytics.totalDiagnoses} accent="emerald" sub="Recorded" />
        <AnalyticsCard title="Prescriptions" metric={analytics.totalPrescriptions} accent="amber" sub="Issued" />
        <AnalyticsCard title="Follow-ups" metric={analytics.totalFollowUps} accent="sky" sub="Scheduled" />
        <AnalyticsCard title="No-show Rate" metric={`${analytics.noShowRate}%`} accent="rose" sub="Cancelled appointments" />
        <AnalyticsCard title="Avg Visits" metric={analytics.avgVisitsPerPatient} accent="emerald" sub="Per patient" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange size={16} className="text-slate-500" />
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Trend Analysis ({period})</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold">Visits / Diagnoses / Prescriptions / Follow-ups / No-shows</p>
        </div>
        <div className="p-4 h-72">
          <TrendChart data={analytics.trendData} mode={mode} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Breakdowns</h3>
        </div>
        <div className="p-4">
          <BreakdownCharts
            ageData={analytics.ageData}
            diagnosisData={analytics.diagnosisData}
            genderData={analytics.genderData}
            statusData={analytics.statusData}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Aging Charts for Chronic Conditions</h3>
        </div>
        <div className="p-4 h-72">
          <AgingChart data={analytics.chronicData} />
        </div>
      </div>
    </div>
  );
}
