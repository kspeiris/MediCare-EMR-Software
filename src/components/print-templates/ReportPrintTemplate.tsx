import { Patient, Consultation, DoctorProfile } from '@/services/db';

interface ReportPrintTemplateProps {
  type: 'summary' | 'patients' | 'consultations';
  doctor: DoctorProfile;
  data: {
    summary?: {
      totalConsultations: number;
      totalPatients: number;
      topDiagnosis: string;
      upcomingFollowups: number;
      demographicsData: { name: string; value: number }[];
      revenueData: { name: string; consultations: number; appointments: number }[];
    };
    patients?: Patient[];
    consultations?: (Consultation & { patientName?: string })[];
  };
}

export function ReportPrintTemplate({ type, doctor, data }: ReportPrintTemplateProps) {
  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="print-page mx-auto bg-white text-slate-900 font-sans p-8 rounded-sm max-w-[210mm] min-h-[297mm]">
      {/* Header Banner */}
      <div className="border-b-4 border-sky-600 pb-4 mb-6 text-left">
        <div className="flex justify-between items-start">
          <div className="w-2/3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">MC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{doctor.clinicName}</h1>
                <p className="text-xs text-slate-650">{doctor.clinicAddress}</p>
                <p className="text-xs text-slate-650">Phone: {doctor.phone} | Email: {doctor.email}</p>
              </div>
            </div>
          </div>
          <div className="text-right w-1/3">
            <h2 className="text-lg font-bold text-slate-800">{doctor.name}</h2>
            <p className="text-xs text-slate-600">{doctor.specialization}</p>
            <p className="text-xs text-slate-600 font-semibold">Reg: {doctor.regNumber}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-[20px] font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1.5 inline-block px-6">
          {type === 'summary' && 'General Summary & Analytics Report'}
          {type === 'patients' && 'Patient Registry Report'}
          {type === 'consultations' && 'Clinical Consultation Log Report'}
        </h2>
      </div>

      {/* Render based on report type */}
      {type === 'summary' && data.summary && (
        <div className="space-y-6 text-left">
          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Consultations</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{data.summary.totalConsultations}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Patients Served</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{data.summary.totalPatients}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Top Diagnosis</span>
              <span className="text-lg font-bold text-sky-700 truncate mt-1 block">{data.summary.topDiagnosis}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Upcoming Visits</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{data.summary.upcomingFollowups}</span>
            </div>
          </div>

          {/* Demographics and Trends Table */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded p-4 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">Patient Age Demographics</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-1 text-slate-500 font-semibold">Age Bracket</th>
                    <th className="text-right py-1 text-slate-500 font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.demographicsData.map((d, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 font-medium text-slate-750">{d.name}</td>
                      <td className="py-2 text-right font-bold text-slate-900">{d.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded p-4 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">Activity Trends</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-1 text-slate-500 font-semibold">Month</th>
                    <th className="text-right py-1 text-slate-500 font-semibold">Consultations</th>
                    <th className="text-right py-1 text-slate-500 font-semibold">Scheduled</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.revenueData.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 font-medium text-slate-755">{r.name}</td>
                      <td className="py-1.5 text-right font-bold text-slate-900">{r.consultations}</td>
                      <td className="py-1.5 text-right text-slate-500">{r.appointments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {type === 'patients' && data.patients && (
        <div className="space-y-4 text-left">
          <div className="text-xs text-slate-500 mb-2">
            Showing all registered patients currently active in Medicare system.
          </div>
          <table className="w-full text-xs border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                <th className="border-r border-slate-200 p-2 text-left">Patient ID</th>
                <th className="border-r border-slate-200 p-2 text-left">Full Name</th>
                <th className="border-r border-slate-200 p-2 text-left">Gender</th>
                <th className="border-r border-slate-200 p-2 text-left">DOB</th>
                <th className="border-r border-slate-200 p-2 text-left">Contact No</th>
                <th className="p-2 text-left">Allergies / Conditions</th>
              </tr>
            </thead>
            <tbody>
              {data.patients.map((p) => (
                <tr key={p.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
                  <td className="border-r border-slate-200 p-2 font-bold text-slate-800">#{p.id}</td>
                  <td className="border-r border-slate-200 p-2 font-semibold text-slate-900">{p.firstName} {p.lastName}</td>
                  <td className="border-r border-slate-200 p-2">{p.gender}</td>
                  <td className="border-r border-slate-200 p-2 whitespace-nowrap">{p.dob}</td>
                  <td className="border-r border-slate-200 p-2 whitespace-nowrap">{p.phone}</td>
                  <td className="p-2 text-slate-700">
                    {p.allergies && p.allergies.length > 0 ? (
                      <span className="text-red-700 font-semibold">{p.allergies.join(', ')}</span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                    {p.chronicDiseases && ` • ${p.chronicDiseases}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {type === 'consultations' && data.consultations && (
        <div className="space-y-4 text-left">
          <div className="text-xs text-slate-500 mb-2">
            Historical clinical consultations log showing primary complaints, diagnoses, and treatment plans.
          </div>
          <table className="w-full text-xs border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                <th className="border-r border-slate-200 p-2 text-left">Visit ID</th>
                <th className="border-r border-slate-200 p-2 text-left">Patient</th>
                <th className="border-r border-slate-200 p-2 text-left">Date / Time</th>
                <th className="border-r border-slate-200 p-2 text-left">Diagnosis</th>
                <th className="p-2 text-left">Complaint & Treatment Advice</th>
              </tr>
            </thead>
            <tbody>
              {data.consultations.map((c) => (
                <tr key={c.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
                  <td className="border-r border-slate-200 p-2 font-bold text-slate-800">#{c.id}</td>
                  <td className="border-r border-slate-200 p-2 font-semibold text-slate-900">{c.patientName || c.patientId}</td>
                  <td className="border-r border-slate-200 p-2 whitespace-nowrap">{c.date} <span className="text-[10px] text-slate-400 block">{c.time}</span></td>
                  <td className="border-r border-slate-200 p-2 font-medium text-sky-800">{c.diagnosis}</td>
                  <td className="p-2 text-slate-700">
                    <div><span className="font-semibold text-slate-850">Complaint:</span> {c.chiefComplaint}</div>
                    {c.treatmentPlan && (
                      <div className="mt-1"><span className="font-semibold text-slate-850">Advice:</span> {c.treatmentPlan}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 text-left">
        <div className="flex justify-between items-end">
          <div>
            <p>Generated: {generatedAt}</p>
            <p className="mt-1">Medicare EMR Systems - Confidential Medical Records</p>
          </div>
          <div className="text-center w-48 border-t border-slate-300 pt-2">
            <p className="font-bold text-slate-800">{doctor.name}</p>
            <p className="text-[10px] text-slate-650">Clinic Director / RMO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
