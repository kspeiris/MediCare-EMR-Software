import { useState, useMemo } from 'react';
import { Table, Th, Td } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Search, PlusCircle, Printer, Edit2, Trash2, Download } from 'lucide-react';
import { db, MedicalCertificate, Patient } from '@/services/db';
import { CertificatePrintTemplate } from '@/components/print-templates/CertificatePrintTemplate';
import { generatePDF } from '@/components/print-templates/pdfExport';

export function Certificates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<MedicalCertificate | null>(null);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>(() => db.getCertificates());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const patients = db.getPatients();
  const doc = db.getDoctorProfile();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [restPeriod, setRestPeriod] = useState('3 Days');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [doctorRemarks, setDoctorRemarks] = useState('');

  const [editForm, setEditForm] = useState({
    patientId: '',
    diagnosis: '',
    restPeriod: '3 Days',
    issueDate: '',
    doctorRemarks: ''
  });

  const [printCert, setPrintCert] = useState<MedicalCertificate | null>(null);

  const enrichedCertificates = useMemo(() => {
    return certificates.map(c => {
      const patient = patients.find(p => p.id === c.patientId);
      return {
        ...c,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        doctorName: doc.name
      };
    });
  }, [certificates, patients, doc]);

  const filteredCertificates = useMemo(() => {
    return enrichedCertificates.filter(cert => 
      cert.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enrichedCertificates, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !diagnosis) return;

    const newCert = db.addCertificate({
      patientId: selectedPatientId,
      diagnosis,
      restPeriod,
      issueDate,
      doctorRemarks
    });

    setCertificates(db.getCertificates());
    
    setSelectedPatientId('');
    setDiagnosis('');
    setRestPeriod('3 Days');
    setDoctorRemarks('');
    setIsModalOpen(false);

    setPrintCert(newCert);
  };

  const handleEditClick = (cert: MedicalCertificate) => {
    setEditingCert(cert);
    setEditForm({
      patientId: cert.patientId,
      diagnosis: cert.diagnosis,
      restPeriod: cert.restPeriod,
      issueDate: cert.issueDate,
      doctorRemarks: cert.doctorRemarks || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert || !editForm.diagnosis) return;

    db.updateCertificate(editingCert.id, {
      patientId: editForm.patientId,
      diagnosis: editForm.diagnosis,
      restPeriod: editForm.restPeriod,
      issueDate: editForm.issueDate,
      doctorRemarks: editForm.doctorRemarks
    });

    setCertificates(db.getCertificates());
    setIsEditModalOpen(false);
    setEditingCert(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this medical certificate? This cannot be undone.")) {
      db.deleteCertificate(id);
      setCertificates(db.getCertificates());
    }
  };

  const handlePrintAction = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printCert) return;
    setIsGeneratingPDF(true);
    try {
      const patientObj = patients.find(p => p.id === printCert.patientId);
      const filename = `Certificate_${printCert.id}_${patientObj?.firstName || 'Patient'}_${patientObj?.lastName || ''}`;
      await generatePDF('printable-certificate', filename);
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
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Medical Certificates</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Generate and print official sick leave/rest medical certificates.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-sky-600 text-white px-3 py-1.5 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors flex items-center gap-1.5 font-semibold shadow-sm"
        >
          <PlusCircle size={14} />
          Issue Certificate
        </button>
      </div>

      <Modal isOpen={!!printCert} onClose={() => setPrintCert(null)} title="Medical Certificate Print Preview">
        {printCert && (
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
            <div id="printable-certificate" className="hidden">
              <CertificatePrintTemplate
                certificate={printCert}
                patient={patients.find(p => p.id === printCert.patientId)}
                doctor={doc}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Medical Certificate">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Patient</label>
            <select 
              value={selectedPatientId} 
              onChange={(e) => setSelectedPatientId(e.target.value)} 
              required
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none"
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Diagnosis / Reason</label>
            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="Diagnosis requiring rest period..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Rest Period (e.g. 3 Days)</label>
              <input value={restPeriod} onChange={(e) => setRestPeriod(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Date Issued</label>
              <input value={issueDate} onChange={(e) => setIssueDate(e.target.value)} type="date" className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Doctor's Remarks (Optional)</label>
            <textarea value={doctorRemarks} onChange={(e) => setDoctorRemarks(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none min-h-[80px]"></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 transition-colors">Generate Certificate</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Medical Certificate">
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Patient</label>
            <select 
              value={editForm.patientId} 
              onChange={(e) => setEditForm({...editForm, patientId: e.target.value})} 
              required
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none"
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Diagnosis / Reason</label>
            <input value={editForm.diagnosis} onChange={(e) => setEditForm({...editForm, diagnosis: e.target.value})} type="text" className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="Diagnosis requiring rest period..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Rest Period (e.g. 3 Days)</label>
              <input value={editForm.restPeriod} onChange={(e) => setEditForm({...editForm, restPeriod: e.target.value})} type="text" className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Date Issued</label>
              <input value={editForm.issueDate} onChange={(e) => setEditForm({...editForm, issueDate: e.target.value})} type="date" className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Doctor's Remarks (Optional)</label>
            <textarea value={editForm.doctorRemarks} onChange={(e) => setEditForm({...editForm, doctorRemarks: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none min-h-[80px]"></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 transition-colors">Update Certificate</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col no-print">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Recent Certificates</h3>
          <div className="flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search certificates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        
        <Table>
          <thead>
            <tr>
              <Th>Certificate No.</Th>
              <Th>Patient Name</Th>
              <Th>Diagnosis</Th>
              <Th>Rest Period</Th>
              <Th>Date Issued</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Td className="font-semibold text-slate-900 dark:text-slate-200">#{cert.id}</Td>
                  <Td className="text-slate-700 dark:text-slate-300">{cert.patientName}</Td>
                  <Td>{cert.diagnosis}</Td>
                  <Td>{cert.restPeriod}</Td>
                  <Td>{cert.issueDate}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setPrintCert(cert)} className="p-1 text-sky-500 hover:text-sky-700 transition-colors inline-flex items-center gap-1 text-xs font-semibold">
                        <Printer size={13} /> Print
                      </button>
                      <button onClick={() => handleEditClick(cert)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1 text-xs font-semibold">
                        <Edit2 size={13} /> Edit
                      </button>
                      <button onClick={() => handleDelete(cert.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors inline-flex items-center gap-1 text-xs font-semibold">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-slate-500">
                  No medical certificates found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
