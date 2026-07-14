import { Link, useParams, useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, AlertTriangle, Printer, PlusCircle, Download, FileBadge, Trash2, Calendar, FileText, User, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { db, Patient, Consultation, MedicalDocument, MedicalCertificate, Prescription } from '@/services/db';
import { PatientSummaryPrintTemplate } from '@/components/print-templates/PatientSummaryPrintTemplate';
import { generatePDF } from '@/components/print-templates/pdfExport';

export function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = db.getPatientById(id || '');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isEditDocOpen, setIsEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<MedicalDocument | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Laboratory Reports');
  const [docFileBase64, setDocFileBase64] = useState('');

  const [editDocName, setEditDocName] = useState('');
  const [editDocType, setEditDocType] = useState('Laboratory Reports');

  // Edit Patient Form State
  const [firstName, setFirstName] = useState(patient?.firstName || '');
  const [lastName, setLastName] = useState(patient?.lastName || '');
  const [phone, setPhone] = useState(patient?.phone || '');
  const [email, setEmail] = useState(patient?.email || '');
  const [address, setAddress] = useState(patient?.address || '');
  const [nic, setNic] = useState(patient?.nic || '');
  const [bloodGroup, setBloodGroup] = useState(patient?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(patient?.allergies ? patient?.allergies.join(', ') : '');
  const [chronicDiseases, setChronicDiseases] = useState(patient?.chronicDiseases || '');
  const [currentMedications, setCurrentMedications] = useState(patient?.currentMedications || '');
  const [previousSurgeries, setPreviousSurgeries] = useState(patient?.previousSurgeries || '');
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState(patient?.familyMedicalHistory || '');
  const [smokingStatus, setSmokingStatus] = useState(patient?.smokingStatus || 'Never');
  const [alcoholConsumption, setAlcoholConsumption] = useState(patient?.alcoholConsumption || 'Never');
  const [height, setHeight] = useState(String(patient?.height || 175));
  const [weight, setWeight] = useState(String(patient?.weight || 70));

  // Vitals for new consultation modal
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [o2, setO2] = useState('98');

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return 0;
    return Number((w / ((h / 100) * (h / 100))).toFixed(1));
  }, [weight, height]);

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-red-500">Patient not found</h2>
        <Link to="/patients" className="text-sky-500 hover:underline mt-2 inline-block">Back to Patient list</Link>
      </div>
    );
  }

  // Get dynamic data
  const consultations = db.getConsultationsByPatient(patient.id);
  const documents = db.getDocumentsByPatient(patient.id);
  const certificates = db.getCertificates().filter(c => c.patientId === patient.id);
  const prescriptions = db.getPrescriptionsByPatient(patient.id);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allergyList = allergies.split(',').map(s => s.trim()).filter(Boolean);
    
    const updated = {
      firstName,
      lastName,
      phone,
      email,
      address,
      nic,
      bloodGroup,
      allergies: allergyList,
      chronicDiseases,
      currentMedications,
      previousSurgeries,
      familyMedicalHistory,
      smokingStatus,
      alcoholConsumption,
      height: parseFloat(height) || 0,
      weight: parseFloat(weight) || 0,
      bmi: bmi || undefined
    };

    db.updatePatient(patient.id, updated);
    setIsEditModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docFileBase64) return;
    
    db.addDocument({
      patientId: patient.id,
      name: docName,
      type: docType,
      fileData: docFileBase64
    });

    setDocName('');
    setDocFileBase64('');
    setIsUploadDocOpen(false);
  };

  const handleAddConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCons = db.addConsultation({
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chiefComplaint,
      historyOfPresentIllness: '',
      physicalExamination: '',
      diagnosis,
      treatmentPlan,
      clinicalNotes: '',
      vitals: {
        height: patient.height,
        weight: patient.weight,
        bmi: patient.bmi || 0,
        bloodPressure: bp,
        pulseRate: parseInt(pulse) || 72,
        respiratoryRate: 16,
        temperature: parseFloat(temp) || 98.6,
        oxygenSaturation: parseInt(o2) || 98,
        bloodSugar: 90
      }
    });

    // Automatically navigate to prescribe medicine for this consultation
    navigate('/prescriptions', { state: { consultationId: newCons.id, patientId: patient.id } });
  };

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm("Delete this document?")) {
      db.deleteDocument(docId);
    }
  };

  const handleEditDocClick = (doc: MedicalDocument) => {
    setEditingDoc(doc);
    setEditDocName(doc.name);
    setEditDocType(doc.type);
    setIsEditDocOpen(true);
  };

  const handleEditDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    db.updateDocument(editingDoc.id, {
      name: editDocName,
      type: editDocType
    });

    setIsEditDocOpen(false);
    setEditingDoc(null);
  };

  const printSummaryCard = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const consultations = db.getConsultationsByPatient(patient.id);
      const prescriptions = db.getPrescriptionsByPatient(patient.id);
      const certificates = db.getCertificates().filter(c => c.patientId === patient.id);
      const filename = `PatientSummary_${patient.firstName}_${patient.lastName}_${patient.id}`;
      await generatePDF('printable-patient-summary', filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <Link to="/patients" className="hover:text-sky-500">Patients</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200">{patient.firstName} {patient.lastName}</span>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 flex items-start justify-between print-container">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-sky-700 dark:text-sky-400 text-[22px]">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-none">{patient.firstName} {patient.lastName}</h1>
              <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">ID: {patient.id}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{calculateAge(patient.dob)} yrs ({patient.gender})</span>
              <span>Blood: {patient.bloodGroup}</span>
              <span>NIC: {patient.nic || 'N/A'}</span>
              <span>Phone: {patient.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <button 
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 text-slate-700 px-3 py-1.5 rounded text-[11px] hover:bg-slate-50 transition-colors font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download size={14} />
            {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
          </button>
          <button 
            onClick={printSummaryCard}
            className="bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 text-slate-700 px-3 py-1.5 rounded text-[11px] hover:bg-slate-50 transition-colors font-semibold flex items-center gap-1.5"
          >
            <Printer size={14} />
            Print Summary
          </button>
          <button 
            onClick={() => setIsConsultationModalOpen(true)}
            className="bg-sky-500 text-white px-3 py-1.5 rounded text-[11px] hover:bg-sky-600 transition-colors font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle size={14} />
            Start Consultation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (Medical History, Vitals, Documents) */}
        <div className="lg:col-span-1 space-y-4 no-print">
          {/* Medical History */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">Medical Info Summary</h3>
              <button onClick={() => setIsEditModalOpen(true)} className="text-sky-500 hover:text-sky-700 text-[11px] font-semibold">Edit History</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Known Allergies</div>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="critical"><AlertTriangle size={10} className="inline mr-1"/> {allergy}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs font-medium">No allergies reported.</span>
                )}
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Chronic Conditions</div>
                <p className="text-slate-700 dark:text-slate-350 text-xs font-medium leading-relaxed">{patient.chronicDiseases || 'None recorded'}</p>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Habits</div>
                <div className="text-xs text-slate-700 dark:text-slate-350 flex gap-4 font-semibold">
                  <span>Smoking: <span className="font-normal">{patient.smokingStatus}</span></span>
                  <span>Alcohol: <span className="font-normal">{patient.alcoholConsumption}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals History */}
          <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 p-4 rounded-md">
            <h3 className="text-[13px] font-bold text-sky-900 dark:text-sky-400 uppercase tracking-wide mb-3">Vitals History</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-sky-700 dark:text-sky-400 block uppercase font-medium">Height</span>
                <span className="text-lg font-bold text-sky-950 dark:text-sky-200">{patient.height} <span className="text-[10px] font-normal">cm</span></span>
              </div>
              <div>
                <span className="text-[10px] text-sky-700 dark:text-sky-400 block uppercase font-medium">Weight</span>
                <span className="text-lg font-bold text-sky-950 dark:text-sky-200">{patient.weight} <span className="text-[10px] font-normal">kg</span></span>
              </div>
              <div className="col-span-2 border-t border-sky-100 dark:border-sky-900/50 pt-2">
                <span className="text-[10px] text-sky-700 dark:text-sky-400 block uppercase font-medium">Body Mass Index (BMI)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-sky-950 dark:text-sky-200">{patient.bmi || 'N/A'}</span>
                  <Badge variant={patient.bmi && patient.bmi > 25 ? 'warning' : 'default'}>
                    {patient.bmi && patient.bmi < 18.5 ? 'Underweight' : patient.bmi && patient.bmi < 25 ? 'Normal' : 'Overweight'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Upload Section */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">Lab & Imaging Files</h3>
              <button onClick={() => setIsUploadDocOpen(true)} className="text-sky-500 hover:text-sky-700 text-[11px] font-semibold">+ Upload</button>
            </div>
            <div className="space-y-2">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                    <div>
                      <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{doc.name}</div>
                      <div className="text-[10px] text-slate-400">{doc.type} • {doc.uploadDate}</div>
                    </div>
                     <div className="flex items-center gap-2">
                       <a href={doc.fileData} download={doc.name} className="text-sky-500 hover:text-sky-700 p-1"><Download size={13} /></a>
                       <button onClick={() => handleEditDocClick(doc)} className="text-slate-400 hover:text-slate-600 p-1"><Edit2 size={13} /></button>
                       <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                     </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-xs block py-2">No uploaded reports.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Consultation History / Certificates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4">Consultation Logs</h3>
            <div className="space-y-5">
              {consultations.length > 0 ? (
                consultations.map((c) => {
                  const presc = prescriptions.find(p => p.consultationId === c.id);
                  return (
                    <div key={c.id} className="border-l-2 border-sky-500 pl-4 py-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{c.chiefComplaint}</h4>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Calendar size={12}/> {c.date} at {c.time}</span>
                        </div>
                        <Badge variant="default">CNS-ID: {c.id}</Badge>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded text-xs space-y-2">
                        <p><strong>Diagnosis:</strong> {c.diagnosis || 'None'}</p>
                        <p><strong>Plan/Notes:</strong> {c.treatmentPlan || 'None'}</p>
                        {c.vitals && (
                          <p className="text-[11px] text-slate-500">
                            <strong>Vitals:</strong> BP: {c.vitals.bloodPressure} | Temp: {c.vitals.temperature}°F | Pulse: {c.vitals.pulseRate}bpm | SpO2: {c.vitals.oxygenSaturation}%
                          </p>
                        )}
                        {presc && presc.medicines && presc.medicines.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span className="font-semibold block mb-1">Prescribed Medications:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                              {presc.medicines.map((m, i) => (
                                <li key={i}>{m.name} {m.strength} - {m.frequency} for {m.duration} ({m.instructions})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                  No consultation records yet.
                </div>
              )}
            </div>
          </div>

          {/* Medical Certificates Issued */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Issued Medical Certificates</h3>
            <div className="space-y-3">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div key={cert.id} className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-slate-850 dark:text-slate-150">Rest: {cert.restPeriod}</div>
                      <div className="text-[11px] text-slate-500">Diagnosis: {cert.diagnosis} • Issued {cert.issueDate}</div>
                    </div>
                    <Badge variant="warning">{cert.id}</Badge>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-xs">No medical certificates issued yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Patient Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">NIC</label>
              <input value={nic} onChange={(e) => setNic(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Blood Group</label>
              <input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Height (cm)</label>
              <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Weight (kg)</label>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Allergies (comma separated)</label>
            <input value={allergies} onChange={(e) => setAllergies(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Chronic conditions</label>
            <input value={chronicDiseases} onChange={(e) => setChronicDiseases(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Medications</label>
            <input value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-655 font-semibold">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Start Consultation Modal */}
      <Modal isOpen={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} title="New Consultation Record">
        <form onSubmit={handleAddConsultationSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Chief Complaint</label>
            <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} required rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" placeholder="Primary issue that patient reports..."></textarea>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Clinical Diagnosis</label>
            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" placeholder="ICD-10 or Custom Diagnosis..." />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">BP (mmHg)</label>
              <input value={bp} onChange={(e) => setBp(e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Pulse (bpm)</label>
              <input value={pulse} onChange={(e) => setPulse(e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Temp (°F)</label>
              <input value={temp} onChange={(e) => setTemp(e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-0.5">SpO2 (%)</label>
              <input value={o2} onChange={(e) => setO2(e.target.value)} type="text" className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Treatment / Advice Plan</label>
            <textarea value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} rows={3} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none" placeholder="Treatment directions and follow-up plan..."></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsConsultationModalOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Save & Prescribe</button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadDocOpen} onClose={() => setIsUploadDocOpen(false)} title="Upload Medical Document">
        <form onSubmit={handleUploadDoc} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Document Title / Name</label>
            <input value={docName} onChange={(e) => setDocName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] outline-none text-slate-900 dark:text-slate-100" placeholder="e.g. Blood Report Oct 2025" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Document Category</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] outline-none text-slate-900 dark:text-slate-100">
              <option value="Laboratory Reports">Laboratory Reports</option>
              <option value="X-ray Reports">X-ray Reports</option>
              <option value="MRI Reports">MRI/CT Scan Reports</option>
              <option value="ECG Reports">ECG Reports</option>
              <option value="Ultrasound Reports">Ultrasound Reports</option>
              <option value="Other Documents">Other Documents</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Select File</label>
            <input type="file" onChange={handleFileChange} required className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-sky-50 dark:file:bg-sky-950 file:text-sky-700 dark:file:text-sky-400 hover:file:bg-sky-100" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsUploadDocOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-650 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Upload File</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditDocOpen} onClose={() => setIsEditDocOpen(false)} title="Edit Document">
        <form onSubmit={handleEditDocSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Document Title / Name</label>
            <input value={editDocName} onChange={(e) => setEditDocName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] outline-none text-slate-900 dark:text-slate-100" placeholder="e.g. Blood Report Oct 2025" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Document Category</label>
            <select value={editDocType} onChange={(e) => setEditDocType(e.target.value)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] outline-none text-slate-900 dark:text-slate-100">
              <option value="Laboratory Reports">Laboratory Reports</option>
              <option value="X-ray Reports">X-ray Reports</option>
              <option value="MRI Reports">MRI/CT Scan Reports</option>
              <option value="ECG Reports">ECG Reports</option>
              <option value="Ultrasound Reports">Ultrasound Reports</option>
              <option value="Other Documents">Other Documents</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsUploadDocOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-650 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Upload File</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditDocOpen} onClose={() => setIsEditDocOpen(false)} title="Edit Document">
        <form onSubmit={handleEditDocSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Document Title / Name</label>
            <input value={editDocName} onChange={(e) => setEditDocName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] outline-none text-slate-900 dark:text-slate-100" placeholder="e.g. Blood Report Oct 2025" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Document Category</label>
            <select value={editDocType} onChange={(e) => setEditDocType(e.target.value)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] outline-none text-slate-900 dark:text-slate-100">
              <option value="Laboratory Reports">Laboratory Reports</option>
              <option value="X-ray Reports">X-ray Reports</option>
              <option value="MRI Reports">MRI/CT Scan Reports</option>
              <option value="ECG Reports">ECG Reports</option>
              <option value="Ultrasound Reports">Ultrasound Reports</option>
              <option value="Other Documents">Other Documents</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditDocOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Save Changes</button>
          </div>
        </form>
      </Modal>

      <div id="printable-patient-summary" className="hidden">
        <PatientSummaryPrintTemplate
          patient={patient}
          consultations={db.getConsultationsByPatient(patient.id)}
          prescriptions={db.getPrescriptionsByPatient(patient.id)}
          certificates={db.getCertificates().filter(c => c.patientId === patient.id)}
          doctor={db.getDoctorProfile()}
        />
      </div>
    </div>
  );
}
