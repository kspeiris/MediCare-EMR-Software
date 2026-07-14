import { Calendar as CalendarIcon, Clock, SlidersHorizontal, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { db, Appointment, Patient } from '@/services/db';
import { Badge } from '@/components/ui/Badge';

export function Appointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState('Month');
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => db.getAppointments());
  const patients = db.getPatients();
  const doc = db.getDoctorProfile();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('Routine Checkup');
  const [notes, setNotes] = useState('');

  const [editForm, setEditForm] = useState({
    patientId: '',
    date: '',
    time: '09:00',
    reason: 'Routine Checkup',
    notes: ''
  });

  const [statusFilter, setStatusFilter] = useState('All');

  const enrichedAppointments = useMemo(() => {
    return appointments.map(apt => {
      const p = patients.find(pat => pat.id === apt.patientId);
      return {
        ...apt,
        patientName: p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient',
        patientObj: p
      };
    });
  }, [appointments, patients]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'All') return enrichedAppointments;
    return enrichedAppointments.filter(a => a.status === statusFilter);
  }, [enrichedAppointments, statusFilter]);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !date || !time) return;

    db.addAppointment({
      patientId: selectedPatientId,
      date,
      time,
      reason,
      status: 'Scheduled',
      notes
    });

    setAppointments(db.getAppointments());
    setSelectedPatientId('');
    setNotes('');
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    db.updateAppointmentStatus(id, status);
    setAppointments(db.getAppointments());
  };

  const handleEditClick = (apt: Appointment) => {
    setEditingApt(apt);
    setEditForm({
      patientId: apt.patientId,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      notes: apt.notes
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt || !editForm.patientId || !editForm.date || !editForm.time) return;

    db.updateAppointment(editingApt.id, {
      patientId: editForm.patientId,
      date: editForm.date,
      time: editForm.time,
      reason: editForm.reason,
      notes: editForm.notes
    });

    setAppointments(db.getAppointments());
    setIsEditModalOpen(false);
    setEditingApt(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment? This cannot be undone.")) {
      db.deleteAppointment(id);
      setAppointments(db.getAppointments());
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Appointment Schedule</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Manage and check in scheduled patient visits.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors"
        >
          + New Appointment
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Patient Visit">
        <form className="space-y-4" onSubmit={handleSchedule}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Date</label>
              <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Time</label>
              <input value={time} onChange={(e) => setTime(e.target.value)} type="time" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Reason for Visit</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} type="text" placeholder="e.g. Follow-up consultation" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Doctor Remarks / Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="Special symptoms or requirements..."></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 transition-colors">Schedule Visit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Appointment">
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Patient</label>
            <select 
              value={editForm.patientId}
              onChange={(e) => setEditForm({...editForm, patientId: e.target.value})}
              required
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none"
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Date</label>
              <input value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} type="date" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Time</label>
              <input value={editForm.time} onChange={(e) => setEditForm({...editForm, time: e.target.value})} type="time" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Reason for Visit</label>
            <input value={editForm.reason} onChange={(e) => setEditForm({...editForm, reason: e.target.value})} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Doctor Remarks / Notes</label>
            <textarea value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="Special symptoms or requirements..."></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 transition-colors">Update Appointment</button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Filters & List */}
        <div className="col-span-12 lg:col-span-4 space-y-4 no-print">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 uppercase tracking-wide">
              <SlidersHorizontal size={14} className="text-sky-500" />
              Filter Board
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-1.5 text-[12px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded outline-none text-slate-800 dark:text-slate-150"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Today's Schedule Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                <Clock size={15} className="text-sky-500" />
                Schedule List
              </h3>
              <span className="bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                {filteredAppointments.length} Visits
              </span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <div key={apt.id} className={`p-3 border rounded relative ${apt.status === 'Completed' ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-semibold text-slate-400">{apt.date} • {apt.time}</span>
                      <Badge variant={apt.status === 'Completed' ? 'success' : apt.status === 'Cancelled' ? 'critical' : 'warning'}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="text-[12px] font-bold text-slate-900 dark:text-slate-100">{apt.patientName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{apt.reason}</div>
                    
                    {apt.status === 'Scheduled' && (
                      <div className="mt-3 flex gap-1">
                        <button 
                          onClick={() => handleUpdateStatus(apt.id, 'Completed')} 
                          className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold py-1 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center gap-0.5"
                        >
                          Check In / Complete
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                          className="bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 text-[10px] font-semibold px-2 py-1 rounded hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <div className="mt-2 flex gap-1">
                      <button 
                        onClick={() => handleEditClick(apt)}
                        className="text-[10px] text-sky-500 hover:text-sky-700 font-semibold flex items-center gap-0.5"
                      >
                        <Edit2 size={10} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(apt.id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-0.5"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-xs block py-4 text-center">No appointments found.</span>
              )}
            </div>
          </div>
        </div>

        {/* Calendar visual Mockup */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col print-container">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">Monthly Agenda View</h3>
             </div>
             <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 no-print">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Scheduled</span>
             </div>
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr_1fr_1fr_1fr_1fr] text-[11px]">
             {/* Header */}
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
               <div key={day} className="p-2 text-center font-bold text-slate-500 border-b border-r border-slate-100 dark:border-slate-800 last:border-r-0 uppercase">
                 {day}
               </div>
             ))}
             {/* Days grid */}
             {Array.from({length: 35}).map((_, i) => {
               const dayNum = i - 2;
               const isCurrentMonth = dayNum > 0 && dayNum <= 31;
               const isToday = dayNum === new Date().getDate();
               
               const dayApts = isCurrentMonth ? enrichedAppointments.filter(a => {
                 const aptDay = parseInt(a.date.split('-')[2], 10);
                 return aptDay === dayNum;
               }) : [];

               return (
                 <div key={i} className={cn("p-1 border-b border-r border-slate-100 dark:border-slate-800 min-h-[75px]", !isCurrentMonth && "bg-slate-50/50 dark:bg-slate-950/20")}>
                    {isCurrentMonth && (
                      <div className="flex flex-col h-full">
                        <span className={cn("self-end font-semibold text-[10px] mb-1", isToday ? "bg-sky-500 text-white w-4 h-4 flex items-center justify-center rounded-full" : "text-slate-400")}>
                          {dayNum}
                        </span>
                        <div className="space-y-1">
                          {dayApts.slice(0, 2).map(apt => (
                             <div 
                               key={apt.id} 
                               className={cn(
                                 "text-[9px] px-1 py-0.5 rounded truncate font-medium",
                                 apt.status === 'Completed' 
                                   ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500' 
                                   : apt.status === 'Cancelled'
                                   ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 line-through border-l-2 border-red-400'
                                   : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-l-2 border-amber-500'
                               )}
                             >
                               {apt.time} {apt.patientName.split(' ')[0]}
                             </div>
                           ))}
                           {dayApts.length > 2 && (
                             <span className="text-[8px] text-slate-400 pl-1 font-semibold">+{dayApts.length - 2} more</span>
                           )}
                        </div>
                      </div>
                    )}
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </div>
  );
}
