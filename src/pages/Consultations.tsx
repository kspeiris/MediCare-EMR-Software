import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search, PlusCircle, Edit2, Trash2, Download, Printer } from 'lucide-react';
import { db, Consultation } from '@/services/db';
import { Link } from 'react-router-dom';
import { ConsultationPrintTemplate } from '@/components/print-templates/ConsultationPrintTemplate';
import { generatePDF } from '@/components/print-templates/pdfExport';

export function Consultations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<Consultation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Consultation | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const consultations = db.getConsultations();
  const patients = db.getPatients();
  const doc = db.getDoctorProfile();

  const [createForm, setCreateForm] = useState({
    patientId: '',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: '',
    diagnosis: '',
    treatmentPlan: '',
    clinicalNotes: '',
    bp: '120/80',
    pulse: '72',
    temp: '98.6',
    o2: '98'
  });

  const [editForm, setEditForm] = useState({
    patientId: '',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: '',
    diagnosis: '',
    treatmentPlan: '',
    clinicalNotes: '',
    bp: '120/80',
    pulse: '72',
    temp: '98.6',
    o2: '98'
  });

  const enrichedConsultations = useMemo(() => {
    return consultations.map(c => {
      const patient = patients.find(p => p.id === c.patientId);
      return {
        ...c,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        physician: doc.name
      };
    });
  }, [consultations, patients, doc]);

  const filteredVisits = useMemo(() => {
    if (!searchQuery) return enrichedConsultations;
    const query = searchQuery.toLowerCase();
    return enrichedConsultations.filter(v => 
      v.patientName.toLowerCase().includes(query) || 
      v.id.toLowerCase().includes(query) ||
      v.diagnosis.toLowerCase().includes(query) ||
      v.physician.toLowerCase().includes(query)
    );
  }, [enrichedConsultations, searchQuery]);

  const handleCreateConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.patientId || !createForm.chiefComplaint || !createForm.diagnosis) return;

    const patient = patients.find(p => p.id === createForm.patientId);
    
    db.addConsultation({
      patientId: createForm.patientId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chiefComplaint: createForm.chiefComplaint,
      historyOfPresentIllness: createForm.historyOfPresentIllness,
      physicalExamination: createForm.physicalExamination,
      diagnosis: createForm.diagnosis,
      treatmentPlan: createForm.treatmentPlan,
      clinicalNotes: createForm.clinicalNotes,
      vitals: {
        height: patient?.height || 170,
        weight: patient?.weight || 70,
        bmi: patient?.bmi || 23.5,
        bloodPressure: createForm.bp,
        pulseRate: parseInt(createForm.pulse) || 72,
        respiratoryRate: 16,
        temperature: parseFloat(createForm.temp) || 98.6,
        oxygenSaturation: parseInt(createForm.o2) || 98,
        bloodSugar: 90
      }
    });

    setCreateForm({
      patientId: '',
      chiefComplaint: '',
      historyOfPresentIllness: '',
      physicalExamination: '',
      diagnosis: '',
      treatmentPlan: '',
      clinicalNotes: '',
      bp: '120/80',
      pulse: '72',
      temp: '98.6',
      o2: '98'
    });
    setIsCreateModalOpen(false);
  };

  const handleEditClick = (visit: Consultation) => {
    setEditingVisit(visit);
    setEditForm({
      patientId: visit.patientId,
      chiefComplaint: visit.chiefComplaint,
      historyOfPresentIllness: visit.historyOfPresentIllness || '',
      physicalExamination: visit.physicalExamination || '',
      diagnosis: visit.diagnosis,
      treatmentPlan: visit.treatmentPlan || '',
      clinicalNotes: visit.clinicalNotes || '',
      bp: visit.vitals?.bloodPressure || '120/80',
      pulse: String(visit.vitals?.pulseRate || 72),
      temp: String(visit.vitals?.temperature || 98.6),
      o2: String(visit.vitals?.oxygenSaturation || 98)
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisit || !editForm.chiefComplaint || !editForm.diagnosis) return;

    const patient = patients.find(p => p.id === editForm.patientId);

    db.updateConsultation(editingVisit.id, {
      patientId: editForm.patientId,
      chiefComplaint: editForm.chiefComplaint,
      historyOfPresentIllness: editForm.historyOfPresentIllness,
      physicalExamination: editForm.physicalExamination,
      diagnosis: editForm.diagnosis,
      treatmentPlan: editForm.treatmentPlan,
      clinicalNotes: editForm.clinicalNotes,
      vitals: {
        height: patient?.height || 170,
        weight: patient?.weight || 70,
        bmi: patient?.bmi || 23.5,
        bloodPressure: editForm.bp,
        pulseRate: parseInt(editForm.pulse) || 72,
        respiratoryRate: 16,
        temperature: parseFloat(editForm.temp) || 98.6,
        oxygenSaturation: parseInt(editForm.o2) || 98,
        bloodSugar: 90
      }
    });

    setIsEditModalOpen(false);
    setEditingVisit(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this consultation record? This cannot be undone.")) {
      db.deleteConsultation(id);
      setSelectedVisit(null);
    }
  };

  const handlePrintAction = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!selectedVisit) return;
    setIsGeneratingPDF(true);
    try {
      const patientObj = patients.find(p => p.id === selectedVisit.patientId);
      const filename = `Consultation_${selectedVisit.id}_${patientObj?.firstName || 'Patient'}_${patientObj?.lastName || ''}`;
      await generatePDF('printable-consultation', filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Consultation Logs</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium font-sans">View history of clinical examinations and diagnoses.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors flex items-center gap-1"
        >
          <PlusCircle size={14} /> New Consultation
        </button>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Consultation Record">
        <form onSubmit={handleCreateConsultation} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Patient</label>
            <select 
              value={createForm.patientId}
              onChange={(e) => setCreateForm({...createForm, patientId: e.target.value})}
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
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Chief Complaint</label>
            <textarea 
              value={createForm.chiefComplaint}
              onChange={(e) => setCreateForm({...createForm, chiefComplaint: e.target.value})}
              required
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Primary issue that patient reports..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">History of Present Illness</label>
            <textarea 
              value={createForm.historyOfPresentIllness}
              onChange={(e) => setCreateForm({...createForm, historyOfPresentIllness: e.target.value})}
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Onset, duration, severity..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Physical Examination</label>
            <textarea 
              value={createForm.physicalExamination}
              onChange={(e) => setCreateForm({...createForm, physicalExamination: e.target.value})}
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="General appearance, system findings..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Clinical Diagnosis</label>
            <input 
              value={createForm.diagnosis}
              onChange={(e) => setCreateForm({...createForm, diagnosis: e.target.value})}
              type="text" 
              required
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="ICD-10 or Custom Diagnosis..."
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">BP (mmHg)</label>
              <input value={createForm.bp} onChange={(e) => setCreateForm({...createForm, bp: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Pulse (bpm)</label>
              <input value={createForm.pulse} onChange={(e) => setCreateForm({...createForm, pulse: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Temp (°F)</label>
              <input value={createForm.temp} onChange={(e) => setCreateForm({...createForm, temp: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">SpO2 (%)</label>
              <input value={createForm.o2} onChange={(e) => setCreateForm({...createForm, o2: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Treatment / Advice Plan</label>
            <textarea 
              value={createForm.treatmentPlan}
              onChange={(e) => setCreateForm({...createForm, treatmentPlan: e.target.value})}
              rows={3} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Treatment directions and follow-up plan..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Clinical Notes</label>
            <textarea 
              value={createForm.clinicalNotes}
              onChange={(e) => setCreateForm({...createForm, clinicalNotes: e.target.value})}
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Additional clinical observations..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Save Consultation</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedVisit} onClose={() => setSelectedVisit(null)} title="Consultation Details">
        {selectedVisit && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-4 no-print">
              <button
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
                className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1 disabled:opacity-50"
              >
                <Download size={14} />
                {isGeneratingPDF ? 'Generating PDF...' : 'Export PDF'}
              </button>
              <button onClick={handlePrintAction} className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 flex items-center gap-1">
                <Printer size={14} /> Print
              </button>
            </div>
            <div id="printable-consultation" className="hidden">
              <ConsultationPrintTemplate
                consultation={selectedVisit}
                patient={patients.find(p => p.id === selectedVisit.patientId)}
                doctor={doc}
              />
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => handleDelete(selectedVisit.id)} className="px-4 py-2 text-[12px] font-semibold text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 flex items-center gap-1">
                <Trash2 size={14} /> Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedVisit(null); handleEditClick(selectedVisit); }} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => setSelectedVisit(null)} className="bg-slate-900 dark:bg-sky-600 text-white px-4 py-2 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors font-semibold">Close</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Consultation Record">
        <form onSubmit={handleEditSubmit} className="space-y-4">
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
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Chief Complaint</label>
            <textarea 
              value={editForm.chiefComplaint}
              onChange={(e) => setEditForm({...editForm, chiefComplaint: e.target.value})}
              required
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Primary issue that patient reports..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">History of Present Illness</label>
            <textarea 
              value={editForm.historyOfPresentIllness}
              onChange={(e) => setEditForm({...editForm, historyOfPresentIllness: e.target.value})}
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Onset, duration, severity..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Physical Examination</label>
            <textarea 
              value={editForm.physicalExamination}
              onChange={(e) => setEditForm({...editForm, physicalExamination: e.target.value})}
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="General appearance, system findings..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Clinical Diagnosis</label>
            <input 
              value={editForm.diagnosis}
              onChange={(e) => setEditForm({...editForm, diagnosis: e.target.value})}
              type="text" 
              required
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="ICD-10 or Custom Diagnosis..."
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">BP (mmHg)</label>
              <input value={editForm.bp} onChange={(e) => setEditForm({...editForm, bp: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Pulse (bpm)</label>
              <input value={editForm.pulse} onChange={(e) => setEditForm({...editForm, pulse: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Temp (°F)</label>
              <input value={editForm.temp} onChange={(e) => setEditForm({...editForm, temp: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">SpO2 (%)</label>
              <input value={editForm.o2} onChange={(e) => setEditForm({...editForm, o2: e.target.value})} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Treatment / Advice Plan</label>
            <textarea 
              value={editForm.treatmentPlan}
              onChange={(e) => setEditForm({...editForm, treatmentPlan: e.target.value})}
              rows={3} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Treatment directions and follow-up plan..."
            ></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Clinical Notes</label>
            <textarea 
              value={editForm.clinicalNotes}
              onChange={(e) => setEditForm({...editForm, clinicalNotes: e.target.value})}
              rows={2} 
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" 
              placeholder="Additional clinical observations..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Update Consultation</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Recent Consultations</h3>
          <div className="flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search consultations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Patient Name</Th>
              <Th>Visit ID</Th>
              <Th>Date</Th>
              <Th>Diagnosis</Th>
              <Th>Physician</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit) => (
              <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Td className="font-semibold text-slate-700 dark:text-slate-350">{visit.patientName}</Td>
                <Td className="text-slate-500">#{visit.id}</Td>
                <Td>{visit.date} {visit.time}</Td>
                <Td>{visit.diagnosis}</Td>
                <Td>{visit.physician}</Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedVisit(visit)}
                      className="text-sky-500 hover:text-sky-655 font-semibold text-[12px]"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleEditClick(visit)}
                      className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[12px]"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(visit.id)}
                      className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[12px]"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filteredVisits.length === 0 && (
              <tr>
                <Td colSpan={6} className="text-center py-8 text-slate-500 text-[13px]">
                  No consultations found.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
