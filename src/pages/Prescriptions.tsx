import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search, Printer, AlertTriangle, Plus, Trash2, Edit2, Download } from 'lucide-react';
import { db, Prescription, Patient, Consultation, MedicineItem } from '@/services/db';
import { useLocation } from 'react-router-dom';
import { PrescriptionPrintTemplate } from '@/components/print-templates/PrescriptionPrintTemplate';
import { generatePDF } from '@/components/print-templates/pdfExport';

export function Prescriptions() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => db.getPrescriptions());
  const patients = db.getPatients();
  const consultations = db.getConsultations();
  const doc = db.getDoctorProfile();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedConsultationId, setSelectedConsultationId] = useState('');
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { name: '', strength: '', dosage: '1 tablet', frequency: 'Once a day', duration: '7 days', route: 'Oral', quantity: 10, instructions: 'Take after meals' }
  ]);
  const [allergyWarning, setAllergyWarning] = useState('');

  const [editMedicines, setEditMedicines] = useState<MedicineItem[]>([]);

  const [printPresc, setPrintPresc] = useState<Prescription | null>(null);

  useEffect(() => {
    if (location.state && (location.state as any).patientId) {
      const stateObj = location.state as any;
      setSelectedPatientId(stateObj.patientId);
      setSelectedConsultationId(stateObj.consultationId || '');
      setIsModalOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!selectedPatientId) {
      setAllergyWarning('');
      return;
    }
    const patientObj = patients.find(p => p.id === selectedPatientId);
    if (patientObj && patientObj.allergies) {
      const matched = medicines.find(m => {
        if (!m.name) return false;
        return patientObj.allergies.some(a => m.name.toLowerCase().includes(a.toLowerCase()));
      });
      if (matched) {
        const matchedAllergy = patientObj.allergies.find(a => matched!.name.toLowerCase().includes(a.toLowerCase()));
        setAllergyWarning(`WARNING: Patient has a documented allergy to "${matchedAllergy}" (${matched.name})!`);
      } else {
        setAllergyWarning('');
      }
    }
  }, [selectedPatientId, medicines, patients]);

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', strength: '', dosage: '1 tablet', frequency: 'Once a day', duration: '7 days', route: 'Oral', quantity: 10, instructions: 'Take after meals' }]);
  };

  const removeMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineItem, value: string | number) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const addEditMedicineRow = () => {
    setEditMedicines([...editMedicines, { name: '', strength: '', dosage: '1 tablet', frequency: 'Once a day', duration: '7 days', route: 'Oral', quantity: 10, instructions: 'Take after meals' }]);
  };

  const removeEditMedicineRow = (index: number) => {
    setEditMedicines(editMedicines.filter((_, i) => i !== index));
  };

  const updateEditMedicine = (index: number, field: keyof MedicineItem, value: string | number) => {
    const updated = [...editMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setEditMedicines(updated);
  };

  const filteredPrescriptions = useMemo(() => {
    const list = prescriptions.map(p => {
      const patObj = patients.find(pat => pat.id === p.patientId);
      return {
        ...p,
        patientName: patObj ? `${patObj.firstName} ${patObj.lastName}` : 'Unknown Patient',
        medSummary: p.medicines.map(m => `${m.name} ${m.strength}`).join(', ')
      };
    });

    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(p => 
      p.patientName.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query) ||
      p.medSummary.toLowerCase().includes(query)
    );
  }, [prescriptions, patients, searchQuery]);

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || medicines.length === 0 || !medicines[0].name) return;

    const validMedicines = medicines.filter(m => m.name.trim() !== '');
    if (validMedicines.length === 0) return;

    const newPresc = db.addPrescription({
      consultationId: selectedConsultationId || 'CNS-NONE',
      patientId: selectedPatientId,
      date: new Date().toISOString().split('T')[0],
      medicines: validMedicines.map(m => ({
        name: m.name,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        route: m.route,
        quantity: Number(m.quantity) || 10,
        instructions: m.instructions
      }))
    });

    setPrescriptions(db.getPrescriptions());
    
    setMedicines([{ name: '', strength: '', dosage: '1 tablet', frequency: 'Once a day', duration: '7 days', route: 'Oral', quantity: 10, instructions: 'Take after meals' }]);
    setAllergyWarning('');
    setIsModalOpen(false);

    setPrintPresc(newPresc);
  };

  const handleEditClick = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setEditMedicines(prescription.medicines.length > 0 ? [...prescription.medicines] : [{ name: '', strength: '', dosage: '1 tablet', frequency: 'Once a day', duration: '7 days', route: 'Oral', quantity: 10, instructions: 'Take after meals' }]);
    setSelectedPatientId(prescription.patientId);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrescription || editMedicines.length === 0) return;

    const validMedicines = editMedicines.filter(m => m.name.trim() !== '');
    if (validMedicines.length === 0) return;

    db.updatePrescription(editingPrescription.id, {
      medicines: validMedicines.map(m => ({
        name: m.name,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        route: m.route,
        quantity: Number(m.quantity) || 10,
        instructions: m.instructions
      }))
    });

    setPrescriptions(db.getPrescriptions());
    setIsEditModalOpen(false);
    setEditingPrescription(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this prescription? This cannot be undone.")) {
      db.deletePrescription(id);
      setPrescriptions(db.getPrescriptions());
    }
  };

  const handlePrintAction = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printPresc) return;
    setIsGeneratingPDF(true);
    try {
      const patientObj = patients.find(p => p.id === printPresc.patientId);
      const filename = `Prescription_${printPresc.id}_${patientObj?.firstName || 'Patient'}_${patientObj?.lastName || ''}`;
      await generatePDF('printable-prescription', filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Prescriptions</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Issue and print official electronic prescriptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors"
        >
          + New Prescription
        </button>
      </div>

      <Modal isOpen={!!printPresc} onClose={() => setPrintPresc(null)} title="Prescription Print Preview">
        {printPresc && (
          <div className="space-y-6">
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
            <div id="printable-prescription" className="hidden">
              <PrescriptionPrintTemplate
                prescription={printPresc}
                patient={patients.find(p => p.id === printPresc.patientId)}
                doctor={doc}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New E-Prescription">
        <form className="space-y-4" onSubmit={handleCreatePrescription}>
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase">Medications</label>
              <button type="button" onClick={addMedicineRow} className="text-[11px] text-sky-500 hover:text-sky-700 font-semibold flex items-center gap-1">
                <Plus size={12} /> Add Medicine
              </button>
            </div>
            
            {medicines.map((med, index) => (
              <div key={index} className="p-3 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Medicine {index + 1}</span>
                  {medicines.length > 1 && (
                    <button type="button" onClick={() => removeMedicineRow(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Name</label>
                    <input 
                      value={med.name} 
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)} 
                      type="text" 
                      placeholder="e.g. Lisinopril" 
                      required 
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Strength</label>
                    <input 
                      value={med.strength} 
                      onChange={(e) => updateMedicine(index, 'strength', e.target.value)} 
                      type="text" 
                      placeholder="e.g. 10mg" 
                      required 
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Dosage</label>
                    <input value={med.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Frequency</label>
                    <select value={med.frequency} onChange={(e) => updateMedicine(index, 'frequency', e.target.value)} className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      <option value="Once a day">Once a day</option>
                      <option value="Twice a day">Twice a day</option>
                      <option value="Three times a day">Three times a day</option>
                      <option value="PRN (As needed)">PRN (As needed)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Duration</label>
                    <input value={med.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Route</label>
                    <select value={med.route} onChange={(e) => updateMedicine(index, 'route', e.target.value)} className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      <option value="Oral">Oral</option>
                      <option value="Topical">Topical</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Intravenous">Intravenous</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Subcutaneous">Subcutaneous</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Quantity</label>
                    <input value={med.quantity} onChange={(e) => updateMedicine(index, 'quantity', e.target.value)} type="number" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Instructions</label>
                    <input value={med.instructions} onChange={(e) => updateMedicine(index, 'instructions', e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allergyWarning && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded flex items-center gap-1.5">
              <AlertTriangle size={14} className="shrink-0" />
              {allergyWarning}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Generate Prescription</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Prescription">
        <form className="space-y-4" onSubmit={handleEditSubmit}>
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase">Medicines</label>
              <button type="button" onClick={addEditMedicineRow} className="text-[11px] text-sky-500 hover:text-sky-700 font-semibold flex items-center gap-1">
                <Plus size={12} /> Add Medicine
              </button>
            </div>
            
            {editMedicines.map((med, index) => (
              <div key={index} className="p-3 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Medicine {index + 1}</span>
                  {editMedicines.length > 1 && (
                    <button type="button" onClick={() => removeEditMedicineRow(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Name</label>
                    <input 
                      value={med.name} 
                      onChange={(e) => updateEditMedicine(index, 'name', e.target.value)} 
                      type="text" 
                      required
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Strength</label>
                    <input 
                      value={med.strength} 
                      onChange={(e) => updateEditMedicine(index, 'strength', e.target.value)} 
                      type="text" 
                      required
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Dosage</label>
                    <input value={med.dosage} onChange={(e) => updateEditMedicine(index, 'dosage', e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Frequency</label>
                    <select value={med.frequency} onChange={(e) => updateEditMedicine(index, 'frequency', e.target.value)} className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      <option value="Once a day">Once a day</option>
                      <option value="Twice a day">Twice a day</option>
                      <option value="Three times a day">Three times a day</option>
                      <option value="PRN (As needed)">PRN (As needed)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Duration</label>
                    <input value={med.duration} onChange={(e) => updateEditMedicine(index, 'duration', e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Route</label>
                    <select value={med.route} onChange={(e) => updateEditMedicine(index, 'route', e.target.value)} className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      <option value="Oral">Oral</option>
                      <option value="Topical">Topical</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Intravenous">Intravenous</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Subcutaneous">Subcutaneous</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Quantity</label>
                    <input value={med.quantity} onChange={(e) => updateEditMedicine(index, 'quantity', e.target.value)} type="number" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Instructions</label>
                    <input value={med.instructions} onChange={(e) => updateEditMedicine(index, 'instructions', e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Update Prescription</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col no-print">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white font-sans">Active Prescriptions</h3>
          <div className="flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search prescriptions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Prescription ID</Th>
              <Th>Patient Name</Th>
              <Th>Medications</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.map((prescription) => (
              <tr key={prescription.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Td className="font-semibold text-slate-700 dark:text-slate-350">#{prescription.id}</Td>
                <Td>{prescription.patientName}</Td>
                <Td>{prescription.medSummary}</Td>
                <Td>{prescription.date}</Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setPrintPresc(prescription)} 
                      className="text-sky-500 hover:text-sky-655 font-semibold flex items-center gap-1 text-[12px]"
                    >
                      <Printer size={12} /> Print
                    </button>
                    <button 
                      onClick={() => handleEditClick(prescription)}
                      className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[12px]"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(prescription.id)}
                      className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[12px]"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filteredPrescriptions.length === 0 && (
              <tr>
                <Td colSpan={5} className="text-center py-8 text-slate-500 text-[13px]">
                  No prescriptions found.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
