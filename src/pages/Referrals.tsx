import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo, useEffect } from 'react';
import { getLocalDate } from '@/lib/dates';
import { Modal } from '@/components/ui/Modal';
import { Search, Plus, Trash2, Edit2, UserRoundPlus } from 'lucide-react';
import { db, Referral, Patient, Consultation } from '@/services/db';
import { useLocation } from 'react-router-dom';
import { onDbChange } from '@/services/db';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineBanner } from '@/components/ui/InlineBanner';

export function Referrals() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [referrals, setReferrals] = useState<Referral[]>(() => db.getReferralsSync());
  const [patients, setPatients] = useState(() => db.getPatientsSync());
  const [consultations, setConsultations] = useState(() => db.getConsultationsSync());

  const loadData = () => {
    db.getReferrals().then(setReferrals);
    db.getPatients().then(setPatients);
    db.getConsultations().then(setConsultations);
  };

  useEffect(() => {
    loadData();
    const unsub1 = onDbChange('referrals:changed', loadData);
    const unsub2 = onDbChange('patients:changed', loadData);
    const unsub3 = onDbChange('consultations:changed', loadData);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedConsultationId, setSelectedConsultationId] = useState('');
  const [specialistName, setSpecialistName] = useState('');
  const [facility, setFacility] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Referral['status']>('Pending');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (location.state && (location.state as any).patientId) {
      const stateObj = location.state as any;
      setSelectedPatientId(stateObj.patientId);
      setSelectedConsultationId(stateObj.consultationId || '');
      setIsModalOpen(true);
    }
  }, [location.state]);

  const enrichedReferrals = useMemo(() => {
    return referrals.map(r => {
      const patObj = patients.find(p => p.id === r.patientId);
      const consObj = consultations.find(c => c.id === r.consultationId);
      return {
        ...r,
        patientName: patObj ? `${patObj.firstName} ${patObj.lastName}` : 'Unknown Patient',
        consultationDate: consObj?.date
      };
    });
  }, [referrals, patients, consultations]);

  const filteredReferrals = useMemo(() => {
    if (!searchQuery) return enrichedReferrals;
    const query = searchQuery.toLowerCase();
    return enrichedReferrals.filter(r =>
      r.patientName.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.specialistName.toLowerCase().includes(query) ||
      r.facility.toLowerCase().includes(query)
    );
  }, [enrichedReferrals, searchQuery]);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selectedPatientId || !specialistName || !facility || !reason) return;

    try {
      await db.addReferral({
        patientId: selectedPatientId,
        consultationId: selectedConsultationId || undefined,
        specialistName,
        facility,
        reason,
        notes,
        status,
        date: getLocalDate()
      });

      loadData();
      setSelectedPatientId('');
      setSelectedConsultationId('');
      setSpecialistName('');
      setFacility('');
      setReason('');
      setNotes('');
      setStatus('Pending');
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create referral. Please try again.');
    }
  };

  const handleEditClick = (referral: Referral) => {
    setEditingReferral(referral);
    setSelectedPatientId(referral.patientId);
    setSelectedConsultationId(referral.consultationId || '');
    setSpecialistName(referral.specialistName);
    setFacility(referral.facility);
    setReason(referral.reason);
    setNotes(referral.notes);
    setStatus(referral.status);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReferral || !selectedPatientId || !specialistName || !facility || !reason) return;

    await db.updateReferral(editingReferral.id, {
      patientId: selectedPatientId,
      consultationId: selectedConsultationId || undefined,
      specialistName,
      facility,
      reason,
      notes,
      status
    });

    loadData();
    setIsEditModalOpen(false);
    setEditingReferral(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this referral?")) {
      await db.deleteReferral(id);
      loadData();
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Referral Tracking</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Track patient referrals to external specialists.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors"
        >
          <Plus size={14} className="inline-block mr-1" /> New Referral
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setFormError(''); }} title="Create New Referral">
        <form onSubmit={handleCreateReferral} className="space-y-4">
          {formError && (
            <InlineBanner variant="error" title="Error" onDismiss={() => setFormError('')}>
              {formError}
            </InlineBanner>
          )}
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
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Consultation (optional)</label>
            <select
              value={selectedConsultationId}
              onChange={(e) => setSelectedConsultationId(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none"
            >
              <option value="">None</option>
              {consultations.filter(c => c.patientId === selectedPatientId).map(c => (
                <option key={c.id} value={c.id}>{c.date} - {c.diagnosis}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Specialist Name</label>
              <input value={specialistName} onChange={(e) => setSpecialistName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" placeholder="Dr. Smith" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Facility</label>
              <input value={facility} onChange={(e) => setFacility(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" placeholder="City Hospital" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" placeholder="Reason for referral..."></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" placeholder="Additional notes..."></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Referral['status'])} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none">
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Create Referral</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Referral">
        <form onSubmit={handleEditSubmit} className="space-y-4">
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
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Specialist Name</label>
            <input value={specialistName} onChange={(e) => setSpecialistName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Facility</label>
            <input value={facility} onChange={(e) => setFacility(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none"></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Referral['status'])} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none">
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Update Referral</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Referrals</h3>
          <div className="flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Patient</Th>
              <Th>Specialist</Th>
              <Th>Facility</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredReferrals.map((referral) => (
              <tr key={referral.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Td className="font-semibold text-slate-700 dark:text-slate-300">#{referral.id}</Td>
                <Td>{referral.patientName}</Td>
                <Td>{referral.specialistName}</Td>
                <Td>{referral.facility}</Td>
                <Td>{referral.date}</Td>
                <Td>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${referral.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : referral.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {referral.status}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditClick(referral)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(referral.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filteredReferrals.length === 0 && (
              <tr>
                <Td colSpan={7}>
                  <EmptyState
                    icon={<UserRoundPlus size={36} />}
                    title="No referrals found"
                    description="Refer patients to specialists and track referral status here."
                    action={
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Plus size={14} /> New Referral
                      </button>
                    }
                  />
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
