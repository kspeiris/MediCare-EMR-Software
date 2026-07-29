import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { TrendDatum } from '@/lib/analytics';

interface TrendChartProps {
  data: TrendDatum[];
  mode?: 'bar' | 'line';
}

export function TrendChart({ data, mode = 'bar' }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No trend data yet</p>
          <p className="text-xs text-slate-400 mt-1">Add consultations, prescriptions, and appointments to see trends.</p>
        </div>
      </div>
    );
  }

  if (mode === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
            cursor={{ fill: 'var(--tooltip-cursor)' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Line type="monotone" dataKey="visits" stroke="#0284c7" strokeWidth={2} name="Visits" dot={{ r: 2 }} />
          <Line type="monotone" dataKey="diagnoses" stroke="#10b981" strokeWidth={2} name="Diagnoses" dot={{ r: 2 }} />
          <Line type="monotone" dataKey="prescriptions" stroke="#f59e0b" strokeWidth={2} name="Prescriptions" dot={{ r: 2 }} />
          <Line type="monotone" dataKey="followUps" stroke="#8b5cf6" strokeWidth={2} name="Follow-ups" dot={{ r: 2 }} />
          <Line type="monotone" dataKey="noShows" stroke="#ef4444" strokeWidth={2} name="No-shows" dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={8} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
          cursor={{ fill: 'var(--tooltip-cursor)' }}
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Bar dataKey="visits" fill="#0284c7" radius={[2, 2, 0, 0]} name="Visits" />
        <Bar dataKey="diagnoses" fill="#10b981" radius={[2, 2, 0, 0]} name="Diagnoses" />
        <Bar dataKey="prescriptions" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Prescriptions" />
        <Bar dataKey="followUps" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Follow-ups" />
        <Bar dataKey="noShows" fill="#ef4444" radius={[2, 2, 0, 0]} name="No-shows" />
      </BarChart>
    </ResponsiveContainer>
  );
}
