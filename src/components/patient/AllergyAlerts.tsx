import { useMemo } from 'react';
import { AlertTriangle, Pill, Shield, XCircle } from 'lucide-react';

interface AllergyAlertsProps {
  allergies: string[];
  currentMedications: string;
  consultations: { diagnosis?: string; medicines?: { name: string }[] }[];
}

interface Alert {
  type: 'allergy' | 'interaction';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

const HIGH_RISK_PAIRS: [string, string][] = [
  ['aspirin', 'warfarin'],
  ['ibuprofen', 'lisinopril'],
  ['metformin', 'alcohol'],
  ['atorvastatin', 'clarithromycin'],
  ['simvastatin', 'amiodarone'],
  ['ace inhibitor', 'spironolactone'],
  ['nsaid', 'ace inhibitor'],
  ['ssri', 'tramadol']
];

const ALLERGY_KEYWORDS = ['penicillin', 'sulfa', 'aspirin', 'ibuprofen', 'nsaid', 'codeine', 'morphine'];

export function AllergyAlerts({ allergies, currentMedications, consultations }: AllergyAlertsProps) {
  const alerts = useMemo<Alert[]>(() => {
    const warnings: Alert[] = [];

    if (!Array.isArray(allergies) || allergies.length === 0) {
      return warnings;
    }

    const allergyList = allergies.map(a => a.toLowerCase().trim()).filter(Boolean);

    const currentMeds = new Set<string>();
    consultations.forEach(c => {
      if (Array.isArray(c.medicines)) {
        c.medicines.forEach(m => {
          if (m.name) currentMeds.add(m.name.toLowerCase().trim());
        });
      }
    });

    if (currentMedications) {
      currentMedications.split(/[;,]/).map(s => s.trim()).filter(Boolean).forEach(m => currentMeds.add(m.toLowerCase()));
    }

    allergyList.forEach(allergy => {
      currentMeds.forEach(med => {
        const medWords = med.split(/[\s\-/]+/);
        const matches = medWords.some(w => w === allergy || w.startsWith(allergy) || allergy.startsWith(w)) ||
          med.includes(allergy) || allergy.includes(med);

        if (matches) {
          warnings.push({
            type: 'allergy',
            message: `Potential allergy conflict: Patient is allergic to "${allergy}" and current medication "${med}" may cross-react.`,
            severity: 'high'
          });
        }
      });

      const matchedKeywords = ALLERGY_KEYWORDS.filter(k => allergy.includes(k) || k.includes(allergy));
      if (matchedKeywords.length > 0) {
        warnings.push({
          type: 'allergy',
          message: `Known allergy to "${allergy}". Avoid medications containing ${matchedKeywords.join(', ')}.`,
          severity: 'high'
        });
      }
    });

    const medsArray = Array.from(currentMeds);
    for (let i = 0; i < medsArray.length; i++) {
      for (let j = i + 1; j < medsArray.length; j++) {
        const m1 = medsArray[i];
        const m2 = medsArray[j];
        const conflict = HIGH_RISK_PAIRS.find(([a, b]) =>
          (m1.includes(a) && m2.includes(b)) || (m1.includes(b) && m2.includes(a))
        );
        if (conflict) {
          warnings.push({
            type: 'interaction',
            message: `Potential drug interaction between "${m1}" and "${m2}". Clinical review recommended.`,
            severity: 'medium'
          });
        }
      }
    }

    return warnings;
  }, [allergies, currentMedications, consultations]);

  const highCount = alerts.filter(a => a.severity === 'high').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium').length;

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield size={14} className="text-emerald-500" />
          Safety Summary
        </h3>
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <Shield size={14} />
          No allergy or interaction warnings detected.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          Safety Alerts
        </h3>
        <div className="flex items-center gap-2">
          {highCount > 0 && (
            <span className="bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
              {highCount} High
            </span>
          )}
          {mediumCount > 0 && (
            <span className="bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
              {mediumCount} Medium
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`p-3 rounded border text-xs flex items-start gap-2 ${
              alert.severity === 'high'
                ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300'
                : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300'
            }`}
          >
            {alert.severity === 'high' ? <XCircle size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
            <div>
              <span className="font-semibold block">{alert.type === 'allergy' ? 'Allergy Warning' : 'Interaction Warning'}</span>
              <span className="text-[11px] opacity-90">{alert.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
