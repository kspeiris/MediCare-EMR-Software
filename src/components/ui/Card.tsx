export function Card({ title, metric }: { title: string; metric: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
      <p className="text-[11px] text-slate-500 dark:text-slate-455 font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-[20px] font-bold text-slate-900 dark:text-white mt-1">{metric}</p>
    </div>
  );
}
