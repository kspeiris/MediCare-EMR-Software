import { Patient, Consultation, Prescription, Appointment } from '@/services/db';

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TrendDatum {
  label: string;
  visits: number;
  diagnoses: number;
  prescriptions: number;
  followUps: number;
  noShows: number;
}

export interface AgeBucket {
  name: string;
  value: number;
  color: string;
}

export interface DiagnosisBucket {
  name: string;
  value: number;
}

export interface GenderBucket {
  name: string;
  value: number;
}

export interface StatusBucket {
  name: string;
  value: number;
}

export interface ChronicRow {
  ageGroup: string;
  condition: string;
  count: number;
}

export interface AnalyticsSummary {
  totalVisits: number;
  totalDiagnoses: number;
  totalPrescriptions: number;
  totalFollowUps: number;
  noShowRate: number;
  avgVisitsPerPatient: number;
  trendData: TrendDatum[];
  ageData: AgeBucket[];
  diagnosisData: DiagnosisBucket[];
  genderData: GenderBucket[];
  statusData: StatusBucket[];
  chronicData: ChronicRow[];
}

const AGE_COLORS: Record<string, string> = {
  '0-19': '#94a3b8',
  '20-39': '#38bdf8',
  '40-59': '#0284c7',
  '60+': '#0f172a'
};

function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function ageBracket(age: number): string {
  if (age <= 19) return '0-19';
  if (age <= 39) return '20-39';
  if (age <= 59) return '40-59';
  return '60+';
}

function bucketKey(dateStr: string, period: AnalyticsPeriod): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'unknown';

  if (period === 'daily') {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (period === 'weekly') {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    let w = 1;
    while (true) {
      target.setDate(target.getDate() + 7);
      if (target.valueOf() > firstThursday) break;
      w++;
    }
    return `${d.getFullYear()}-W${String(w).padStart(2, '0')}`;
  }

  if (period === 'monthly') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  return `${d.getFullYear()}`;
}

