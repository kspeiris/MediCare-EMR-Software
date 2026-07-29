import { cn } from '@/lib/utils';

interface CardProps {
  title: string;
  metric: string;
  accent?: 'sky' | 'emerald' | 'amber' | 'rose';
}

export function Card({ title, metric, accent = 'sky' }: CardProps) {
  const accentClasses: Record<string, string> = {
    sky: 'text-sky-600 dark:text-sky-300',
    emerald: 'text-emerald-600 dark:text-emerald-300',
    amber: 'text-amber-600 dark:text-amber-300',
    rose: 'text-rose-600 dark:text-rose-300'
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{title}</p>
      <p className={cn('text-[20px] font-bold mt-1', accentClasses[accent])}>{metric}</p>
    </div>
  );
}
