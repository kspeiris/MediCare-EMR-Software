import { Consultation, Prescription, MedicalCertificate, MedicalDocument, Referral } from '@/services/db';
import { Calendar, FileText, Pill, FileBadge, UserRoundPlus } from 'lucide-react';

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

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        <FileText className="mx-auto text-slate-300 mb-2" size={32} />
        No timeline events yet.
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-3">
        {events.map((event, idx) => {
          const Icon = iconMap[event.type];
          const date = new Date(event.date);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const isTime = event.type === 'consultation';
          return (
            <div key={`${event.type}-${event.id}`} className="relative flex gap-3">
              <div className={`w-6 h-6 rounded-full ${colorMap[event.type]} flex items-center justify-center shrink-0 z-10`}>
                <Icon size={12} className="text-white" />
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{event.title}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{event.description}</p>
                    {event.meta && <p className="text-[10px] text-slate-500 mt-0.5 italic">{event.meta}</p>}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                    {dateStr}{isTime && timeStr !== '00:00' ? ` ${timeStr}` : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
