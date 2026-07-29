import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo, useEffect } from 'react';
import { getLocalDate } from '@/lib/dates';
import { Modal } from '@/components/ui/Modal';
import { Search, Plus, Trash2, CheckCircle2, AlertTriangle, Clock, Pill, Calendar, XCircle } from 'lucide-react';
import { db, Reminder, Patient } from '@/services/db';
import { onDbChange } from '@/services/db';
import { EmptyState } from '@/components/ui/EmptyState';

type ReminderType = Reminder['type'];

const REMINDER_CONFIG: Record<ReminderType, { label: string; color: string; icon: any }> = {
  followup: { label: 'Follow-up', color: 'sky', icon: Clock },
  appointment: { label: 'Appointment', color: 'indigo', icon: Calendar },
  chart_review: { label: 'Chart Review', color: 'amber', icon: AlertTriangle },
  prescription_refill: { label: 'Prescription Refill', color: 'emerald', icon: Pill }
};

export function Reminders() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ReminderType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Reminder['status'] | 'all'>('all');

  const [reminders, setReminders] = useState<Reminder[]>(() => db.getRemindersSync());
  const [patients, setPatients] = useState<Patient[]>(() => db.getPatientsSync());

  const loadData = () => {
    db.getReminders().then(setReminders);
    db.getPatients().then(setPatients);
  };

  useEffect(() => {
    loadData();
    const unsub1 = onDbChange('reminders:changed', loadData);
    const unsub2 = onDbChange('patients:changed', loadData);
    return () => { unsub1(); unsub2(); };
  }, []);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('followup');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState(getLocalDate());
  const [relatedId, setRelatedId] = useState('');

  const patientMap = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach(p => map.set(p.id, p));
    return map;
  }, [patients]);

  const patientName = (id: string) => {
    const p = patientMap.get(id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient';
  };

  const filteredReminders = useMemo(() => {
    let list = reminders;
    if (filterType !== 'all') {
      list = list.filter(r => r.type === filterType);
    }
    if (filterStatus !== 'all') {
      list = list.filter(r => r.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        patientName(r.patientId).toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [reminders, filterType, filterStatus, searchQuery, patientMap]);

  const overdueCount = useMemo(() => {
    const today = getLocalDate();
    return reminders.filter(r => r.status === 'pending' && r.dueDate < today).length;
  }, [reminders]);

  const todayCount = useMemo(() => {
    const today = getLocalDate();
    return reminders.filter(r => r.status === 'pending' && r.dueDate === today).length;
  }, [reminders]);

  const upcomingCount = useMemo(() => {
    const today = getLocalDate();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    return reminders.filter(r => r.status === 'pending' && r.dueDate > today && r.dueDate <= nextWeekStr).length;
  }, [reminders]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !title || !message || !dueDate) return;

    await db.addReminder({
      patientId: selectedPatientId,
      type: reminderType,
      title,
      message,
      dueDate,
      status: 'pending',
      relatedId: relatedId || undefined
    });

    loadData();
    setSelectedPatientId('');
    setReminderType('followup');
    setTitle('');
    setMessage('');
    setDueDate(getLocalDate());
    setRelatedId('');
    setIsModalOpen(false);
  };

  const handleComplete = async (id: string) => {
    await db.updateReminder(id, { status: 'completed' });
    loadData();
  };

  const handleCancel = async (id: string) => {
    await db.updateReminder(id, { status: 'cancelled' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this reminder?')) {
      await db.deleteReminder(id);
      loadData();
    }
  };

  const getStatusBadge = (status: Reminder['status']) => {
    if (status === 'completed') return <Badge variant="success">Completed</Badge>;
    if (status === 'cancelled') return <Badge variant="critical">Cancelled</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Reminders & Notifications</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Follow-ups, appointments, chart reviews, and prescription refills.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors"
        >
          <Plus size={14} className="inline-block mr-1" /> New Reminder
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Overdue</span>
          <span className="text-[20px] font-bold text-rose-600 dark:text-rose-300">{overdueCount}</span>
          <span className="text-[11px] text-slate-500">Past due date</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Due Today</span>
          <span className="text-[20px] font-bold text-amber-600 dark:text-amber-300">{todayCount}</span>
          <span className="text-[11px] text-slate-500">Today</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Upcoming (7d)</span>
          <span className="text-[20px] font-bold text-sky-600 dark:text-sky-300">{upcomingCount}</span>
          <span className="text-[11px] text-slate-500">Next 7 days</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Active</span>
          <span className="text-[20px] font-bold text-slate-900 dark:text-white">{reminders.filter(r => r.status === 'pending').length}</span>
          <span className="text-[11px] text-slate-500">Pending reminders</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ReminderType | 'all')}
              className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[12px] outline-none text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              {Object.entries(REMINDER_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Reminder['status'] | 'all')}
              className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[12px] outline-none text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Patient</Th>
              <Th>Type</Th>
              <Th>Title</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredReminders.map((reminder) => {
              const config = REMINDER_CONFIG[reminder.type];
              const Icon = config.icon;
              return (
                <tr key={reminder.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${reminder.status === 'pending' && reminder.dueDate < getLocalDate() ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}>
                  <Td className="font-semibold text-slate-700 dark:text-slate-300">#{reminder.id}</Td>
                  <Td>{patientName(reminder.patientId)}</Td>
                  <Td>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-${config.color}-50 text-${config.color}-700 border border-${config.color}-200 dark:bg-${config.color}-950 dark:text-${config.color}-400`}>
                      <Icon size={10} /> {config.label}
                    </span>
                  </Td>
                  <Td>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{reminder.title}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{reminder.message}</p>
                    </div>
                  </Td>
                  <Td className={`${reminder.status === 'pending' && reminder.dueDate < getLocalDate() ? 'text-rose-600 font-bold' : ''}`}>
                    {reminder.dueDate}
                  </Td>
                  <Td>{getStatusBadge(reminder.status)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {reminder.status === 'pending' && (
                        <button onClick={() => handleComplete(reminder.id)} className="text-emerald-500 hover:text-emerald-700 p-1" title="Complete">
                          <CheckCircle2 size={12} />
                        </button>
                      )}
                      {reminder.status === 'pending' && (
                        <button onClick={() => handleCancel(reminder.id)} className="text-slate-400 hover:text-slate-600 p-1" title="Cancel">
                          <XCircle size={12} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(reminder.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
            {filteredReminders.length === 0 && (
              <tr>
                <Td colSpan={7}>
                  <EmptyState
                    icon={<Clock size={36} />}
                    title="No reminders found"
                    description="Create follow-up, appointment, chart review, or prescription refill reminders."
                    action={
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Plus size={14} /> New Reminder
                      </button>
                    }
                  />
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Reminder">
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none"
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Type</label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as ReminderType)}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"
              >
                {Object.entries(REMINDER_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Due Date</label>
              <input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                type="date"
                required
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              required
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"
              placeholder="Reminder title"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={2}
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"
              placeholder="Reminder details..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Related ID (optional)</label>
            <input
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
              type="text"
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"
              placeholder="Consultation / Appointment / Prescription ID"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Create Reminder</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
