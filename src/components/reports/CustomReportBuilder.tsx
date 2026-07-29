import { useState } from 'react';
import { Calendar, Filter, BarChart3, Users, FileText, Activity } from 'lucide-react';
import { Patient, Consultation, Prescription, Appointment } from '@/services/db';
import { DateRange, CohortDefinition, CohortResult, ComparisonResult, computeCohortAnalysis, compareDateRanges, buildCohorts, getDefaultDateRanges } from '@/lib/reporting';

interface CustomReportBuilderProps {
  patients: Patient[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  onGenerate: (config: ReportConfig) => void;
}

export interface ReportConfig {
  mode: 'cohort' | 'comparison' | 'custom';
  dateRangeA?: DateRange;
  dateRangeB?: DateRange;
  cohort?: CohortDefinition;
  metrics: ('visits' | 'patients' | 'prescriptions' | 'appointments' | 'diagnoses')[];
  chartType: 'bar' | 'line' | 'area';
}

export function CustomReportBuilder({ patients, consultations, prescriptions, appointments, onGenerate }: CustomReportBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'cohort' | 'comparison' | 'custom'>('cohort');
  const [dateRangeA, setDateRangeA] = useState<DateRange>(getDefaultDateRanges().currentMonth);
  const [dateRangeB, setDateRangeB] = useState<DateRange>(getDefaultDateRanges().previousMonth);
  const [selectedCohortIndex, setSelectedCohortIndex] = useState(0);
  const [metrics, setMetrics] = useState<ReportConfig['metrics']>(['visits', 'patients', 'prescriptions', 'appointments']);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  const cohorts = buildCohorts(patients, consultations, prescriptions);

  const handleGenerate = () => {
    const config: ReportConfig = {
      mode,
      dateRangeA,
      dateRangeB,
      cohort: cohorts[selectedCohortIndex],
      metrics,
      chartType
    };
    onGenerate(config);
    setIsOpen(false);
  };

  const toggleMetric = (m: string) => {
    const validMetrics: Array<'visits' | 'patients' | 'prescriptions' | 'appointments' | 'diagnoses'> = ['visits', 'patients', 'prescriptions', 'appointments', 'diagnoses'];
    if (!validMetrics.includes(m as any)) return;
    setMetrics(prev => prev.includes(m as any) ? prev.filter(x => x !== m as any) : [...prev, m as any]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-semibold"
      >
        <Filter size={14} />
        Custom Report Builder
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">Custom Report Builder</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Design your own analytics report</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Report Mode</label>
                <div className="flex gap-2">
                  {[
                    { value: 'cohort', label: 'Cohort Analysis', icon: Users },
                    { value: 'comparison', label: 'Date Comparison', icon: BarChart3 },
                    { value: 'custom', label: 'Custom Metrics', icon: Activity }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value as any)}
                      className={`flex-1 p-3 rounded border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                        mode === opt.value
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <opt.icon size={18} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'cohort' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Patient Cohort</label>
                  <select
                    value={selectedCohortIndex}
                    onChange={e => setSelectedCohortIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"
                  >
                    {cohorts.map((c, i) => (
                      <option key={i} value={i}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {mode === 'comparison' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Period A Start</label>
                    <input type="date" value={dateRangeA.start} onChange={e => setDateRangeA({ ...dateRangeA, start: e.target.value })} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Period A End</label>
                    <input type="date" value={dateRangeA.end} onChange={e => setDateRangeA({ ...dateRangeA, end: e.target.value })} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Period B Start</label>
                    <input type="date" value={dateRangeB.start} onChange={e => setDateRangeB({ ...dateRangeB, start: e.target.value })} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Period B End</label>
                    <input type="date" value={dateRangeB.end} onChange={e => setDateRangeB({ ...dateRangeB, end: e.target.value })} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Metrics</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'visits', label: 'Visits' },
                    { value: 'patients', label: 'Patients' },
                    { value: 'prescriptions', label: 'Prescriptions' },
                    { value: 'appointments', label: 'Appointments' },
                    { value: 'diagnoses', label: 'Diagnoses' }
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => toggleMetric(m.value)}
                      className={`px-3 py-1.5 rounded border text-[11px] font-semibold transition-colors ${
                        metrics.includes(m.value as any)
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Chart Type</label>
                <div className="flex gap-2">
                  {[
                    { value: 'bar', label: 'Bar' },
                    { value: 'line', label: 'Line' },
                    { value: 'area', label: 'Area' }
                  ].map(ct => (
                    <button
                      key={ct.value}
                      onClick={() => setChartType(ct.value as any)}
                      className={`flex-1 py-2 rounded border text-xs font-semibold transition-colors ${
                        chartType === ct.value
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
                <button onClick={handleGenerate} className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold flex items-center gap-1.5">
                  <FileText size={14} />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
