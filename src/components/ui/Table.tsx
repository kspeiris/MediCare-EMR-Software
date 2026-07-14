import { cn } from '@/lib/utils';

export function Table({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse text-[12px]">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode, className?: string }) {
  return <th className={cn("bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800", className)}>{children}</th>;
}

export function Td({ children, className, colSpan }: { children: React.ReactNode, className?: string, colSpan?: number }) {
  return <td colSpan={colSpan} className={cn("px-4 py-2.5 border-b border-slate-100 dark:border-slate-850", className)}>{children}</td>;
}
