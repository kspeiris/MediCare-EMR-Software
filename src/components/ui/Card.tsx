export function Card({ title, metric }: { title: string; metric: string }) {
  return (
    <div className="bg-white p-4 rounded-md border border-slate-200">
      <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-[20px] font-bold text-slate-900 mt-1">{metric}</p>
    </div>
  );
}
