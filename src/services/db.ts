export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  nic: string;
  dob: string;
  gender: 'Male' | 'Female';
  bloodGroup: string;
  maritalStatus: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  photo?: string;
  
  // Medical
  allergies: string[];
  chronicDiseases: string;
  currentMedications: string;
  previousSurgeries: string;
  familyMedicalHistory: string;
  smokingStatus: string;
  alcoholConsumption: string;
  height: number; // in cm
  weight: number; // in kg
  bmi?: number;
  vaccinationHistory: string;
  medicalNotes: string;
  
  createdAt: string;
};

export type VitalSigns = {
  height: number;
  weight: number;
  bmi: number;
  bloodPressure: string;
  pulseRate: number;
  respiratoryRate: number;
  temperature: number;
  oxygenSaturation: number;
  bloodSugar: number;
};

export type MedicineItem = {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  quantity: number;
  instructions: string;
};

export type Prescription = {
  id: string;
  consultationId: string;
  patientId: string;
  date: string;
  medicines: MedicineItem[];
};

export type Consultation = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  diagnosis: string;
  treatmentPlan: string;
  clinicalNotes: string;
  followupDate?: string;
  vitals: VitalSigns;
  createdAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
};

export type MedicalCertificate = {
  id: string;
  patientId: string;
  diagnosis: string;
  restPeriod: string;
  issueDate: string;
  doctorRemarks: string;
};

export type MedicalDocument = {
  id: string;
  patientId: string;
  name: string;
  type: string;
  fileData: string; // Base64
  uploadDate: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
};

export type DoctorProfile = {
  name: string;
  regNumber: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  phone: string;
  email: string;
  signature?: string; // base64
};

