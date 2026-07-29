import { Patient, Consultation, Prescription, Appointment } from '@/services/db';

export type DateRange = {
  start: string;
  end: string;
};

export type CohortDefinition = {
  label: string;
  filter: (patient: Patient) => boolean;
};

export type CohortResult = {
  label: string;
  totalPatients: number;
  activePatients: number;
  totalVisits: number;
  avgVisitsPerPatient: number;
  topDiagnoses: { name: string; count: number }[];
  noShowRate: number;
  growthRate: number;
};

export type ComparisonResult = {
  periodA: {
    label: string;
    start: string;
    end: string;
    consultations: number;
    patients: number;
    prescriptions: number;
    appointments: number;
    topDiagnosis: string;
  };
  periodB: {
    label: string;
    start: string;
    end: string;
    consultations: number;
    patients: number;
    prescriptions: number;
    appointments: number;
    topDiagnosis: string;
  };
  growth: {
    consultations: number;
    patients: number;
    prescriptions: number;
    appointments: number;
  };
};

export function buildCohorts(patients: Patient[], consultations: Consultation[], prescriptions: Prescription[]): CohortDefinition[] {
  return [
    {
      label: 'All Patients',
      filter: () => true
    },
    {
      label: 'Male Patients',
      filter: p => p.gender === 'Male'
    },
    {
      label: 'Female Patients',
      filter: p => p.gender === 'Female'
    },
    {
      label: '0-19 Years',
      filter: p => {
        if (!p.dob) return false;
        const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
        return age <= 19;
      }
    },
    {
      label: '20-39 Years',
      filter: p => {
        if (!p.dob) return false;
        const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
        return age >= 20 && age <= 39;
      }
    },
    {
      label: '40-59 Years',
      filter: p => {
        if (!p.dob) return false;
        const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
        return age >= 40 && age <= 59;
      }
    },
    {
      label: '60+ Years',
      filter: p => {
        if (!p.dob) return false;
        const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
        return age >= 60;
      }
    },
    {
      label: 'With Chronic Conditions',
      filter: p => p.chronicDiseases && p.chronicDiseases !== 'None'
    }
  ];
}

export function computeCohortAnalysis(
  patients: Patient[],
  consultations: Consultation[],
  prescriptions: Prescription[],
  appointments: Appointment[],
  cohort: CohortDefinition
): CohortResult {
  const cohortPatients = patients.filter(cohort.filter);
  const cohortPatientIds = new Set(cohortPatients.map(p => p.id));
  const cohortConsultations = consultations.filter(c => cohortPatientIds.has(c.patientId));
  const cohortPrescriptions = prescriptions.filter(p => cohortPatientIds.has(p.patientId));
  const cohortAppointments = appointments.filter(a => cohortPatientIds.has(a.patientId));

  const totalPatients = cohortPatients.length;
  const activePatients = new Set(cohortConsultations.map(c => c.patientId)).size;
  const totalVisits = cohortConsultations.length;
  const avgVisitsPerPatient = totalPatients > 0 ? Number((totalVisits / totalPatients).toFixed(2)) : 0;

  const diagnosisCounts: Record<string, number> = {};
  cohortConsultations.forEach(c => {
    if (c.diagnosis) {
      const parts = c.diagnosis.split(/[;,]/).map(s => s.trim()).filter(Boolean);
      const entries = parts.length > 0 ? parts : [c.diagnosis];
      entries.forEach(d => {
        diagnosisCounts[d] = (diagnosisCounts[d] || 0) + 1;
      });
    }
  });
  const topDiagnoses = Object.entries(diagnosisCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const totalAppointments = cohortAppointments.length || 1;
  const noShows = cohortAppointments.filter(a => a.status === 'Cancelled').length;
  const noShowRate = Number(((noShows / totalAppointments) * 100).toFixed(2));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const previousThirtyDays = new Date(thirtyDaysAgo);
  previousThirtyDays.setDate(previousThirtyDays.getDate() - 30);

  const currentPeriodVisits = cohortConsultations.filter(c => new Date(c.date) >= thirtyDaysAgo).length;
  const previousPeriodVisits = cohortConsultations.filter(c => {
    const d = new Date(c.date);
    return d >= previousThirtyDays && d < thirtyDaysAgo;
  }).length;

  const growthRate = previousPeriodVisits > 0
    ? Number(((currentPeriodVisits - previousPeriodVisits) / previousPeriodVisits) * 100).toFixed(2)
    : currentPeriodVisits > 0 ? 100 : 0;

  return {
    label: cohort.label,
    totalPatients,
    activePatients,
    totalVisits,
    avgVisitsPerPatient,
    topDiagnoses,
    noShowRate,
    growthRate: Number(growthRate)
  };
}

export function compareDateRanges(
  patients: Patient[],
  consultations: Consultation[],
  prescriptions: Prescription[],
  appointments: Appointment[],
  rangeA: DateRange,
  rangeB: DateRange
): ComparisonResult {
  const filterByRange = <T extends { date: string }>(items: T[], range: DateRange) =>
    items.filter(item => {
      const d = new Date(item.date);
      return d >= new Date(range.start) && d <= new Date(range.end);
    });

  const consA = filterByRange(consultations, rangeA);
  const consB = filterByRange(consultations, rangeB);
  const patsA = new Set(consA.map(c => c.patientId));
  const patsB = new Set(consB.map(c => c.patientId));
  const prescA = filterByRange(prescriptions, rangeA);
  const prescB = filterByRange(prescriptions, rangeB);
  const aptsA = filterByRange(appointments, rangeA);
  const aptsB = filterByRange(appointments, rangeB);

  const topDiagnosis = (items: Consultation[]) => {
    if (items.length === 0) return 'None';
    const counts: Record<string, number> = {};
    items.forEach(c => {
      if (c.diagnosis) counts[c.diagnosis] = (counts[c.diagnosis] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : 'None';
  };

  const growth = (a: number, b: number) => {
    if (b === 0) return a > 0 ? 100 : 0;
    return Number(((a - b) / b) * 100).toFixed(2);
  };

  return {
    periodA: {
      label: `${rangeA.start} to ${rangeA.end}`,
      start: rangeA.start,
      end: rangeA.end,
      consultations: consA.length,
      patients: patsA.size,
      prescriptions: prescA.length,
      appointments: aptsA.length,
      topDiagnosis: topDiagnosis(consA)
    },
    periodB: {
      label: `${rangeB.start} to ${rangeB.end}`,
      start: rangeB.start,
      end: rangeB.end,
      consultations: consB.length,
      patients: patsB.size,
      prescriptions: prescB.length,
      appointments: aptsB.length,
      topDiagnosis: topDiagnosis(consB)
    },
    growth: {
      consultations: Number(growth(consA.length, consB.length)),
      patients: Number(growth(patsA.size, patsB.size)),
      prescriptions: Number(growth(prescA.length, prescB.length)),
      appointments: Number(growth(aptsA.length, aptsB.length))
    }
  };
}

export function getDefaultDateRanges() {
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const format = (d: Date) => d.toISOString().split('T')[0];

  return {
    currentMonth: { start: format(currentMonthStart), end: format(today) },
    previousMonth: { start: format(previousMonthStart), end: format(previousMonthEnd) },
    last30Days: { start: format(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)), end: format(today) },
    last90Days: { start: format(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)), end: format(today) }
  };
}
