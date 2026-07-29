import { useMemo } from 'react';
import { Consultation } from '@/services/db';

interface ConditionHistoryProps {
  consultations: Consultation[];
}

export function ConditionHistory({ consultations }: ConditionHistoryProps) {
  const history = useMemo(() => {
    const map = new Map<string, { dates: string[]; count: number }>();
    consultations.forEach(c => {
      if (!c.diagnosis) return;
      const parts = c.diagnosis.split(/[;,]/).map(s => s.trim()).filter(Boolean);
      const entries = parts.length > 0 ? parts : [c.diagnosis];
      entries.forEach(diag => {
        if (!map.has(diag)) map.set(diag, { dates: [], count: 0 });
        const entry = map.get(diag)!;
        entry.dates.push(c.date);
        entry.count += 1;
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        firstSeen: data.dates.sort()[0],
        lastSeen: data.dates.sort().reverse()[0]
      }))
      .sort((a, b) => b.count - a.count);
  }, [consultations]);

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs">
        No condition history yet. Diagnoses will appear here after consultations.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div>
            <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
            <p className="text-[10px] text-slate-500">
              First seen: {item.firstSeen} • Last seen: {item.lastSeen}
            </p>
          </div>
          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-[10px] font-bold">
            {item.count} {item.count === 1 ? 'visit' : 'visits'}
          </span>
        </div>
      ))}
    </div>
  );
}