// Initial mockup seed data
const INITIAL_DOCTOR: DoctorProfile = {
  name: 'Dr. Sarah Smith',
  regNumber: 'MED-8472-TX',
  specialization: 'General Practice & Cardiology',
  clinicName: 'MediCare Primary Clinic',
  clinicAddress: '123 Health Ave, Suite 100, Medical City, TX 75001',
  phone: '(555) 123-4567',
  email: 'contact@medicareclinic.com',
};

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PT-8001',
    firstName: 'Michael',
    lastName: 'Chang',
    nic: '852341234V',
    dob: '1981-04-12',
    gender: 'Male',
    bloodGroup: 'O+',
    maritalStatus: 'Married',
    occupation: 'Software Engineer',
    phone: '(555) 123-4567',
    email: 'michael.chang@example.com',
    address: '456 Pine St, Austin, TX 78701',
    emergencyContact: 'Linda Chang (Wife) - (555) 321-7654',
    allergies: ['Penicillin', 'Peanuts'],
    chronicDiseases: 'Hypertension',
    currentMedications: 'Lisinopril 10mg once daily',
    previousSurgeries: 'Appendectomy (2010)',
    familyMedicalHistory: 'Father had myocardial infarction at 62',
    smokingStatus: 'Never',
    alcoholConsumption: 'Occasional',
    height: 178,
    weight: 82,
    bmi: 25.9,
    vaccinationHistory: 'COVID-19 Booster (2023), Tdap (2021)',
    medicalNotes: 'Complies well with hypertension medication.',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'PT-8002',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    nic: '905645321V',
    dob: '1994-08-23',
    gender: 'Female',
    bloodGroup: 'A-',
    maritalStatus: 'Single',
    occupation: 'Teacher',
    phone: '(555) 987-6543',
    email: 'sjenkins@example.com',
    address: '789 Elm Rd, Dallas, TX 75201',
    emergencyContact: 'Robert Jenkins (Father) - (555) 678-1234',
    allergies: ['Sulfa drugs'],
    chronicDiseases: 'Asthma',
    currentMedications: 'Albuterol inhaler PRN',
    previousSurgeries: 'None',
    familyMedicalHistory: 'Mother has type 2 diabetes',
    smokingStatus: 'Former smoker',
    alcoholConsumption: 'Socially',
    height: 165,
    weight: 58,
    bmi: 21.3,
    vaccinationHistory: 'Flu vaccine (2024)',
    medicalNotes: 'Needs annual asthma review.',
    createdAt: '2025-02-15T11:30:00Z',
  },
  {
    id: 'PT-8003',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    nic: '784512963V',
    dob: '1998-11-05',
    gender: 'Female',
    bloodGroup: 'B+',
    maritalStatus: 'Single',
    occupation: 'Graphic Designer',
    phone: '(555) 456-7890',
    email: 'elena.r@example.com',
    address: '101 Maple Ave, Houston, TX 77001',
    emergencyContact: 'Carlos Rodriguez (Brother) - (555) 901-2345',
    allergies: [],
    chronicDiseases: 'None',
    currentMedications: 'None',
    previousSurgeries: 'Wisdom teeth extraction (2018)',
    familyMedicalHistory: 'No major history',
    smokingStatus: 'Never',
    alcoholConsumption: 'Never',
    height: 160,
    weight: 54,
    bmi: 21.1,
    vaccinationHistory: 'Tetanus booster (2022)',
    medicalNotes: 'Regular routine visits.',
    createdAt: '2025-03-01T09:15:00Z',
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-101',
    patientId: 'PT-8001',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    reason: 'Medication Review',
    status: 'Scheduled',
    notes: 'Follow-up on blood pressure control.',
  },
  {
    id: 'APT-102',
    patientId: 'PT-8002',
    date: new Date().toISOString().split('T')[0],
    time: '11:30',
    reason: 'Asthma Follow-up',
    status: 'Scheduled',
    notes: 'Checking inhaler technique and symptoms.',
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'LOG-1',
    action: 'System Initialization',
    description: 'Local EMR system initialized successfully.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'LOG-2',
    action: 'Settings Changed',
    description: 'Doctor settings updated clinic details.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Database storage helper
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const db = {
  // Doctor Profile
  getDoctorProfile: (): DoctorProfile => getStorageItem('emr_doctor', INITIAL_DOCTOR),
  saveDoctorProfile: (profile: DoctorProfile) => {
    setStorageItem('emr_doctor', profile);
    db.logActivity('Settings Changed', `Doctor profile for ${profile.name} updated.`);
  },

  // Patients
  getPatients: (): Patient[] => getStorageItem('emr_patients', INITIAL_PATIENTS),
  savePatients: (patients: Patient[]) => setStorageItem('emr_patients', patients),
  getPatientById: (id: string): Patient | undefined => db.getPatients().find(p => p.id === id),
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const patients = db.getPatients();
    const id = `PT-${Date.now().toString(36).toUpperCase()}`;
    const newPatient: Patient = {
      ...patient,
      id,
      createdAt: new Date().toISOString()
    };
    db.savePatients([newPatient, ...patients]);
    db.logActivity('Patient Registration', `Registered new patient: ${patient.firstName} ${patient.lastName} (${id})`);
    return newPatient;
  },
  updatePatient: (id: string, updatedFields: Partial<Patient>) => {
    const patients = db.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...updatedFields };
      db.savePatients(patients);
      db.logActivity('Patient Update', `Updated information for patient ID: ${id}`);
    }
  },
  deletePatient: (id: string) => {
    const patients = db.getPatients().filter(p => p.id !== id);
    db.savePatients(patients);
    db.logActivity('Patient Deleted', `Deleted patient record ID: ${id}`);
  },

  // Consultations
  getConsultations: (): Consultation[] => getStorageItem('emr_consultations', []),
  saveConsultations: (consultations: Consultation[]) => setStorageItem('emr_consultations', consultations),
  getConsultationsByPatient: (patientId: string): Consultation[] => 
    db.getConsultations().filter(c => c.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt'>): Consultation => {
    const consultations = db.getConsultations();
    const id = `CNS-${Date.now().toString(36).toUpperCase()}`;
    const newConsultation: Consultation = {
      ...consultation,
      id,
      createdAt: new Date().toISOString()
    };
    db.saveConsultations([newConsultation, ...consultations]);
    db.logActivity('Consultation Added', `Added consultation record (${id}) for patient ID: ${consultation.patientId}`);
    return newConsultation;
  },
  updateConsultation: (id: string, updatedFields: Partial<Consultation>) => {
    const consultations = db.getConsultations();
    const index = consultations.findIndex(c => c.id === id);
    if (index !== -1) {
      consultations[index] = { ...consultations[index], ...updatedFields };
      db.saveConsultations(consultations);
      db.logActivity('Consultation Update', `Updated consultation record (${id})`);
    }
  },
  deleteConsultation: (id: string) => {
    const consultations = db.getConsultations().filter(c => c.id !== id);
    db.saveConsultations(consultations);
    db.logActivity('Consultation Deleted', `Deleted consultation record (${id})`);
  },

  // Prescriptions
  getPrescriptions: (): Prescription[] => getStorageItem('emr_prescriptions', []),
  savePrescriptions: (prescriptions: Prescription[]) => setStorageItem('emr_prescriptions', prescriptions),
  getPrescriptionsByPatient: (patientId: string): Prescription[] => 
    db.getPrescriptions().filter(p => p.patientId === patientId),
  addPrescription: (prescription: Omit<Prescription, 'id'>): Prescription => {
    const prescriptions = db.getPrescriptions();
    const id = `RX-${Date.now().toString(36).toUpperCase()}`;
    const newPrescription = { ...prescription, id };
    db.savePrescriptions([newPrescription, ...prescriptions]);
    db.logActivity('Prescription Printed', `Generated prescription ${id} for patient ID: ${prescription.patientId}`);
    return newPrescription;
  },
  updatePrescription: (id: string, updatedFields: Partial<Prescription>) => {
    const prescriptions = db.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index !== -1) {
      prescriptions[index] = { ...prescriptions[index], ...updatedFields };
      db.savePrescriptions(prescriptions);
      db.logActivity('Prescription Updated', `Updated prescription (${id})`);
    }
  },
  deletePrescription: (id: string) => {
    const prescriptions = db.getPrescriptions().filter(p => p.id !== id);
    db.savePrescriptions(prescriptions);
    db.logActivity('Prescription Deleted', `Deleted prescription (${id})`);
  },

  // Appointments
  getAppointments: (): Appointment[] => getStorageItem('emr_appointments', INITIAL_APPOINTMENTS),
  saveAppointments: (appointments: Appointment[]) => setStorageItem('emr_appointments', appointments),
  addAppointment: (apt: Omit<Appointment, 'id'>): Appointment => {
    const appointments = db.getAppointments();
    const id = `APT-${Date.now().toString(36).toUpperCase()}`;
    const newApt = { ...apt, id };
    db.saveAppointments([...appointments, newApt]);
    db.logActivity('Appointment Scheduled', `Scheduled appointment for patient ID: ${apt.patientId} on ${apt.date}`);
    return newApt;
  },
  updateAppointmentStatus: (id: string, status: Appointment['status']) => {
    const appointments = db.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index].status = status;
      db.saveAppointments(appointments);
      db.logActivity('Appointment Scheduled', `Updated appointment ${id} status to ${status}`);
    }
  },
  updateAppointment: (id: string, updatedFields: Partial<Appointment>) => {
    const appointments = db.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updatedFields };
      db.saveAppointments(appointments);
      db.logActivity('Appointment Updated', `Updated appointment (${id})`);
    }
  },
  deleteAppointment: (id: string) => {
    const appointments = db.getAppointments().filter(a => a.id !== id);
    db.saveAppointments(appointments);
    db.logActivity('Appointment Deleted', `Deleted appointment (${id})`);
  },

  // Medical Certificates
  getCertificates: (): MedicalCertificate[] => getStorageItem('emr_certificates', []),
  saveCertificates: (certs: MedicalCertificate[]) => setStorageItem('emr_certificates', certs),
  addCertificate: (cert: Omit<MedicalCertificate, 'id'>): MedicalCertificate => {
    const certs = db.getCertificates();
    const id = `MC-${Date.now().toString(36).toUpperCase()}`;
    const newCert = { ...cert, id };
    db.saveCertificates([newCert, ...certs]);
    db.logActivity('Certificate Generated', `Issued medical certificate ${id} for patient ID: ${cert.patientId}`);
    return newCert;
  },
  updateCertificate: (id: string, updatedFields: Partial<MedicalCertificate>) => {
    const certs = db.getCertificates();
    const index = certs.findIndex(c => c.id === id);
    if (index !== -1) {
      certs[index] = { ...certs[index], ...updatedFields };
      db.saveCertificates(certs);
      db.logActivity('Certificate Updated', `Updated medical certificate (${id})`);
    }
  },
  deleteCertificate: (id: string) => {
    const certs = db.getCertificates().filter(c => c.id !== id);
    db.saveCertificates(certs);
    db.logActivity('Certificate Deleted', `Deleted medical certificate (${id})`);
  },

  // Documents
  getDocuments: (): MedicalDocument[] => getStorageItem('emr_documents', []),
  saveDocuments: (docs: MedicalDocument[]) => setStorageItem('emr_documents', docs),
  getDocumentsByPatient: (patientId: string): MedicalDocument[] => 
    db.getDocuments().filter(d => d.patientId === patientId),
  addDocument: (doc: Omit<MedicalDocument, 'id' | 'uploadDate'>): MedicalDocument => {
    const docs = db.getDocuments();
    const id = `DOC-${Date.now().toString(36).toUpperCase()}`;
    const newDoc = { ...doc, id, uploadDate: new Date().toISOString().split('T')[0] };
    db.saveDocuments([newDoc, ...docs]);
    db.logActivity('Patient Update', `Uploaded document "${doc.name}" for patient ID: ${doc.patientId}`);
    return newDoc;
  },
  deleteDocument: (id: string) => {
    const docs = db.getDocuments().filter(d => d.id !== id);
    db.saveDocuments(docs);
    db.logActivity('Patient Update', `Removed document ID: ${id}`);
  },
  updateDocument: (id: string, updatedFields: Partial<MedicalDocument>) => {
    const docs = db.getDocuments();
    const index = docs.findIndex(d => d.id === id);
    if (index !== -1) {
      docs[index] = { ...docs[index], ...updatedFields };
      db.saveDocuments(docs);
      db.logActivity('Document Updated', `Updated document (${id})`);
    }
  },

  // Security & Logs
  getActivityLogs: (): ActivityLog[] => getStorageItem('emr_logs', INITIAL_LOGS),
  logActivity: (action: string, description: string) => {
    const logs = db.getActivityLogs();
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      action,
      description,
      createdAt: new Date().toISOString()
    };
    setStorageItem('emr_logs', [newLog, ...logs].slice(0, 1000)); // limit to 1000 logs
  },
  clearActivityLogs: () => {
    setStorageItem('emr_logs', []);
  },

  // Backup & Restore
  exportBackup: (): string => {
    const fullDb = {
      doctor: db.getDoctorProfile(),
      patients: db.getPatients(),
      consultations: db.getConsultations(),
      prescriptions: db.getPrescriptions(),
      appointments: db.getAppointments(),
      certificates: db.getCertificates(),
      documents: db.getDocuments(),
      logs: db.getActivityLogs()
    };
    db.logActivity('Backup Created', 'Manual database backup exported.');
    return JSON.stringify(fullDb, null, 2);
  },
  restoreBackup: (backupStr: string): boolean => {
    try {
      const parsed = JSON.parse(backupStr);
      if (parsed.patients && Array.isArray(parsed.patients)) {
        if (parsed.doctor) setStorageItem('emr_doctor', parsed.doctor);
        setStorageItem('emr_patients', parsed.patients);
        setStorageItem('emr_consultations', parsed.consultations || []);
        setStorageItem('emr_prescriptions', parsed.prescriptions || []);
        setStorageItem('emr_appointments', parsed.appointments || []);
        setStorageItem('emr_certificates', parsed.certificates || []);
        setStorageItem('emr_documents', parsed.documents || []);
        setStorageItem('emr_logs', parsed.logs || []);
        db.logActivity('Restore Database', 'Database state successfully restored from backup.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
