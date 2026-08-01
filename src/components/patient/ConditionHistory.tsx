import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { Consultation } from '@/services/db';

interface ConditionHistoryProps {
  consultations: Consultation[];
  chronicDiseases?: string;
}

interface ConditionEntry {
  name: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  dates: string[];
  source: 'chronic' | 'consultation';
}

export function ConditionHistory({ consultations, chronicDiseases }: ConditionHistoryProps) {
  const history = useMemo<ConditionEntry[]>(() => {
    const map = new Map<string, ConditionEntry>();

    if (chronicDiseases) {
      chronicDiseases.split(/[;,]/).map(s => s.trim()).filter(Boolean).forEach(diag => {
        if (!map.has(diag)) {
          map.set(diag, { name: diag, count: 0, firstSeen: '', lastSeen: '', dates: [], source: 'chronic' });
        }
      });
    }

    consultations.forEach(c => {
      if (!c.diagnosis) return;
      const parts = c.diagnosis.split(/[;,]/).map(s => s.trim()).filter(Boolean);
      const entries = parts.length > 0 ? parts : [c.diagnosis];
      entries.forEach(diag => {
        if (!map.has(diag)) {
          map.set(diag, { name: diag, count: 0, firstSeen: '', lastSeen: '', dates: [], source: 'consultation' });
        }
        const entry = map.get(diag)!;
        entry.dates.push(c.date);
        entry.count += 1;
        entry.source = 'consultation';
        if (!entry.firstSeen || c.date < entry.firstSeen) entry.firstSeen = c.date;
        if (!entry.lastSeen || c.date > entry.lastSeen) entry.lastSeen = c.date;
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count);
  }, [consultations, chronicDiseases]);

  const getTrend = (dates: string[]): 'improving' | 'worsening' | 'stable' => {
    if (dates.length < 3) return 'stable';
    const sorted = [...dates].sort();
    const recent = sorted.slice(-3);
    const older = sorted.slice(0, -3);
    if (recent.length > older.length) return 'worsening';
    if (recent.length < older.length) return 'improving';
    return 'stable';
  };

  const getSeverity = (entry: ConditionEntry): 'chronic' | 'active' | 'recurrent' => {
    if (entry.source === 'chronic') return 'chronic';
    if (entry.count >= 5) return 'active';
    if (entry.count >= 2) return 'recurrent';
    return 'active';
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs">
        No condition history yet. Diagnoses will appear here after consultations.
      </div>
    );
  }

  const maxCount = Math.max(...history.map(h => h.count));

  return (
    <div className="space-y-2">
      {history.map((item, idx) => {
        const trend = getTrend(item.dates);
        const severity = getSeverity(item);
        const TrendIcon = trend === 'improving' ? TrendingDown : trend === 'worsening' ? TrendingUp : Minus;
        const trendColor = trend === 'improving' ? 'text-emerald-600' : trend === 'worsening' ? 'text-red-600' : 'text-slate-500';
        const severityBadge = severity === 'chronic' 
          ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          : severity === 'active'
          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900'
          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900';

        return (
          <div key={idx} className="p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${severityBadge}`}>
                  {severity.toUpperCase()}
                </span>
                <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
              </div>
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon size={12} />
                <span className="text-[10px] font-medium capitalize">{trend}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
              <span>First: {item.firstSeen || 'N/A'}</span>
              <span>Last: {item.lastSeen || 'N/A'}</span>
              <span className="font-semibold">{item.count} visit{item.count === 1 ? '' : 's'}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-sky-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
