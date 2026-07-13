import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Table2, CheckCircle2 } from 'lucide-react';
import { Table, Th, Td } from '@/components/ui/Table';
import { useState, useMemo } from 'react';
import { db } from '@/services/db';

export function Reports() {
  const [isExporting, setIsExporting] = useState(false);

  const patients = db.getPatients();
  const consultations = db.getConsultations();
  const appointments = db.getAppointments();

  // Metrics
  const totalConsultations = consultations.length;
  const totalPatients = patients.length;
  const upcomingFollowups = appointments.filter(a => a.status === 'Scheduled').length;

  // Calculate top diagnosis
  const topDiagnosis = useMemo(() => {
    if (consultations.length === 0) return 'None';
    const counts: Record<string, number> = {};
    consultations.forEach(c => {
      if (c.diagnosis) {
        counts[c.diagnosis] = (counts[c.diagnosis] || 0) + 1;
      }
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

  // Calculate demographics
  const demographicsData = useMemo(() => {
    let bracket1 = 0; // 0-19
    let bracket2 = 0; // 20-39
    let bracket3 = 0; // 40-59
    let bracket4 = 0; // 60+

    patients.forEach(p => {
      const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
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

  // Monthly trends mockup (using real total counts distributed across months)
  const revenueData = [
    { name: 'JAN', consultations: Math.round(totalConsultations * 0.1) || 2, appointments: Math.round(upcomingFollowups * 0.1) || 1 },
    { name: 'FEB', consultations: Math.round(totalConsultations * 0.12) || 3, appointments: Math.round(upcomingFollowups * 0.1) || 1 },
    { name: 'MAR', consultations: Math.round(totalConsultations * 0.15) || 4, appointments: Math.round(upcomingFollowups * 0.1) || 1 },
    { name: 'APR', consultations: Math.round(totalConsultations * 0.18) || 5, appointments: Math.round(upcomingFollowups * 0.15) || 2 },
    { name: 'MAY', consultations: Math.round(totalConsultations * 0.2) || 6, appointments: Math.round(upcomingFollowups * 0.2) || 2 },
    { name: 'JUN', consultations: Math.round(totalConsultations * 0.25) || 8, appointments: Math.round(upcomingFollowups * 0.35) || 4 },
  ];

  // Helper to trigger CSV file download
  const triggerCSVDownload = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Comprehensive overview of clinic performance and patient metrics.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleCSVExport('summary')}
            disabled={isExporting}
            className="bg-slate-900 dark:bg-sky-600 text-white px-3 py-1.5 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors flex items-center gap-1 font-semibold disabled:opacity-70 disabled:cursor-wait"
          >
            {isExporting ? <CheckCircle2 size={14} /> : <Download size={14} />}
            {isExporting ? "Exporting..." : "Export Summary CSV"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Consultations" metric={totalConsultations.toString()} />
        <Card title="Patients Served" metric={totalPatients.toString()} />
        <Card title="Top Diagnosis" metric={topDiagnosis} />
        <Card title="Upcoming Visits" metric={upcomingFollowups.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Bar Chart */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Monthly Consultations vs Scheduled Appointments</h3>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barSize={12} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '11px', padding: '6px' }}
                    cursor={{ fill: '#F1F5F9' }}
                  />
                  <Bar dataKey="consultations" fill="#0284c7" radius={[2, 2, 0, 0]} name="Consultations" />
                  <Bar dataKey="appointments" fill="#cbd5e1" radius={[2, 2, 0, 0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Pie Chart */}
         <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Patient Age Demographics</h3>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center items-center">
              <div className="h-40 w-full mb-4">
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
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                  </PieChart>
                </ResponsiveContainer>
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
         {/* Periodic Reports generators */}
         <div className="lg:col-span-1 space-y-3">
           <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white mb-1">Periodic Reports</h3>
           
           {[
             { title: 'Patient Registry Report', desc: 'Full patient list export', type: 'patients', icon: '👤' },
             { title: 'Clinical Consultation Logs', desc: 'Visit details & Outcomes', type: 'consultations', icon: '🩺' },
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
                  <button onClick={() => handleCSVExport(report.type)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all" title="Generate CSV"><Table2 size={14}/></button>
                </div>
             </div>
           ))}
         </div>

         {/* Mock Export history */}
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
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Td className="font-semibold text-slate-700 dark:text-slate-350">Monthly EMR Summary</Td>
                  <Td className="text-slate-500">Local Browser Session</Td>
                  <Td><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">CSV</span></Td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Td className="font-semibold text-slate-700 dark:text-slate-350">Patient Demographics Export</Td>
                  <Td className="text-slate-500">Local Browser Session</Td>
                  <Td><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">CSV</span></Td>
                </tr>
              </tbody>
            </Table>
         </div>
      </div>
    </div>
  );
}
