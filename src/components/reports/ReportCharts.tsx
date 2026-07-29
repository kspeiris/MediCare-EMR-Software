import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CohortResult, ComparisonResult } from '@/lib/reporting';

interface ReportChartsProps {
  cohortData?: CohortResult;
  comparisonData?: ComparisonResult;
  chartType: 'bar' | 'line' | 'area';
}

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function ReportCharts({ cohortData, comparisonData, chartType }: ReportChartsProps) {
  if (cohortData) {
    const diagnosisData = cohortData.topDiagnoses.map(d => ({ name: d.name, value: d.count }));
    const trendData = [
      { metric: 'Total Patients', value: cohortData.totalPatients },
      { metric: 'Active Patients', value: cohortData.activePatients },
      { metric: 'Total Visits', value: cohortData.totalVisits },
      { metric: 'Avg Visits', value: cohortData.avgVisitsPerPatient }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded p-3">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Cohort Overview</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="metric" tick={{ fontSize: 9 }} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="value" fill="#0284c7" radius={[2,2,0,0]} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="metric" tick={{ fontSize: 9 }} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                ) : (
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="metric" tick={{ fontSize: 9 }} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="value" stroke="#0284c7" fill="#0284c7" fillOpacity={0.3} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {diagnosisData.length > 0 && (
            <div className="border border-slate-200 rounded p-3">
              <h4 className="text-xs font-bold text-slate-700 mb-2">Top Diagnoses</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={diagnosisData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {diagnosisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (comparisonData) {
    const comparisonChartData = [
      { metric: 'Consultations', periodA: comparisonData.periodA.consultations, periodB: comparisonData.periodB.consultations },
      { metric: 'Patients', periodA: comparisonData.periodA.patients, periodB: comparisonData.periodB.patients },
      { metric: 'Prescriptions', periodA: comparisonData.periodA.prescriptions, periodB: comparisonData.periodB.prescriptions },
      { metric: 'Appointments', periodA: comparisonData.periodA.appointments, periodB: comparisonData.periodB.appointments }
    ];

    return (
      <div className="space-y-4">
        <div className="border border-slate-200 rounded p-3">
          <h4 className="text-xs font-bold text-slate-700 mb-2">Period Comparison</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="metric" tick={{ fontSize: 9 }} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="periodA" fill="#0284c7" radius={[2,2,0,0]} name={comparisonData.periodA.label} />
                <Bar dataKey="periodB" fill="#cbd5e1" radius={[2,2,0,0]} name={comparisonData.periodB.label} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(comparisonData.growth).map(([key, value]) => (
            <div key={key} className="border border-slate-200 rounded p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">{key}</div>
              <div className={`text-lg font-black ${Number(value) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Number(value) >= 0 ? '+' : ''}{value}%
              </div>
              <div className="text-[10px] text-slate-400">growth</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
