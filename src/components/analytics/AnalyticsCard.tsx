import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  metric: string | number;
  sub?: string;
  accent?: 'sky' | 'emerald' | 'amber' | 'rose';
}

export function AnalyticsCard({ title, metric, sub, accent = 'sky' }: AnalyticsCardProps) {
  const accentClasses: Record<string, string> = {
    sky: 'text-sky-600 dark:text-sky-300',
    emerald: 'text-emerald-600 dark:text-emerald-300',
    amber: 'text-amber-600 dark:text-amber-300',
    rose: 'text-rose-600 dark:text-rose-300'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{title}</span>
      <span className={cn('text-[20px] font-bold', accentClasses[accent])}>{metric}</span>
      {sub && <span className="text-[11px] text-slate-500">{sub}</span>}
    </div>
  );
}
