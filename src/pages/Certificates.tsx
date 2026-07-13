import { useState, useMemo } from 'react';
import { Table, Th, Td } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Search, PlusCircle, Printer } from 'lucide-react';
import { db, MedicalCertificate, Patient } from '@/services/db';

export function Certificates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>(() => db.getCertificates());
  
  const patients = db.getPatients();
  const doc = db.getDoctorProfile();

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [restPeriod, setRestPeriod] = useState('3 Days');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [doctorRemarks, setDoctorRemarks] = useState('');

  // Certificate print preview
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
    
    // Reset Form
    setSelectedPatientId('');
    setDiagnosis('');
    setRestPeriod('3 Days');
    setDoctorRemarks('');
    setIsModalOpen(false);

    // Open print preview immediately
    setPrintCert(newCert);
  };

  const handlePrintAction = () => {
    window.print();
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

      {/* Print Preview Modal */}
      <Modal isOpen={!!printCert} onClose={() => setPrintCert(null)} title="Medical Certificate Print Preview">
        {printCert && (
          <div className="space-y-6">
            <div className="p-8 border border-slate-300 rounded bg-white text-slate-950 font-sans print-container text-center space-y-6" id="printable-certificate">
              <div className="border-b border-slate-350 pb-4 flex justify-between items-start text-left">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{doc.clinicName}</h2>
                  <p className="text-[11px] text-slate-500">{doc.clinicAddress}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-slate-800">{doc.name}</h3>
                  <p className="text-[9px] text-slate-400">Reg: {doc.regNumber}</p>
                </div>
              </div>

              <h1 className="text-2xl font-serif font-black uppercase tracking-widest text-slate-900 pt-4">Medical Certificate</h1>

              {(() => {
                const patientObj = patients.find(p => p.id === printCert.patientId);
                return patientObj ? (
                  <div className="space-y-6 text-sm text-left max-w-lg mx-auto pt-4 leading-loose">
                    <p>
                      This is to certify that I have professionally examined <strong>{patientObj.firstName} {patientObj.lastName}</strong>, 
                      age <strong>{new Date().getFullYear() - new Date(patientObj.dob).getFullYear()}</strong>, 
                      gender <strong>{patientObj.gender}</strong>, on date <strong>{printCert.issueDate}</strong>.
                    </p>
                    <p>
                      In my clinical opinion, the patient is diagnosed with <strong>{printCert.diagnosis}</strong> and requires 
                      a rest period of <strong>{printCert.restPeriod}</strong> for recovery.
                    </p>
                    {printCert.doctorRemarks && (
                      <p className="border-l-2 border-slate-200 pl-3 italic text-slate-600">
                        Remarks: {printCert.doctorRemarks}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}

              <div className="pt-10 flex justify-between items-end text-left max-w-lg mx-auto">
                <div>
                  <p className="text-[11px] text-slate-400">Issue Date: {printCert.issueDate}</p>
                  <p className="text-[11px] text-slate-450">Certificate ID: {printCert.id}</p>
                </div>
                <div className="text-center w-40">
                  {doc.signature ? (
                    <img src={doc.signature} alt="Signature" className="h-10 mx-auto object-contain mb-1" />
                  ) : (
                    <div className="h-10 border-b border-slate-200 border-dashed mb-1"></div>
                  )}
                  <span className="text-[11px] font-bold text-slate-850 block leading-tight">{doc.name}</span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Registered Medical Officer</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 no-print">
              <button onClick={() => setPrintCert(null)} className="px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400">Close</button>
              <button onClick={handlePrintAction} className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] font-semibold hover:bg-sky-600 flex items-center gap-1">
                <Printer size={14} /> Print Certificate
              </button>
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
                    <button onClick={() => setPrintCert(cert)} className="p-1 text-sky-550 hover:text-sky-700 transition-colors inline-flex items-center gap-1 text-xs font-semibold">
                      <Printer size={13} /> Print View
                    </button>
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

