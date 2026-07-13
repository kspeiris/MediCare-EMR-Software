import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search, Printer, AlertTriangle } from 'lucide-react';
import { db, Prescription, Patient, Consultation } from '@/services/db';
import { useLocation } from 'react-router-dom';

export function Prescriptions() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => db.getPrescriptions());
  const patients = db.getPatients();
  const consultations = db.getConsultations();
  const doc = db.getDoctorProfile();

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedConsultationId, setSelectedConsultationId] = useState('');
  const [medName, setMedName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [frequency, setFrequency] = useState('Once a day');
  const [duration, setDuration] = useState('7 days');
  const [instructions, setInstructions] = useState('Take after meals');
  const [allergyWarning, setAllergyWarning] = useState('');

  // Selected prescription to print preview
  const [printPresc, setPrintPresc] = useState<Prescription | null>(null);

  // Check state passed from Patient Profile consultation flow
  useEffect(() => {
    if (location.state && (location.state as any).patientId) {
      const stateObj = location.state as any;
      setSelectedPatientId(stateObj.patientId);
      setSelectedConsultationId(stateObj.consultationId || '');
      setIsModalOpen(true);
    }
  }, [location.state]);

  // Check for patient allergies
  useEffect(() => {
    if (!selectedPatientId || !medName) {
      setAllergyWarning('');
      return;
    }
    const patientObj = patients.find(p => p.id === selectedPatientId);
    if (patientObj && patientObj.allergies) {
      const matched = patientObj.allergies.find(a => 
        medName.toLowerCase().includes(a.toLowerCase())
      );
      if (matched) {
        setAllergyWarning(`WARNING: Patient has a documented allergy to "${matched}"!`);
      } else {
        setAllergyWarning('');
      }
    }
  }, [selectedPatientId, medName, patients]);

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
    if (!selectedPatientId || !medName) return;

    const newPresc = db.addPrescription({
      consultationId: selectedConsultationId || 'CNS-NONE',
      patientId: selectedPatientId,
      date: new Date().toISOString().split('T')[0],
      medicines: [
        {
          name: medName,
          strength,
          dosage,
          frequency,
          duration,
          route: 'Oral',
          quantity: 10,
          instructions
        }
      ]
    });

    setPrescriptions(db.getPrescriptions());
    
    // Reset form
    setMedName('');
    setStrength('');
    setAllergyWarning('');
    setIsModalOpen(false);

    // Open print modal immediately
    setPrintPresc(newPresc);
  };

  const handlePrintAction = () => {
    window.print();
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

      {/* Prescription Print/Preview Modal */}
      <Modal isOpen={!!printPresc} onClose={() => setPrintPresc(null)} title="Prescription Print Preview">
        {printPresc && (
          <div className="space-y-6">
            <div className="p-6 border border-slate-300 rounded bg-white text-slate-950 font-sans print-container" id="printable-prescription">
              <div className="flex justify-between items-start border-b border-slate-350 pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{doc.clinicName}</h2>
                  <p className="text-[11px] text-slate-500 leading-tight">{doc.clinicAddress}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Phone: {doc.phone} | Email: {doc.email}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-md font-bold text-slate-800">{doc.name}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">{doc.specialization}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Reg: {doc.regNumber}</p>
                </div>
              </div>

              {/* Patient details */}
              {(() => {
                const patientObj = patients.find(p => p.id === printPresc.patientId);
                return patientObj ? (
                  <div className="grid grid-cols-3 gap-2 text-xs border-b border-slate-100 pb-3 mb-4">
                    <p><strong>Patient:</strong> {patientObj.firstName} {patientObj.lastName}</p>
                    <p><strong>Age/Gender:</strong> {new Date().getFullYear() - new Date(patientObj.dob).getFullYear()} / {patientObj.gender}</p>
                    <p className="text-right"><strong>Date:</strong> {printPresc.date}</p>
                  </div>
                ) : null;
              })()}

              {/* Rx Medicines List */}
              <div className="space-y-4 min-h-[160px]">
                <span className="text-lg font-serif italic font-bold text-slate-800 block">Rx</span>
                {printPresc.medicines.map((med, i) => (
                  <div key={i} className="pl-4">
                    <h4 className="text-sm font-bold text-slate-950">{med.name} {med.strength}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{med.dosage} - {med.frequency} for {med.duration} ({med.instructions})</p>
                  </div>
                ))}
              </div>

              {/* Footer Signature */}
              <div className="border-t border-slate-200 pt-4 mt-6 flex justify-between items-end">
                <p className="text-[10px] text-slate-400 font-medium">Powered by Medicare EMR system (Offline)</p>
                <div className="text-center w-40">
                  {doc.signature ? (
                    <img src={doc.signature} alt="Signature" className="h-10 mx-auto object-contain mb-1" />
                  ) : (
                    <div className="h-10 border-b border-slate-200 border-dashed mb-1"></div>
                  )}
                  <span className="text-[11px] font-bold text-slate-800 block leading-tight">{doc.name}</span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Authorized Signatory</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 no-print">
              <button onClick={() => setPrintPresc(null)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Close</button>
              <button onClick={handlePrintAction} className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 flex items-center gap-1">
                <Printer size={14} /> Print Rx
              </button>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Medication Name</label>
              <input 
                value={medName} 
                onChange={(e) => setMedName(e.target.value)} 
                type="text" 
                placeholder="e.g. Lisinopril" 
                required 
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Strength</label>
              <input 
                value={strength} 
                onChange={(e) => setStrength(e.target.value)} 
                type="text" 
                placeholder="e.g. 10mg" 
                required 
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" 
              />
            </div>
          </div>

          {allergyWarning && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded flex items-center gap-1.5">
              <AlertTriangle size={14} className="shrink-0" />
              {allergyWarning}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Dosage</label>
              <input value={dosage} onChange={(e) => setDosage(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none">
                <option value="Once a day">Once a day</option>
                <option value="Twice a day">Twice a day</option>
                <option value="Three times a day">Three times a day</option>
                <option value="PRN (As needed)">PRN (As needed)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Duration</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Instructions</label>
              <input value={instructions} onChange={(e) => setInstructions(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Generate Prescription</button>
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
                  <button 
                    onClick={() => setPrintPresc(prescription)} 
                    className="text-sky-500 hover:text-sky-655 font-semibold flex items-center gap-1 text-[12px]"
                  >
                    <Printer size={12} /> Print Preview
                  </button>
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

