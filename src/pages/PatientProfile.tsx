import { Link, useParams, useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, AlertTriangle, Printer, PlusCircle, Download, FileBadge, Trash2, Calendar, FileText, User, Edit2, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo, useEffect } from 'react';
import { getLocalDate } from '@/lib/dates';
import { Modal } from '@/components/ui/Modal';
import { db, Patient, Consultation, MedicalDocument, MedicalCertificate, Prescription, validateVitals, getDoctorProfileSync, Referral } from '@/services/db';
import { PatientSummaryPrintTemplate } from '@/components/print-templates/PatientSummaryPrintTemplate';
import { generatePDF } from '@/components/print-templates/pdfExport';
import { onDbChange } from '@/services/db';
import { ConditionHistory } from '@/components/patient/ConditionHistory';
import { AttachmentViewer } from '@/components/patient/AttachmentViewer';
import { AllergyAlerts } from '@/components/patient/AllergyAlerts';
import { TimelineView, buildTimeline } from '@/components/patient/TimelineView';
import { VitalsChart } from '@/components/patient/VitalsChart';

export function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(() => db.getPatientByIdSync(id || '') || null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const loadData = () => {
    if (!id) return;
    db.getPatientById(id).then(p => { if (p) setPatient(p); });
    db.getConsultationsByPatient(id).then(setConsultations);
    db.getDocumentsByPatient(id).then(setDocuments);
    db.getCertificates().then(certs => setCertificates(certs.filter(c => c.patientId === id)));
    db.getPrescriptionsByPatient(id).then(setPrescriptions);
    db.getReferralsByPatient(id).then(setReferrals);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub1 = onDbChange('patients:changed', loadData);
    const unsub2 = onDbChange('consultations:changed', loadData);
    const unsub3 = onDbChange('documents:changed', loadData);
    const unsub4 = onDbChange('certificates:changed', loadData);
    const unsub5 = onDbChange('prescriptions:changed', loadData);
    const unsub6 = onDbChange('referrals:changed', loadData);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); };
  }, [id]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isEditDocOpen, setIsEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<MedicalDocument | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'consultations' | 'certificates'>('timeline');
  
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
  const [allergies, setAllergies] = useState(Array.isArray(patient?.allergies) ? patient!.allergies.join(', ') : (typeof patient?.allergies === 'string' ? patient.allergies : ''));
  const [chronicDiseases, setChronicDiseases] = useState(patient?.chronicDiseases || '');
  const [currentMedications, setCurrentMedications] = useState(patient?.currentMedications || '');
  const [previousSurgeries, setPreviousSurgeries] = useState(patient?.previousSurgeries || '');
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState(patient?.familyMedicalHistory || '');
  const [smokingStatus, setSmokingStatus] = useState(patient?.smokingStatus || 'Never');
  const [alcoholConsumption, setAlcoholConsumption] = useState(patient?.alcoholConsumption || 'Never');
  const [height, setHeight] = useState(String(patient?.height || 175));
  const [weight, setWeight] = useState(String(patient?.weight || 70));

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName || '');
      setLastName(patient.lastName || '');
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      setAddress(patient.address || '');
      setNic(patient.nic || '');
      setBloodGroup(patient.bloodGroup || 'O+');
      setAllergies(Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (typeof patient.allergies === 'string' ? patient.allergies : ''));
      setChronicDiseases(patient.chronicDiseases || '');
      setCurrentMedications(patient.currentMedications || '');
      setPreviousSurgeries(patient.previousSurgeries || '');
      setFamilyMedicalHistory(patient.familyMedicalHistory || '');
      setSmokingStatus(patient.smokingStatus || 'Never');
      setAlcoholConsumption(patient.alcoholConsumption || 'Never');
      setHeight(String(patient.height || 175));
      setWeight(String(patient.weight || 70));
    }
  }, [patient]);

  // Vitals for new consultation modal
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [o2, setO2] = useState('98');
  const [vitalsError, setVitalsError] = useState('');

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
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

  const handleEditSubmit = async (e: React.FormEvent) => {
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

    await db.updatePatient(patient.id, updated);
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

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docFileBase64) return;
    
    await db.addDocument({
      patientId: patient.id,
      name: docName,
      type: docType,
      fileData: docFileBase64
    });

    setDocName('');
    setDocFileBase64('');
    setIsUploadDocOpen(false);
  };

  const handleAddConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vitalsErr = validateVitals(bp, pulse, temp, o2);
    if (vitalsErr) {
      setVitalsError(vitalsErr);
      return;
    }
    setVitalsError('');

    const newCons = await db.addConsultation({
      patientId: patient.id,
      date: getLocalDate(),
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
        pulseRate: parseInt(pulse) || 0,
        respiratoryRate: parseInt(String(16)) || 0,
        temperature: parseFloat(temp) || 0,
        oxygenSaturation: parseInt(o2) || 0,
        bloodSugar: parseInt(String(90)) || 0
      }
    });

    navigate('/prescriptions', { state: { consultationId: newCons.id, patientId: patient.id } });
  };

  const handleDeleteDoc = async (docId: string) => {
    if (window.confirm("Delete this document?")) {
      await db.deleteDocument(docId);
    }
  };

  const handleEditDocClick = (doc: MedicalDocument) => {
    setEditingDoc(doc);
    setEditDocName(doc.name);
    setEditDocType(doc.type);
    setIsEditDocOpen(true);
  };

  const handleEditDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    await db.updateDocument(editingDoc.id, {
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
      const filename = `PatientSummary_${patient.firstName}_${patient.lastName}_${patient.id}`;
      await generatePDF('printable-patient-summary', filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const timelineEvents = useMemo(() => 
    buildTimeline(consultations, prescriptions, certificates, documents, referrals),
    [consultations, prescriptions, certificates, documents, referrals]
  );

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!patient || !id) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Str = reader.result as string;
        try {
          await db.updatePatient(id, { profilePic: base64Str });
          setPatient({ ...patient, profilePic: base64Str });
        } catch (err) {
          console.error('Failed to update profile picture:', err);
          alert('Failed to save profile picture.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!patient || !id) return;
    if (window.confirm("Remove profile picture?")) {
      try {
        await db.updatePatient(id, { profilePic: '' });
        setPatient({ ...patient, profilePic: undefined });
      } catch (err) {
        console.error('Failed to remove profile picture:', err);
        alert('Failed to remove profile picture.');
      }
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
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-sky-700 dark:text-sky-400 text-[22px] relative group">
              {patient.profilePic ? (
                <img src={patient.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{patient.firstName[0]}{patient.lastName[0]}</span>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="text-white" size={16} />
                <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
              </label>
            </div>
            {patient.profilePic && (
              <button 
                onClick={handleRemoveProfilePic} 
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md no-print" 
                title="Remove Photo"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-none">{patient.firstName} {patient.lastName}</h1>
              <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">ID: {patient.id}</span>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column - Quick Insight Cards */}
        <div className="xl:col-span-1 space-y-4 no-print">
          {/* Allergy & Interaction Alerts */}
          <AllergyAlerts
            allergies={patient.allergies || []}
            currentMedications={patient.chronicDiseases || ''}
            consultations={consultations.map(c => ({ diagnosis: c.diagnosis, medicines: prescriptions.find(p => p.consultationId === c.id)?.medicines || [] }))}
          />

          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Visits</span>
                <span className="text-[20px] font-bold text-sky-600 dark:text-sky-300">{consultations.length}</span>
                <span className="text-[11px] text-slate-500">Total consultations</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Prescriptions</span>
                <span className="text-[20px] font-bold text-emerald-600 dark:text-emerald-300">{prescriptions.length}</span>
                <span className="text-[11px] text-slate-500">Total issued</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Documents</span>
                <span className="text-[20px] font-bold text-amber-600 dark:text-amber-300">{documents.length}</span>
                <span className="text-[11px] text-slate-500">Uploaded</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Referrals</span>
                <span className="text-[20px] font-bold text-indigo-600 dark:text-indigo-300">{referrals.length}</span>
                <span className="text-[11px] text-slate-500">Total</span>
              </div>
            </div>
          </div>

          {/* Medical Info Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">Medical Profile</h3>
              <button onClick={() => setIsEditModalOpen(true)} className="text-sky-500 hover:text-sky-700 text-[11px] font-semibold">Edit</button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Allergies</div>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Smoking</div>
                  <p className="text-xs text-slate-700 dark:text-slate-350 font-medium">{patient.smokingStatus}</p>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Alcohol</div>
                  <p className="text-xs text-slate-700 dark:text-slate-350 font-medium">{patient.alcoholConsumption}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Condition History */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Condition History</h3>
            <ConditionHistory consultations={consultations} chronicDiseases={patient.chronicDiseases} />
          </div>

          {/* Longitudinal Vitals Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Longitudinal Vitals</h3>
            <div className="h-auto">
              <VitalsChart consultations={consultations} />
            </div>
          </div>

          {/* Attachments */}
          <AttachmentViewer
            documents={documents}
            referrals={referrals}
            onClose={() => {}}
            onUploadClick={() => setIsUploadDocOpen(true)}
          />
        </div>

        {/* Right Column - Tabbed Patient Records */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-1 flex gap-1 no-print overflow-x-auto">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-4 py-2 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                activeTab === 'consultations'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Consultation Logs
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                activeTab === 'certificates'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Issued Certificates
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'timeline' && (
              <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4">Patient Timeline</h3>
                <TimelineView events={timelineEvents} />
              </div>
            )}

            {activeTab === 'consultations' && (
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
            )}

            {activeTab === 'certificates' && (
              <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Issued Medical Certificates</h3>
                <div className="space-y-3">
                  {certificates.length > 0 ? (
                    certificates.map((cert) => (
                      <div key={cert.id} className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded flex justify-between items-center">
                        <div>
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Rest: {cert.restPeriod}</div>
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
            )}
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
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Save Changes</button>
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
            <button type="button" onClick={() => setIsUploadDocOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">Cancel</button>
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
             <button type="button" onClick={() => setIsEditDocOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">Cancel</button>
             <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 font-semibold">Save Changes</button>
           </div>
         </form>
       </Modal>

        <div id="printable-patient-summary" className="hidden">
         <PatientSummaryPrintTemplate
           patient={patient}
           consultations={consultations}
           prescriptions={prescriptions}
           certificates={certificates.filter(c => c.patientId === patient.id)}
           doctor={getDoctorProfileSync()}
         />
       </div>
    </div>
  );
}
