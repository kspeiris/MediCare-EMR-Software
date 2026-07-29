import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChronicRow } from '@/lib/analytics';

interface AgingChartProps {
  data: ChronicRow[];
}

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function AgingChart({ data }: AgingChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No chronic data yet</p>
          <p className="text-xs text-slate-400 mt-1">Aging charts will show up once chronic conditions are recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={12} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
          cursor={{ fill: 'var(--tooltip-cursor)' }}
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Bar dataKey="count" name="Count" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