function prettyLabel(key: string, period: AnalyticsPeriod): string {
  if (period === 'daily') {
    const [y, m, day] = key.split('-').map(Number);
    if ([y, m, day].some(isNaN)) return key;
    const d = new Date(y, m - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (period === 'weekly') return key.replace('-W', ' W');
  if (period === 'monthly') {
    const [y, m] = key.split('-').map(Number);
    if ([y, m].some(isNaN)) return key;
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return key;
}

function normalizePeriod(period: AnalyticsPeriod, requestedCount?: number): number {
  if (requestedCount && requestedCount > 0) return requestedCount;
  if (period === 'daily') return 14;
  if (period === 'weekly') return 12;
  if (period === 'monthly') return 12;
  return 5;
}

export function computeAnalytics(
  patients: Patient[],
  consultations: Consultation[],
  prescriptions: Prescription[],
  appointments: Appointment[],
  period: AnalyticsPeriod = 'monthly',
  limit?: number
): AnalyticsSummary {
  const visitDates = consultations.map(c => c.date);
  const minDate = visitDates.length ? new Date(Math.min(...visitDates.map(d => new Date(d).getTime()))) : new Date();
  const maxDate = visitDates.length ? new Date(Math.max(...visitDates.map(d => new Date(d).getTime()))) : new Date();

  const count = normalizePeriod(period, limit);
  const buckets: Record<string, TrendDatum> = {};
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const ref = new Date(now);
    if (period === 'daily') ref.setDate(ref.getDate() - i);
    else if (period === 'weekly') ref.setDate(ref.getDate() - i * 7);
    else if (period === 'monthly') ref.setMonth(ref.getMonth() - i);
    else ref.setFullYear(ref.getFullYear() - i);

    const key = bucketKey(ref.toISOString(), period);
    buckets[key] = {
      label: prettyLabel(key, period),
      visits: 0,
      diagnoses: 0,
      prescriptions: 0,
      followUps: 0,
      noShows: 0
    };
  }

  const patientMap = new Map<string, Patient>();
  patients.forEach(p => patientMap.set(p.id, p));

  consultations.forEach(c => {
    const key = bucketKey(c.date, period);
    if (!buckets[key]) {
      buckets[key] = {
        label: prettyLabel(key, period),
        visits: 0,
        diagnoses: 0,
        prescriptions: 0,
        followUps: 0,
        noShows: 0
      };
    }
    buckets[key].visits += 1;
    if (c.diagnosis?.trim()) buckets[key].diagnoses += 1;
    if (c.followupDate) buckets[key].followUps += 1;
  });

  prescriptions.forEach(p => {
    const key = bucketKey(p.date, period);
    if (!buckets[key]) {
      buckets[key] = {
        label: prettyLabel(key, period),
        visits: 0,
        diagnoses: 0,
        prescriptions: 0,
        followUps: 0,
        noShows: 0
      };
    }
    buckets[key].prescriptions += 1;
  });

  appointments.forEach(a => {
    const key = bucketKey(a.date, period);
    if (!buckets[key]) {
      buckets[key] = {
        label: prettyLabel(key, period),
        visits: 0,
        diagnoses: 0,
        prescriptions: 0,
        followUps: 0,
        noShows: 0
      };
    }
    if (a.status === 'Cancelled') buckets[key].noShows += 1;
  });

  const trendData = Object.keys(buckets)
    .sort()
    .map(key => buckets[key]);

  const ageBuckets: Record<string, number> = { '0-19': 0, '20-39': 0, '40-59': 0, '60+': 0 };
  patients.forEach(p => {
    if (p.dob) {
      ageBuckets[ageBracket(ageFromDob(p.dob))] += 1;
    }
  });
  const totalPatients = patients.length || 1;
  const ageData: AgeBucket[] = Object.entries(ageBuckets).map(([name, value]) => ({
    name,
    value,
    color: AGE_COLORS[name] || '#475569'
  }));

  const diagnosisMap: Record<string, number> = {};
  consultations.forEach(c => {
    const key = c.diagnosis?.trim();
    if (!key) return;
    const parts = key.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0 && key) {
      diagnosisMap[key] = (diagnosisMap[key] || 0) + 1;
    } else {
      parts.forEach(part => {
        if (part) diagnosisMap[part] = (diagnosisMap[part] || 0) + 1;
      });
    }
  });
  const diagnosisData: DiagnosisBucket[] = Object.entries(diagnosisMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const totalAppointments = appointments.length || 1;
  const genderData: GenderBucket[] = [
    { name: 'Male', value: patients.filter(p => p.gender === 'Male').length },
    { name: 'Female', value: patients.filter(p => p.gender === 'Female').length }
  ];

  const statusData: StatusBucket[] = [
    { name: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length },
    { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length }
  ];

  const totalDiagnoses = consultations.filter(c => c.diagnosis?.trim()).length;
  const totalFollowUps = consultations.filter(c => !!c.followupDate).length;
  const totalNoShows = appointments.filter(a => a.status === 'Cancelled').length;
  const uniqueVisitPatients = new Set(consultations.map(c => c.patientId)).size;

  const chronicPatients = patients.filter(p => p.chronicDiseases && p.chronicDiseases !== 'None');
  const chronicRows: ChronicRow[] = [];
  const chronicMap = new Map<string, Map<string, number>>();

  chronicPatients.forEach(p => {
    const group = p.dob ? ageBracket(ageFromDob(p.dob)) : 'Unknown';
    const raw = p.chronicDiseases.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    if (raw.length === 0 && p.chronicDiseases.trim()) {
      addChronicRow(chronicRows, chronicMap, group, p.chronicDiseases.trim());
    } else {
      raw.forEach(cond => addChronicRow(chronicRows, chronicMap, group, cond));
    }
  });

  const sortedChronic = Object.entries(chronicMap)
    .flatMap(([cond, groupMap]) =>
      Object.entries(groupMap).map(([group, count]) => ({ ageGroup: group, condition: cond, count: count as number }))
    )
    .sort((a, b) => a.condition.localeCompare(b.condition) || a.ageGroup.localeCompare(b.ageGroup));

  return {
    totalVisits: consultations.length,
    totalDiagnoses,
    totalPrescriptions: prescriptions.length,
    totalFollowUps,
    noShowRate: totalAppointments > 0 ? Number(((totalNoShows / totalAppointments) * 100).toFixed(2)) : 0,
    avgVisitsPerPatient: patients.length > 0 ? Number((consultations.length / patients.length).toFixed(2)) : 0,
    trendData,
    ageData,
    diagnosisData,
    genderData,
    statusData,
    chronicData: sortedChronic
  };
}

function addChronicRow(
  chronicRows: ChronicRow[],
  chronicMap: Map<string, Map<string, number>>,
  group: string,
  condition: string
) {
  if (!chronicMap.has(condition)) chronicMap.set(condition, new Map());
  const groupMap = chronicMap.get(condition)!;
  groupMap.set(group, (groupMap.get(group) || 0) + 1);
  if (!chronicRows.find(r => r.condition === condition && r.ageGroup === group)) {
    chronicRows.push({ ageGroup: group, condition, count: 0 });
  }
}
