import { Consultation, Prescription, MedicalCertificate, MedicalDocument, Referral } from '@/services/db';
import { Calendar, FileText, Pill, FileBadge, UserRoundPlus, Eye } from 'lucide-react';
import { useState } from 'react';

export type TimelineEvent = {
  id: string;
  date: string;
  type: 'consultation' | 'prescription' | 'certificate' | 'document' | 'referral';
  title: string;
  description: string;
  meta?: string;
};

export function buildTimeline(
  consultations: Consultation[],
  prescriptions: Prescription[],
  certificates: MedicalCertificate[],
  documents: MedicalDocument[],
  referrals: Referral[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  consultations.forEach(c => {
    events.push({
      id: c.id,
      date: c.date + 'T' + (c.time || '00:00'),
      type: 'consultation',
      title: c.chiefComplaint || 'Consultation',
      description: c.diagnosis || 'No diagnosis recorded',
      meta: c.outcome ? `Outcome: ${c.outcome}` : undefined
    });
  });

  prescriptions.forEach(p => {
    events.push({
      id: p.id,
      date: p.date + 'T00:00',
      type: 'prescription',
      title: 'Prescription',
      description: p.medicines.map(m => m.name).join(', ') || 'No medications',
      meta: p.consultationId ? `Consultation: ${p.consultationId}` : undefined
    });
  });

  certificates.forEach(c => {
    events.push({
      id: c.id,
      date: c.issueDate + 'T00:00',
      type: 'certificate',
      title: 'Medical Certificate',
      description: `Rest: ${c.restPeriod}`,
      meta: c.diagnosis
    });
  });

  documents.forEach(d => {
    events.push({
      id: d.id,
      date: d.uploadDate + 'T00:00',
      type: 'document',
      title: d.name,
      description: d.type,
      meta: d.fileData ? 'Has attachment' : undefined
    });
  });

  referrals.forEach(r => {
    events.push({
      id: r.id,
      date: r.date + 'T00:00',
      type: 'referral',
      title: 'Referral',
      description: `${r.specialistName} @ ${r.facility}`,
      meta: r.reason
    });
  });

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const iconMap = {
  consultation: Calendar,
  prescription: Pill,
  certificate: FileBadge,
  document: FileText,
  referral: UserRoundPlus
};

const colorMap = {
  consultation: 'bg-sky-500',
  prescription: 'bg-emerald-500',
  certificate: 'bg-amber-500',
  document: 'bg-slate-500',
  referral: 'bg-indigo-500'
};

const borderColorMap = {
  consultation: 'border-l-sky-500',
  prescription: 'border-l-emerald-500',
  certificate: 'border-l-amber-500',
  document: 'border-l-slate-500',
  referral: 'border-l-indigo-500'
};

const typeLabels = {
  consultation: 'Visit',
  prescription: 'Prescription',
  certificate: 'Certificate',
  document: 'Document',
  referral: 'Referral'
};

type FilterTab = 'all' | 'consultation' | 'prescription' | 'certificate' | 'document' | 'referral';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'consultation', label: 'Visits' },
  { key: 'prescription', label: 'Prescriptions' },
  { key: 'certificate', label: 'Certificates' },
  { key: 'document', label: 'Documents' },
  { key: 'referral', label: 'Referrals' }
];

interface TimelineViewProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTimePeriod(dateStr: string): 'Morning' | 'Afternoon' | 'Evening' {
  const hour = new Date(dateStr).getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function groupByDate(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  const groups: Record<string, TimelineEvent[]> = {};
  events.forEach(event => {
    const key = getDateKey(event.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  });
  return groups;
}

export function TimelineView({ events, onEventClick }: TimelineViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filtered = activeFilter === 'all' ? events : events.filter(e => e.type === activeFilter);

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        <FileText className="mx-auto text-slate-300 mb-2" size={32} />
        No timeline events yet.
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        <FileText className="mx-auto text-slate-300 mb-2" size={32} />
        No events match the selected filter.
      </div>
    );
  }

  const dateGroups = groupByDate(filtered);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors whitespace-nowrap ${
              activeFilter === tab.key
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {Object.entries(dateGroups).map(([dateKey, dayEvents]) => {
          const periods = new Set(dayEvents.map(e => getTimePeriod(e.date)));
          const showPeriods = periods.size > 1;
          const periodOrder: Record<string, number> = { Morning: 0, Afternoon: 1, Evening: 2 };
          const sortedPeriods = showPeriods
            ? [...periods].sort((a, b) => periodOrder[a] - periodOrder[b])
            : [];

          return (
            <div key={dateKey} className="space-y-3">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                {dateKey}
              </h4>
              {showPeriods ? (
                sortedPeriods.map(period => {
                  const periodEvents = dayEvents.filter(e => getTimePeriod(e.date) === period);
                  return (
                    <div key={period} className="space-y-2">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider ml-1">
                        {period}
                      </span>
                      <div className="space-y-2">
                        {periodEvents.map(event => renderEvent(event))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-2">
                  {dayEvents.map(event => renderEvent(event))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  function renderEvent(event: TimelineEvent) {
    const Icon = iconMap[event.type];
    const period = showPeriodsInDay(dateGroups, event) ? getTimePeriod(event.date) : null;

    return (
      <div
        key={`${event.type}-${event.id}`}
        className={`relative flex gap-3 border-l-4 ${borderColorMap[event.type]} pl-4 pr-3 py-3 bg-white dark:bg-slate-900 rounded-r-md shadow-sm hover:shadow-md transition-all ${onEventClick ? 'cursor-pointer' : ''}`}
        onClick={() => onEventClick?.(event)}
      >
        <div className={`w-6 h-6 rounded-full ${colorMap[event.type]} flex items-center justify-center shrink-0 z-10 mt-0.5`}>
          <Icon size={12} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">{event.title}</span>
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {typeLabels[event.type]}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>
          {event.meta && <p className="text-[10px] text-slate-500 mt-1 italic">{event.meta}</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-400 font-medium">
              {period && `${period} • `}
              {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {onEventClick && (
              <span className="text-[11px] text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors">
                View <Eye size={10} />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

function showPeriodsInDay(dateGroups: Record<string, TimelineEvent[]>, event: TimelineEvent): boolean {
  const dateKey = getDateKey(event.date);
  const dayEvents = dateGroups[dateKey];
  if (!dayEvents) return false;
  const periods = new Set(dayEvents.map(e => getTimePeriod(e.date)));
  return periods.size > 1;
}