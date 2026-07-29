import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Table2, FileText } from 'lucide-react';
import { Table, Th, Td } from '@/components/ui/Table';
import { useState, useMemo, useEffect } from 'react';
import { getLocalDate, getLocalDateTime } from '@/lib/dates';
import { db, getStorageItem, setStorageItem } from '@/services/db';
import { Modal } from '@/components/ui/Modal';
import { generatePDF } from '@/components/print-templates/pdfExport';
import { ReportPrintTemplate } from '@/components/print-templates/ReportPrintTemplate';
import { onDbChange } from '@/services/db';

export function Reports() {
  const [isExporting, setIsExporting] = useState(false);
  const [previewReport, setPreviewReport] = useState<{ type: 'summary' | 'patients' | 'consultations'; title: string } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportLogs, setExportLogs] = useState<{ reportName: string; platform: string; type: string; exportedAt: string }[]>(() => getStorageItem('emr_export_logs', []));
  const [bannerMessage, setBannerMessage] = useState('');

  const [patients, setPatients] = useState(() => db.getPatientsSync());
  const [consultations, setConsultations] = useState(() => db.getConsultationsSync());
  const [appointments, setAppointments] = useState(() => db.getAppointmentsSync());

  const loadData = () => {
    db.getPatients().then(setPatients);
    db.getConsultations().then(setConsultations);
    db.getAppointments().then(setAppointments);
    setExportLogs(getStorageItem('emr_export_logs', []));
  };

  useEffect(() => {
    loadData();
    const unsub = onDbChange('patients:changed', loadData);
    const unsub2 = onDbChange('consultations:changed', loadData);
    const unsub3 = onDbChange('appointments:changed', loadData);
    return () => { unsub(); unsub2(); unsub3(); };
  }, []);

  const totalConsultations = consultations.length;
  const totalPatients = patients.length;
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

  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const now = new Date();
    return months.map((m, idx) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const year = monthDate.getFullYear();
      const month = String(monthDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      const count = consultations.filter(c => c.date && c.date.startsWith(monthStr)).length;
      const aptCount = appointments.filter(a => a.date && a.date.startsWith(monthStr)).length;
      return { name: m, consultations: count, appointments: aptCount };
    });
  }, [consultations, appointments]);

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

  const handleCSVExport = (type: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);

      if (type === 'patients') {
        const headers = ['Patient ID', 'First Name', 'Last Name', 'Gender', 'DOB', 'Phone', 'Allergies'];
        const rows = patients.map(p => [p.id, p.firstName, p.lastName, p.gender, p.dob, p.phone, (p.allergies || []).join('; ')]);
        triggerCSVDownload('EMR_Patients_Report.csv', headers, rows);
      } else if (type === 'consultations') {
        const headers = ['Consultation ID', 'Patient ID', 'Date', 'Diagnosis', 'Chief Complaint', 'Treatment Plan'];
        const rows = consultations.map(c => [c.id, c.patientId, c.date, c.diagnosis, c.chiefComplaint, c.treatmentPlan]);
        triggerCSVDownload('EMR_Consultations_Report.csv', headers, rows);
      } else {
        const headers = ['Report Metric', 'Count / Value'];
        const rows = [
          ['Total Served Patients', totalPatients.toString()],
          ['Total Clinical Consultations', totalConsultations.toString()],
          ['Top Diagnosis', topDiagnosis],
          ['Upcoming Scheduled Appointments', upcomingFollowups.toString()]
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

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Comprehensive overview of clinic performance and patient metrics.</p>
        </div>
        <div className="flex gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Consultations" metric={totalConsultations.toString()} />
        <Card title="Patients Served" metric={totalPatients.toString()} />
        <Card title="Top Diagnosis" metric={topDiagnosis} />
        <Card title="Upcoming Visits" metric={upcomingFollowups.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Monthly Consultations vs Scheduled Appointments</h3>
          </div>
          <div className="p-4 h-64">
            {consultations.length > 0 || appointments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barSize={12} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                    cursor={{ fill: 'var(--tooltip-cursor)' }}
                  />
                  <Bar dataKey="consultations" fill="#0284c7" radius={[2, 2, 0, 0]} name="Consultations" />
                  <Bar dataKey="appointments" fill="#cbd5e1" radius={[2, 2, 0, 0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No report activity yet</p>
                  <p className="text-xs text-slate-400 mt-1">Consultation and appointment trends will show up here once data exists.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white mb-1">Periodic Reports</h3>
          {[
            { title: 'Patient Registry Report', desc: 'Full patient list export', type: 'patients', icon: '👤' },
            { title: 'Clinical Consultation Logs', desc: 'Visit details & Outcomes', type: 'consultations', icon: '📋' },
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
                <button onClick={() => setPreviewReport({ type: report.type as any, title: report.title })} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 rounded transition-all cursor-pointer" title="Review & Download PDF"><FileText size={14} /></button>
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

      <Modal
        isOpen={!!previewReport}
        onClose={() => setPreviewReport(null)}
        title={`Review Report - ${previewReport?.title}`}
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
              {previewReport.type !== 'summary' && enrichedConsultations.length === 0 && (
                <div className="mb-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-500">
                  No consultation data is available for this report yet.
                </div>
              )}
              <div id="printable-report-area" className="bg-white text-slate-900 shadow-sm mx-auto">
                <ReportPrintTemplate
                  type={previewReport.type}
                  doctor={db.getDoctorProfile()}
                  data={{
                    summary: {
                      totalConsultations,
                      totalPatients,
                      topDiagnosis,
                      upcomingFollowups,
                      demographicsData: demographicsData.map(d => ({ name: d.name, value: d.value })),
                      revenueData
                    },
                    patients,
                    consultations: enrichedConsultations
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
