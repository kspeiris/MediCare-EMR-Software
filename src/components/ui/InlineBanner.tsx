import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type BannerVariant = 'error' | 'warning' | 'success' | 'info';

interface InlineBannerProps {
  variant?: BannerVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<BannerVariant, string> = {
  error: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300',
  warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300',
  success: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300',
  info: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-300',
};

const variantIcons: Record<BannerVariant, ReactNode> = {
  error: <XCircle size={14} className="text-rose-500" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
  success: <CheckCircle2 size={14} className="text-emerald-500" />,
  info: <Info size={14} className="text-sky-500" />,
};

export function InlineBanner({ variant = 'info', title, children, onDismiss, className }: InlineBannerProps) {
  return (
    <div className={cn('flex items-start gap-2 px-3 py-2 rounded-md border text-xs', variantStyles[variant], className)}>
      <span className="mt-0.5 shrink-0">{variantIcons[variant]}</span>
      <div className="flex-1">
        {title && <p className="font-semibold text-[11px] uppercase tracking-wide mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="mt-0.5 shrink-0 opacity-70 hover:opacity-100">
          <XCircle size={12} />
        </button>
      )}
    </div>
  );
}
