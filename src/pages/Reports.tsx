import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import { Download, Table2, FileText, Filter, TrendingUp } from 'lucide-react';
import { Table, Th, Td } from '@/components/ui/Table';
import { useState, useMemo, useEffect } from 'react';
import { getLocalDate, getLocalDateTime } from '@/lib/dates';
import { db, getStorageItem, setStorageItem } from '@/services/db';
import { Modal } from '@/components/ui/Modal';
import { generatePDF } from '@/components/print-templates/pdfExport';
import { ReportPrintTemplate } from '@/components/print-templates/ReportPrintTemplate';
import { onDbChange } from '@/services/db';
import { CustomReportBuilder, ReportConfig } from '@/components/reports/CustomReportBuilder';
import { ReportCharts } from '@/components/reports/ReportCharts';
import { CohortResult, ComparisonResult, computeCohortAnalysis, compareDateRanges, buildCohorts, getDefaultDateRanges } from '@/lib/reporting';

type ReportPreview = { type: 'summary' | 'patients' | 'consultations' | 'cohort' | 'comparison'; title: string; data?: any };

export function Reports() {
  const [isExporting, setIsExporting] = useState(false);
  const [previewReport, setPreviewReport] = useState<ReportPreview | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportLogs, setExportLogs] = useState<{ reportName: string; platform: string; type: string; exportedAt: string }[]>(() => getStorageItem('emr_export_logs', []));
  const [bannerMessage, setBannerMessage] = useState('');
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customReportData, setCustomReportData] = useState<{ cohort?: CohortResult; comparison?: ComparisonResult; config?: ReportConfig } | null>(null);

  const [patients, setPatients] = useState(() => db.getPatientsSync());
  const [consultations, setConsultations] = useState(() => db.getConsultationsSync());
  const [appointments, setAppointments] = useState(() => db.getAppointmentsSync());
  const [prescriptions, setPrescriptions] = useState(() => db.getPrescriptionsSync());

  const loadData = () => {
    db.getPatients().then(setPatients);
    db.getConsultations().then(setConsultations);
    db.getAppointments().then(setAppointments);
    db.getPrescriptions().then(setPrescriptions);
    setExportLogs(getStorageItem('emr_export_logs', []));
  };

  useEffect(() => {
    loadData();
    const unsub1 = onDbChange('patients:changed', loadData);
    const unsub2 = onDbChange('consultations:changed', loadData);
    const unsub3 = onDbChange('appointments:changed', loadData);
    const unsub4 = onDbChange('prescriptions:changed', loadData);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  const totalConsultations = consultations.length;
  const totalPatients = patients.length;
  const totalPrescriptions = prescriptions.length;
  const upcomingFollowups = appointments.filter(a => a.status === 'Scheduled').length;

  const topDiagnosis = useMemo(() => {
    if (consultations.length === 0) return 'None';
    const counts: Record<string, number> = {};
    consultations.forEach(c => {
      if (c.diagnosis) counts[c.diagnosis] = (counts[c.diagnosis] || 0) + 1;
    });
    let top = 'None';
    let max = 0;
    Object.entries(counts).forEach(([diag, count]) => {
      if (count > max) {
        max = count;
        top = diag;
      }
    });
    return top;
  }, [consultations]);

  const demographicsData = useMemo(() => {
    let bracket1 = 0;
    let bracket2 = 0;
    let bracket3 = 0;
    let bracket4 = 0;

    patients.forEach(p => {
      const birthYear = p.dob ? new Date(p.dob).getFullYear() : NaN;
      const age = isNaN(birthYear) ? 0 : new Date().getFullYear() - birthYear;
      if (age <= 19) bracket1++;
      else if (age <= 39) bracket2++;
      else if (age <= 59) bracket3++;
      else bracket4++;
    });

    const total = patients.length || 1;
    return [
      { name: '60+ Years', value: Math.round((bracket4 / total) * 100), color: '#0f172a' },
      { name: '40-59 Years', value: Math.round((bracket3 / total) * 100), color: '#0284c7' },
      { name: '20-39 Years', value: Math.round((bracket2 / total) * 100), color: '#38bdf8' },
      { name: '0-19 Years', value: Math.round((bracket1 / total) * 100), color: '#e2e8f0' },
    ];
  }, [patients]);

  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return months.map((m, idx) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
      const year = monthDate.getFullYear();
      const month = String(monthDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      const count = consultations.filter(c => c.date && c.date.startsWith(monthStr)).length;
      const aptCount = appointments.filter(a => a.date && a.date.startsWith(monthStr)).length;
      const prescCount = prescriptions.filter(p => p.date && p.date.startsWith(monthStr)).length;
      return { name: m, consultations: count, appointments: aptCount, prescriptions: prescCount };
    });
  }, [consultations, appointments, prescriptions]);

  const triggerCSVDownload = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," +
      [headers.join(','), ...rows.map(r => r.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logExportEvent(filename.replace('.csv', ''), 'CSV');
  };

  const logExportEvent = (reportName: string, type: string) => {
    const key = 'emr_export_logs';
    const logs = getStorageItem<{ reportName: string; platform: string; type: string; exportedAt: string }[]>(key, []);
    const nextLogs = [{ reportName, platform: 'Local Browser Session', type, exportedAt: getLocalDateTime() }, ...logs].slice(0, 100);
    setStorageItem(key, nextLogs);
    setExportLogs(nextLogs);
  };

  const handleCSVExport = (type: string, config?: ReportConfig) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);

      if (type === 'patients') {
        const headers = ['Patient ID', 'First Name', 'Last Name', 'Gender', 'DOB', 'Phone', 'Allergies', 'Chronic Conditions'];
        const rows = patients.map(p => [p.id, p.firstName, p.lastName, p.gender, p.dob, p.phone, (p.allergies || []).join('; '), p.chronicDiseases || '']);
        triggerCSVDownload('EMR_Patients_Report.csv', headers, rows);
      } else if (type === 'consultations') {
        const headers = ['Consultation ID', 'Patient ID', 'Date', 'Time', 'Diagnosis', 'Chief Complaint', 'Treatment Plan', 'Outcome', 'Follow-up Date'];
        const rows = consultations.map(c => [c.id, c.patientId, c.date, c.time, c.diagnosis, c.chiefComplaint, c.treatmentPlan, c.outcome || '', c.followupDate || '']);
        triggerCSVDownload('EMR_Consultations_Report.csv', headers, rows);
      } else if (type === 'custom' && customReportData?.cohort) {
        const cohort = customReportData.cohort;
        const headers = ['Metric', 'Value'];
        const rows = [
          ['Cohort', cohort.label],
          ['Total Patients', cohort.totalPatients.toString()],
          ['Active Patients', cohort.activePatients.toString()],
          ['Total Visits', cohort.totalVisits.toString()],
          ['Avg Visits Per Patient', cohort.avgVisitsPerPatient.toString()],
          ['No-Show Rate', `${cohort.noShowRate}%`],
          ['Growth Rate', `${cohort.growthRate}%`],
          ['Top Diagnosis', cohort.topDiagnoses[0]?.name || 'None']
        ];
        triggerCSVDownload(`Cohort_${cohort.label.replace(/\s+/g, '_')}_Report.csv`, headers, rows);
      } else if (type === 'custom' && customReportData?.comparison) {
        const comp = customReportData.comparison;
        const headers = ['Metric', 'Period A', 'Period B', 'Growth %'];
        const rows = [
          ['Consultations', comp.periodA.consultations.toString(), comp.periodB.consultations.toString(), `${comp.growth.consultations}%`],
          ['Patients', comp.periodA.patients.toString(), comp.periodB.patients.toString(), `${comp.growth.patients}%`],
          ['Prescriptions', comp.periodA.prescriptions.toString(), comp.periodB.prescriptions.toString(), `${comp.growth.prescriptions}%`],
          ['Appointments', comp.periodA.appointments.toString(), comp.periodB.appointments.toString(), `${comp.growth.appointments}%`]
        ];
        triggerCSVDownload('Date_Range_Comparison_Report.csv', headers, rows);
      } else {
        const headers = ['Report Metric', 'Count / Value'];
        const rows = [
          ['Total Patients', totalPatients.toString()],
          ['Total Consultations', totalConsultations.toString()],
          ['Total Prescriptions', totalPrescriptions.toString()],
          ['Top Diagnosis', topDiagnosis],
          ['Upcoming Appointments', upcomingFollowups.toString()],
          ['Active Patients (30d)', patients.filter(p => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return consultations.some(c => c.patientId === p.id && new Date(c.date) >= thirtyDaysAgo);
          }).length.toString()]
        ];
        triggerCSVDownload('EMR_General_Summary_Report.csv', headers, rows);
      }
    }, 800);
  };

  const enrichedConsultations = useMemo(() => {
    return consultations.map(c => {
      const p = patients.find(pat => pat.id === c.patientId);
      return {
        ...c,
        patientName: p ? `${p.firstName} ${p.lastName}` : 'Unknown'
      };
    });
  }, [consultations, patients]);

  const handleExportPDF = async () => {
    if (!previewReport) return;
    setIsGeneratingPDF(true);
    setBannerMessage('');
    try {
      const filename = `${previewReport.title.replace(/\s+/g, '_')}_${getLocalDate()}`;
      await generatePDF('printable-report-area', filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setBannerMessage('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateCustomReport = (config: ReportConfig) => {
    let cohortResult: CohortResult | undefined;
    let comparisonResult: ComparisonResult | undefined;

    if (config.mode === 'cohort' && config.cohort) {
      cohortResult = computeCohortAnalysis(patients, consultations, prescriptions, appointments, config.cohort);
    } else if (config.mode === 'comparison' && config.dateRangeA && config.dateRangeB) {
      comparisonResult = compareDateRanges(patients, consultations, prescriptions, appointments, config.dateRangeA, config.dateRangeB);
    } else if (config.mode === 'custom') {
      const cohorts = buildCohorts(patients, consultations, prescriptions);
      cohortResult = computeCohortAnalysis(patients, consultations, prescriptions, appointments, cohorts[0]);
    }

    setCustomReportData({ cohort: cohortResult, comparison: comparisonResult, config });
    setPreviewReport({
      type: config.mode === 'comparison' ? 'comparison' : 'cohort',
      title: config.mode === 'comparison' ? 'Date Range Comparison Report' : `Cohort Analysis: ${cohortResult?.label || 'Custom'}`,
      data: { cohort: cohortResult, comparison: comparisonResult }
    });
  };

  const getReportTitle = () => {
    if (previewReport?.type === 'cohort' && customReportData?.cohort) {
      return `Cohort Analysis: ${customReportData.cohort.label}`;
    }
    if (previewReport?.type === 'comparison' && customReportData?.comparison) {
      return 'Date Range Comparison Report';
    }
    return previewReport?.title || '';
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Comprehensive overview of clinic performance and patient metrics.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCustomBuilder(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-semibold"
          >
            <Filter size={14} />
            Custom Report Builder
          </button>
          <button
            onClick={() => setPreviewReport({ type: 'summary', title: 'General Clinic Summary' })}
            className="bg-sky-500 text-white px-3 py-1.5 rounded text-[12px] hover:bg-sky-600 transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <FileText size={14} />
            Review Summary PDF
          </button>
          <button
            onClick={() => handleCSVExport('summary')}
            disabled={isExporting}
            className="bg-slate-900 dark:bg-sky-600 text-white px-3 py-1.5 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors flex items-center gap-1 font-semibold disabled:opacity-70 disabled:cursor-wait"
          >
            {isExporting ? <FileText size={14} /> : <Download size={14} />}
            {isExporting ? "Exporting..." : "Export Summary CSV"}
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 dark:bg-rose-950/25 dark:border-rose-900 px-3 py-2 text-xs text-rose-700 dark:text-rose-300 font-semibold">
          {bannerMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card title="Total Consultations" metric={totalConsultations.toString()} />
        <Card title="Patients Served" metric={totalPatients.toString()} />
        <Card title="Prescriptions" metric={totalPrescriptions.toString()} accent="emerald" />
        <Card title="Top Diagnosis" metric={topDiagnosis} accent="amber" />
        <Card title="Upcoming Visits" metric={upcomingFollowups.toString()} accent="sky" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Monthly Trends (Consultations, Appointments, Prescriptions)</h3>
          </div>
          <div className="p-4 h-72">
            {consultations.length > 0 || appointments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} barSize={12} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                    cursor={{ fill: 'var(--tooltip-cursor)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="consultations" fill="#0284c7" radius={[2, 2, 0, 0]} name="Consultations" />
                  <Bar dataKey="appointments" fill="#cbd5e1" radius={[2, 2, 0, 0]} name="Appointments" />
                  <Bar dataKey="prescriptions" fill="#10b981" radius={[2, 2, 0, 0]} name="Prescriptions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No report activity yet</p>
                  <p className="text-xs text-slate-400 mt-1">Trends will show up once data exists.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Patient Age Demographics</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-center items-center">
            <div className="h-40 w-full mb-4">
              {patients.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No patient demographics yet</p>
                    <p className="text-xs text-slate-400 mt-1">Add patients to populate the age chart.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full space-y-2">
              {demographicsData.map(item => (
                <div key={item.name} className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Report Results */}
      {customReportData && (
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
              {customReportData.config?.mode === 'comparison' ? 'Comparison Analysis' : 'Cohort Analysis Results'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleCSVExport('custom', customReportData.config)}
                disabled={isExporting}
                className="bg-emerald-500 text-white px-3 py-1.5 rounded text-[11px] hover:bg-emerald-600 font-semibold flex items-center gap-1"
              >
                <Download size={13} /> Export CSV
              </button>
              <button
                onClick={() => setPreviewReport({ ...previewReport!, type: customReportData.config?.mode === 'comparison' ? 'comparison' : 'cohort', title: getReportTitle() })}
                className="bg-sky-500 text-white px-3 py-1.5 rounded text-[11px] hover:bg-sky-600 font-semibold flex items-center gap-1"
              >
                <FileText size={13} /> Export PDF
              </button>
            </div>
          </div>
          <ReportCharts
            cohortData={customReportData.cohort}
            comparisonData={customReportData.comparison}
            chartType={customReportData.config?.chartType || 'bar'}
          />
        </div>
      )}

      {/* Periodic Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white mb-1">Periodic Reports</h3>
          {[
            { title: 'Patient Registry Report', desc: 'Full patient list export', type: 'patients', icon: '👤' },
            { title: 'Clinical Consultation Logs', desc: 'Visit details & Outcomes', type: 'consultations', icon: '📋' },
            { title: 'Growth Trends Report', desc: 'Period-over-period comparison', type: 'growth', icon: '📈' },
          ].map((report, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 flex items-center justify-between group hover:border-sky-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-[14px]">
                  {report.icon}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 dark:text-white">{report.title}</div>
                  <div className="text-[10px] text-slate-500">{report.desc}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => {
                  if (report.type === 'growth') {
                    const defaults = getDefaultDateRanges();
                    const comp = compareDateRanges(patients, consultations, prescriptions, appointments, defaults.previousMonth, defaults.currentMonth);
                    setCustomReportData({ comparison: comp, config: { mode: 'comparison', dateRangeA: defaults.previousMonth, dateRangeB: defaults.currentMonth, metrics: ['visits', 'patients', 'prescriptions', 'appointments'], chartType: 'bar' }});
                    setPreviewReport({ type: 'comparison', title: 'Growth Trends Report', data: { comparison: comp } });
                  } else {
                    setPreviewReport({ type: report.type as any, title: report.title });
                  }
                }} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 rounded transition-all cursor-pointer" title="Review & Download PDF"><FileText size={14} /></button>
                <button onClick={() => handleCSVExport(report.type)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded transition-all cursor-pointer" title="Generate CSV"><Table2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Export Audit Log</h3>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Report Name</Th>
                <Th>Platform</Th>
                <Th>Type</Th>
              </tr>
            </thead>
            <tbody>
              {exportLogs.length > 0 ? exportLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Td className="font-semibold text-slate-700 dark:text-slate-300">{log.reportName}</Td>
                  <Td className="text-slate-500">{log.platform}</Td>
                  <Td><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">{log.type}</span></Td>
                </tr>
              )) : (
                <tr>
                  <Td colSpan={3} className="text-center py-4 text-slate-500 text-[12px]">
                    <div className="flex flex-col items-center gap-1">
                      <FileText size={18} className="text-slate-300 dark:text-slate-600" />
                      <span>No exports recorded yet.</span>
                    </div>
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Custom Report Builder Modal */}
      <CustomReportBuilder
        patients={patients}
        consultations={consultations}
        prescriptions={prescriptions}
        appointments={appointments}
        onGenerate={handleGenerateCustomReport}
      />

      {/* PDF Preview Modal */}
      <Modal
        isOpen={!!previewReport}
        onClose={() => setPreviewReport(null)}
        title={`Review Report - ${getReportTitle()}`}
        className="max-w-4xl"
      >
        {previewReport && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-2 no-print">
              <button
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
                className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Download size={14} />
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-lg max-h-[60vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
              <div id="printable-report-area" className="bg-white text-slate-900 shadow-sm mx-auto">
                {previewReport.type === 'cohort' && customReportData?.cohort ? (
                  <CohortPrintTemplate cohort={customReportData.cohort} doctor={db.getDoctorProfile()} />
                ) : previewReport.type === 'comparison' && customReportData?.comparison ? (
                  <ComparisonPrintTemplate comparison={customReportData.comparison} doctor={db.getDoctorProfile()} />
                ) : (
                  <ReportPrintTemplate
                    type={previewReport.type as 'summary' | 'patients' | 'consultations'}
                    doctor={db.getDoctorProfile()}
                    data={{
                      summary: {
                        totalConsultations,
                        totalPatients,
                        topDiagnosis,
                        upcomingFollowups,
                        demographicsData: demographicsData.map(d => ({ name: d.name, value: d.value })),
                        revenueData: monthlyChartData.map(d => ({ name: d.name, consultations: d.consultations, appointments: d.appointments }))
                      },
                      patients,
                      consultations: enrichedConsultations
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CohortPrintTemplate({ cohort, doctor }: { cohort: CohortResult; doctor: any }) {
  const generatedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="print-page mx-auto bg-white text-slate-900 font-sans p-8 rounded-sm max-w-[210mm] min-h-[297mm]">
      <div className="border-b-4 border-sky-600 pb-4 mb-6 text-left">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{doctor.clinicName}</h1>
            <p className="text-xs text-slate-500">{doctor.clinicAddress}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-800">{doctor.name}</h2>
            <p className="text-xs text-slate-600">{doctor.specialization}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-[20px] font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1.5 inline-block px-6">
          Cohort Analysis Report
        </h2>
        <p className="text-xs text-slate-500 mt-2">Cohort: {cohort.label} | Generated: {generatedAt}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Patients</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{cohort.totalPatients}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Patients</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{cohort.activePatients}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Visits</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{cohort.totalVisits}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg Visits</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{cohort.avgVisitsPerPatient}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-slate-200 rounded p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">Performance Metrics</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">No-Show Rate</td>
                <td className="py-2 text-right font-bold text-slate-900">{cohort.noShowRate}%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">Growth Rate (30d)</td>
                <td className={`py-2 text-right font-bold ${Number(cohort.growthRate) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{cohort.growthRate}%</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-slate-600">Top Diagnosis</td>
                <td className="py-2 text-right font-bold text-slate-900">{cohort.topDiagnoses[0]?.name || 'None'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">Top Diagnoses</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-1 text-slate-500 font-semibold">Diagnosis</th>
                <th className="text-right py-1 text-slate-500 font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {cohort.topDiagnoses.map((d, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-700">{d.name}</td>
                  <td className="py-2 text-right font-bold text-slate-900">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 text-left">
        <p>Generated: {generatedAt} | MediCare Doctor Workspace - Confidential Medical Records</p>
      </div>
    </div>
  );
}

function ComparisonPrintTemplate({ comparison, doctor }: { comparison: ComparisonResult; doctor: any }) {
  const generatedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="print-page mx-auto bg-white text-slate-900 font-sans p-8 rounded-sm max-w-[210mm] min-h-[297mm]">
      <div className="border-b-4 border-sky-600 pb-4 mb-6 text-left">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{doctor.clinicName}</h1>
            <p className="text-xs text-slate-500">{doctor.clinicAddress}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-800">{doctor.name}</h2>
            <p className="text-xs text-slate-600">{doctor.specialization}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-[20px] font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1.5 inline-block px-6">
          Date Range Comparison Report
        </h2>
        <p className="text-xs text-slate-500 mt-2">Generated: {generatedAt}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-slate-200 rounded p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">Period A: {comparison.periodA.label}</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">Consultations</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodA.consultations}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">Unique Patients</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodA.patients}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">Prescriptions</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodA.prescriptions}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-slate-600">Appointments</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodA.appointments}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">Period B: {comparison.periodB.label}</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">Consultations</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodB.consultations}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">Unique Patients</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodB.patients}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600">Prescriptions</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodB.prescriptions}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-slate-600">Appointments</td>
                <td className="py-2 text-right font-bold text-slate-900">{comparison.periodB.appointments}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-slate-200 rounded p-4 mb-6">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">Growth Analysis</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(comparison.growth).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">{key}</div>
              <div className={`text-xl font-black ${Number(value) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Number(value) >= 0 ? '+' : ''}{value}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 text-left">
        <p>Generated: {generatedAt} | MediCare Doctor Workspace - Confidential Medical Records</p>
      </div>
    </div>
  );
}
