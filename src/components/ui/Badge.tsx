import { cn } from '@/lib/utils';

export function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'critical' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    critical: 'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold uppercase border tracking-wider", variants[variant])}>
      {children}
    </span>
  );
}
