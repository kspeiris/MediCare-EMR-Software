import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AgeBucket, DiagnosisBucket, GenderBucket, StatusBucket } from '@/lib/analytics';

interface BreakdownChartsProps {
  ageData: AgeBucket[];
  diagnosisData: DiagnosisBucket[];
  genderData: GenderBucket[];
  statusData: StatusBucket[];
}

export function BreakdownCharts({ ageData, diagnosisData, genderData, statusData }: BreakdownChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Age Breakdown</h3>
        </div>
        <div className="p-4 h-60">
          {ageData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
              <p className="text-xs text-slate-500">No age data available.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Gender Distribution</h3>
        </div>
        <div className="p-4 h-60">
          {genderData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                  cursor={{ fill: 'var(--tooltip-cursor)' }}
                />
                <Bar dataKey="value" name="Patients" radius={[4, 4, 0, 0]}>
                  <Cell fill="#0284c7" />
                  <Cell fill="#ec4899" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
              <p className="text-xs text-slate-500">No gender data available.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Top Diagnoses</h3>
        </div>
        <div className="p-4 h-60">
          {diagnosisData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosisData} layout="vertical" barSize={10}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} dx={-4} />
                <Tooltip
                  contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                  cursor={{ fill: 'var(--tooltip-cursor)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[2, 2, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
              <p className="text-xs text-slate-500">No diagnosis data available.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Appointment Status</h3>
        </div>
        <div className="p-4 h-60">
          {statusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                  cursor={{ fill: 'var(--tooltip-cursor)' }}
                />
                <Bar dataKey="value" name="Appointments" radius={[4, 4, 0, 0]}>
                  <Cell fill="#0284c7" />
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
              <p className="text-xs text-slate-500">No appointment status data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
