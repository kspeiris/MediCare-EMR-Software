import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Consultation } from '@/services/db';

interface VitalsChartProps {
  consultations: Consultation[];
}

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

  if (data.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs">
        No vitals data available yet. Vitals will appear after consultations.
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temp (°F)" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} name="SpO2 (%)" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
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
              <Line type="monotone" dataKey="bmi" stroke="#8b5cf6" strokeWidth={2} name="BMI" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
