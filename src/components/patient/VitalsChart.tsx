import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Consultation } from '@/services/db';

interface VitalsChartProps {
  consultations: Consultation[];
}

interface AlertThreshold {
  label: string;
  key: string;
  min?: number;
  max?: number;
  unit: string;
  color: string;
}

const THRESHOLDS: AlertThreshold[] = [
  { label: 'Systolic BP', key: 'bp', min: 90, max: 140, unit: 'mmHg', color: '#0284c7' },
  { label: 'Pulse', key: 'pulse', min: 60, max: 100, unit: 'bpm', color: '#ef4444' },
  { label: 'Temp', key: 'temp', min: 97.8, max: 99.1, unit: '°F', color: '#f59e0b' },
  { label: 'SpO2', key: 'spo2', min: 95, max: 100, unit: '%', color: '#10b981' },
  { label: 'BMI', key: 'bmi', min: 18.5, max: 24.9, unit: '', color: '#8b5cf6' }
];

export function VitalsChart({ consultations }: VitalsChartProps) {
  const data = useMemo(() => {
    return consultations
      .filter(c => c.vitals)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(c => ({
        date: c.date,
        bp: parseFloat(c.vitals!.bloodPressure.split('/')[0]) || 0,
        pulse: c.vitals!.pulseRate || 0,
        temp: c.vitals!.temperature || 0,
        spo2: c.vitals!.oxygenSaturation || 0,
        bmi: c.vitals!.bmi || 0
      }));
  }, [consultations]);

  const anomalies = useMemo(() => {
    const found: { date: string; key: string; value: number; threshold: AlertThreshold }[] = [];
    data.forEach(d => {
      THRESHOLDS.forEach(t => {
        const val = d[t.key as keyof typeof d];
        if (typeof val === 'number') {
          if ((t.min !== undefined && val < t.min) || (t.max !== undefined && val > t.max)) {
            found.push({ date: d.date, key: t.key, value: val, threshold: t });
          }
        }
      });
    });
    return found;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs">
        No vitals data available yet. Vitals will appear after consultations.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {anomalies.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded p-3">
          <p className="text-[11px] font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Abnormal Readings Detected
          </p>
          <div className="flex flex-wrap gap-2">
            {anomalies.slice(0, 6).map((a, i) => (
              <span key={i} className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-0.5 rounded">
                {a.date}: {a.threshold.label} {a.value}{a.threshold.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-3">Blood Pressure & Pulse</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                  cursor={{ fill: 'var(--tooltip-cursor)' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'High BP', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
                <Line type="monotone" dataKey="bp" stroke="#0284c7" strokeWidth={2} name="Systolic BP" dot={{ r: 2 }} />
                <Line type="monotone" dataKey="pulse" stroke="#ef4444" strokeWidth={2} name="Pulse (bpm)" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-3">Temperature & SpO2</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                  cursor={{ fill: 'var(--tooltip-cursor)' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <ReferenceLine y={99.1} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High', position: 'insideTopRight', fontSize: 9, fill: '#f59e0b' }} />
                <ReferenceLine y={97.8} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Low', position: 'insideBottomRight', fontSize: 9, fill: '#10b981' }} />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temp (°F)" dot={{ r: 2 }} />
                <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} name="SpO2 (%)" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-3">BMI Trend</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} dy={10} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '4px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', fontSize: '11px', padding: '6px' }}
                cursor={{ fill: 'var(--tooltip-cursor)' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <ReferenceLine y={18.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Underweight', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
              <ReferenceLine y={24.9} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Overweight', position: 'insideBottomRight', fontSize: 9, fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="bmi" stroke="#8b5cf6" strokeWidth={2} name="BMI" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
