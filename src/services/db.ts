import { generateId, getLocalDate, getLocalDateTime, parseDate } from '@/lib/dates';

export const SCHEMA_VERSION = '2.0.0';

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
  allergies: string[];
  chronicDiseases: string;
  currentMedications: string;
  previousSurgeries: string;
  familyMedicalHistory: string;
  smokingStatus: string;
  alcoholConsumption: string;
  height: number;
  weight: number;
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
  fileData: string;
  uploadDate: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  user?: string;
  immutable?: boolean;
};

export type DoctorProfile = {
  name: string;
  regNumber: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  phone: string;
  email: string;
  signature?: string;
  role?: string;
};

const INITIAL_DOCTOR: DoctorProfile = {
  name: 'Dr. Sarah Smith',
  regNumber: 'MED-8472-TX',
  specialization: 'General Practice & Cardiology',
  clinicName: 'MediCare Primary Clinic',
  clinicAddress: '123 Health Ave, Suite 100, Medical City, TX 75001',
  phone: '(555) 123-4567',
  email: 'contact@medicareclinic.com',
  role: 'admin'
};

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PT-8001',
    firstName: 'James',
    lastName: 'Wilson',
    nic: '841257963V',
    dob: '1985-04-12',
    gender: 'Male',
    bloodGroup: 'O+',
    maritalStatus: 'Married',
    occupation: 'Software Engineer',
    phone: '(555) 234-5678',
    email: 'j.wilson@example.com',
    address: '742 Evergreen Terrace, Austin, TX 78701',
    emergencyContact: 'Sarah Wilson (Wife) - (555) 876-5432',
    allergies: ['Penicillin'],
    chronicDiseases: 'Hypertension (Mild)',
    currentMedications: 'Lisinopril 10mg once daily',
    previousSurgeries: 'Appendectomy (2012)',
    familyMedicalHistory: 'Father had hypertension',
    smokingStatus: 'Never',
    alcoholConsumption: 'Occasional',
    height: 178,
    weight: 76,
    bmi: 24.0,
    vaccinationHistory: 'COVID-19 Booster (2023), Tdap (2021)',
    medicalNotes: 'Compliant with medication. Regular exercise reported.',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'PT-8002',
    firstName: 'Maria',
    lastName: 'Garcia',
    nic: '915482367V',
    dob: '1992-08-23',
    gender: 'Female',
    bloodGroup: 'A+',
    maritalStatus: 'Single',
    occupation: 'Teacher',
    phone: '(555) 345-6789',
    email: 'm.garcia@example.com',
    address: '456 Oak Lane, Apt 3B, Austin, TX 78704',
    emergencyContact: 'Rosa Garcia (Mother) - (555) 765-4321',
    allergies: ['Aspirin', 'Dust Mites'],
    chronicDiseases: 'Asthma (Mild persistent)',
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
    date: getLocalDate(),
    time: '09:00',
    reason: 'Medication Review',
    status: 'Scheduled',
    notes: 'Follow-up on blood pressure control.',
  },
  {
    id: 'APT-102',
    patientId: 'PT-8002',
    date: getLocalDate(),
    time: '11:30',
    reason: 'Asthma Follow-up',
    status: 'Scheduled',
    notes: 'Checking inhaler technique and symptoms.',
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: generateId('LOG'),
    action: 'System Initialization',
    description: 'Local EMR system initialized successfully.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    user: 'system',
    immutable: true
  },
  {
    id: generateId('LOG'),
    action: 'Settings Changed',
    description: 'Doctor settings updated clinic details.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    user: 'system',
    immutable: true
  }
];

const EVENT_LISTENERS: Record<string, Set<(...args: any[]) => void>> = {};

export const onDbChange = (event: string, fn: (...args: any[]) => void): (() => void) => {
  if (!EVENT_LISTENERS[event]) {
    EVENT_LISTENERS[event] = new Set();
  }
  EVENT_LISTENERS[event].add(fn);
  return () => EVENT_LISTENERS[event]?.delete(fn);
};

const emitDbChange = (event: string, ...args: any[]): void => {
  EVENT_LISTENERS[event]?.forEach(fn => {
    try { fn(...args); } catch { /* noop */ }
  });
};

const isElectron = () => typeof window !== 'undefined' && !!(window as any).electronAPI?.db?.invoke;

const safeJsonParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getStorageItem = <T,>(key: string, defaultValue: T): T => safeJsonParse(localStorage.getItem(key), defaultValue);

const setStorageItem = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const removeStorageItem = (key: string): void => {
  localStorage.removeItem(key);
};

export { getStorageItem, setStorageItem, removeStorageItem };

const getSecureItem = async (key: string): Promise<string | null> => {
  if (isElectron() && (window as any).electronAPI?.secureStorage?.get) {
    try {
      const result = await (window as any).electronAPI.secureStorage.get(key);
      if (result.success && result.data) return result.data;
    } catch {
      // fallback
    }
  }
  return localStorage.getItem(key);
};

const setSecureItem = async (key: string, value: string): Promise<void> => {
  if (isElectron() && (window as any).electronAPI?.secureStorage?.set) {
    try {
      await (window as any).electronAPI.secureStorage.set(key, value);
      return;
    } catch {
      // fallback
    }
  }
  localStorage.setItem(key, value);
};

const invokeDb = async (action: string, table: string, payload?: any) => {
  if (isElectron()) {
    return await (window as any).electronAPI.db.invoke(action, table, payload || {});
  }
  return { success: false, error: 'Not in Electron environment' };
};

const validatePatient = (patient: Partial<Patient>): string[] => {
  const errors: string[] = [];
  if (!patient.firstName?.trim()) errors.push('First name is required.');
  if (!patient.lastName?.trim()) errors.push('Last name is required.');
  if (!patient.phone?.trim()) errors.push('Phone number is required.');
  if (!patient.dob?.trim()) errors.push('Date of birth is required.');
  if (!patient.gender) errors.push('Gender is required.');
  if (!['Male', 'Female'].includes(patient.gender)) errors.push('Gender must be Male or Female.');
  if (patient.height && (isNaN(Number(patient.height)) || patient.height < 30 || patient.height > 250)) {
    errors.push('Height must be between 30 and 250 cm.');
  }
  if (patient.weight && (isNaN(Number(patient.weight)) || patient.weight < 1 || patient.weight > 500)) {
    errors.push('Weight must be between 1 and 500 kg.');
  }
  if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
    errors.push('Please provide a valid email address.');
  }
  return errors;
};

export const validateVitals = (bp: string, pulse: string, temp: string, o2: string): string => {
  if (pulse && (isNaN(Number(pulse)) || Number(pulse) < 30 || Number(pulse) > 220)) {
    return 'Pulse must be between 30 and 220 bpm.';
  }
  if (temp && (isNaN(Number(temp)) || Number(temp) < 90 || Number(temp) > 110)) {
    return 'Temperature must be between 90 and 110 °F.';
  }
  if (o2 && (isNaN(Number(o2)) || Number(o2) < 70 || Number(o2) > 100)) {
    return 'Oxygen saturation must be between 70 and 100 %.';
  }
  if (bp && !/^\d{2,3}\/\d{2,3}$/.test(bp.trim())) {
    return 'Blood pressure must be in format systolic/diastolic (e.g. 120/80).';
  }
  return '';
};

export const parseVitals = (bp: string, pulse: string, temp: string, o2: string): Partial<VitalSigns> => {
  const error = validateVitals(bp, pulse, temp, o2);
  if (error) {
    throw new Error(error);
  }
  return {
    bloodPressure: bp || '0/0',
    pulseRate: pulse ? parseInt(pulse) : 0,
    temperature: temp ? parseFloat(temp) : 0,
    oxygenSaturation: o2 ? parseInt(o2) : 0
  };
};

const electronCache = {
  patients: getStorageItem('emr_patients', [] as Patient[]),
  consultations: getStorageItem('emr_consultations', [] as Consultation[]),
  prescriptions: getStorageItem('emr_prescriptions', [] as Prescription[]),
  appointments: getStorageItem('emr_appointments', [] as Appointment[]),
  certificates: getStorageItem('emr_certificates', [] as MedicalCertificate[]),
  documents: getStorageItem('emr_documents', [] as MedicalDocument[]),
  logs: getStorageItem('emr_logs', [] as ActivityLog[]),
  doctorProfile: getStorageItem('emr_doctor_profile', INITIAL_DOCTOR)
};

const syncGetPatients = (): Patient[] => (isElectron() ? (electronCache.patients.length > 0 ? electronCache.patients : getStorageItem('emr_patients', [])) : getStorageItem('emr_patients', []));
const syncGetConsultations = (): Consultation[] => (isElectron() ? (electronCache.consultations.length > 0 ? electronCache.consultations : getStorageItem('emr_consultations', [])) : getStorageItem('emr_consultations', []));
const syncGetPrescriptions = (): Prescription[] => (isElectron() ? (electronCache.prescriptions.length > 0 ? electronCache.prescriptions : getStorageItem('emr_prescriptions', [])) : getStorageItem('emr_prescriptions', []));
const syncGetAppointments = (): Appointment[] => (isElectron() ? (electronCache.appointments.length > 0 ? electronCache.appointments : getStorageItem('emr_appointments', [])) : getStorageItem('emr_appointments', []));
const syncGetCertificates = (): MedicalCertificate[] => (isElectron() ? (electronCache.certificates.length > 0 ? electronCache.certificates : getStorageItem('emr_certificates', [])) : getStorageItem('emr_certificates', []));
const syncGetDocuments = (): MedicalDocument[] => (isElectron() ? (electronCache.documents.length > 0 ? electronCache.documents : getStorageItem('emr_documents', [])) : getStorageItem('emr_documents', []));
const syncGetActivityLogs = (): ActivityLog[] => (isElectron() ? (electronCache.logs.length > 0 ? electronCache.logs : getStorageItem('emr_logs', [])) : getStorageItem('emr_logs', []));
const getDoctorProfileSync = (): DoctorProfile => (isElectron() ? electronCache.doctorProfile : getStorageItem('emr_doctor_profile', INITIAL_DOCTOR));

const setDoctorProfileToStorage = (profile: DoctorProfile): void => {
  electronCache.doctorProfile = profile;
  setStorageItem('emr_doctor_profile', profile);
};

export { getDoctorProfileSync, setDoctorProfileToStorage };

const seedInitialData = async (): Promise<void> => {
  const existing = await invokeDb('getSettings', 'settings', { key: 'emr_seeded' });
  if (existing.success && existing.data) return;

  const doctorResult = await invokeDb('getDoctorProfile', 'doctor');
  if (!doctorResult.success || !doctorResult.data) {
    await invokeDb('saveDoctorProfile', 'doctor', { data: INITIAL_DOCTOR });
  }

  const usernameResult = await invokeDb('getSettings', 'settings', { key: 'emr_username' });
  if (!usernameResult.success || !usernameResult.data) {
    await invokeDb('setSettings', 'settings', { key: 'emr_username', value: 'doctor' });
    await setSecureItem('emr_password', 'secure123');
  }

  for (const patient of INITIAL_PATIENTS) {
    await invokeDb('insert', 'patients', { data: patient });
  }
  for (const apt of INITIAL_APPOINTMENTS) {
    await invokeDb('insert', 'appointments', { data: apt });
  }
  for (const log of INITIAL_LOGS) {
    await invokeDb('insert', 'logs', { data: log });
  }
  await invokeDb('setSettings', 'settings', { key: 'emr_seeded', value: 'true' });
};

const reloadTable = async (table: string): Promise<void> => {
  if (!isElectron()) return;
  try {
    if (table === 'patients' || table === '*') {
      const result = await invokeDb('getPatients', 'patients');
      if (result.success && result.data) {
        electronCache.patients = result.data as Patient[];
        setStorageItem('emr_patients', electronCache.patients);
      }
    }
    if (table === 'consultations' || table === '*') {
      const result = await invokeDb('getConsultations', 'consultations');
      if (result.success && result.data) {
        electronCache.consultations = result.data as Consultation[];
        setStorageItem('emr_consultations', electronCache.consultations);
      }
    }
    if (table === 'prescriptions' || table === '*') {
      const result = await invokeDb('getPrescriptions', 'prescriptions');
      if (result.success && result.data) {
        electronCache.prescriptions = result.data as Prescription[];
        setStorageItem('emr_prescriptions', electronCache.prescriptions);
      }
    }
    if (table === 'appointments' || table === '*') {
      const result = await invokeDb('getAppointments', 'appointments');
      if (result.success && result.data) {
        electronCache.appointments = result.data as Appointment[];
        setStorageItem('emr_appointments', electronCache.appointments);
      }
    }
    if (table === 'certificates' || table === '*') {
      const result = await invokeDb('getCertificates', 'certificates');
      if (result.success && result.data) {
        electronCache.certificates = result.data as MedicalCertificate[];
        setStorageItem('emr_certificates', electronCache.certificates);
      }
    }
    if (table === 'documents' || table === '*') {
      const result = await invokeDb('getDocuments', 'documents');
      if (result.success && result.data) {
        electronCache.documents = result.data as MedicalDocument[];
        setStorageItem('emr_documents', electronCache.documents);
      }
    }
    if (table === 'logs' || table === '*') {
      const result = await invokeDb('getActivityLogs', 'logs');
      if (result.success && result.data) {
        electronCache.logs = result.data as ActivityLog[];
        setStorageItem('emr_logs', electronCache.logs);
      }
    }
    if (table === 'doctor' || table === '*') {
      const result = await invokeDb('getDoctorProfile', 'doctor');
      if (result.success && result.data) {
        electronCache.doctorProfile = result.data as DoctorProfile;
        setStorageItem('emr_doctor_profile', electronCache.doctorProfile);
      }
    }
  } catch (err) {
    console.error(`Failed to reload table ${table}:`, err);
  }
};

export const initDatabase = async (): Promise<void> => {
  if (isElectron()) {
    await seedInitialData();
    await reloadTable('*');

    emitDbChange('patients:changed');
    emitDbChange('consultations:changed');
    emitDbChange('prescriptions:changed');
    emitDbChange('appointments:changed');
    emitDbChange('certificates:changed');
    emitDbChange('documents:changed');
    emitDbChange('logs:changed');
    emitDbChange('doctor:changed');
    emitDbChange('settings:changed');

    (window as any).electronAPI.db.onChanged(async (table: string) => {
      await reloadTable(table);
      if (table === 'patients' || table === '*') emitDbChange('patients:changed');
      if (table === 'consultations' || table === '*') emitDbChange('consultations:changed');
      if (table === 'prescriptions' || table === '*') emitDbChange('prescriptions:changed');
      if (table === 'appointments' || table === '*') emitDbChange('appointments:changed');
      if (table === 'certificates' || table === '*') emitDbChange('certificates:changed');
      if (table === 'documents' || table === '*') emitDbChange('documents:changed');
      if (table === 'logs' || table === '*') emitDbChange('logs:changed');
      if (table === 'doctor' || table === '*') emitDbChange('doctor:changed');
      if (table === 'settings' || table === '*') emitDbChange('settings:changed');
    });
  } else {
    const seeded = localStorage.getItem('emr_seeded');
    if (!seeded) {
      setStorageItem('emr_patients', INITIAL_PATIENTS);
      setStorageItem('emr_appointments', INITIAL_APPOINTMENTS);
      setStorageItem('emr_logs', INITIAL_LOGS);
      setStorageItem('emr_doctor_profile', INITIAL_DOCTOR);
      localStorage.setItem('emr_seeded', 'true');
    }
  }
};

export const transaction = async <T>(fn: () => T, event?: string): Promise<T> => {
  const result = fn();
  if (event) {
    emitDbChange(event);
  }
  return result;
};

export const db = {
  getPatientsSync: (): Patient[] => syncGetPatients(),
  getConsultationsSync: (): Consultation[] => syncGetConsultations(),
  getPrescriptionsSync: (): Prescription[] => syncGetPrescriptions(),
  getAppointmentsSync: (): Appointment[] => syncGetAppointments(),
  getCertificatesSync: (): MedicalCertificate[] => syncGetCertificates(),
  getDocumentsSync: (): MedicalDocument[] => syncGetDocuments(),
  getActivityLogsSync: (): ActivityLog[] => syncGetActivityLogs(),
  getDoctorProfileSync: (): DoctorProfile => getDoctorProfileSync(),

  getSecureItem: async (key: string): Promise<string | null> => {
    return getSecureItem(key);
  },

  setSecureItem: async (key: string, value: string): Promise<void> => {
    await setSecureItem(key, value);
  },

  invalidateSession: (): void => {
    removeStorageItem('emr_authenticated');
  },

  getCurrentUser: (): { id: string; username: string; role: string } | null => {
    const authenticated = localStorage.getItem('emr_authenticated') === 'true';
    if (!authenticated) return null;
    const username = getStorageItem('emr_username', 'doctor');
    const doctor = getDoctorProfileSync();
    return {
      id: 'current-session',
      username,
      role: doctor.role || 'admin'
    };
  },

  authenticateUser: async (username: string, pass: string): Promise<{ success: boolean; user?: { username: string; role: string }; error?: string }> => {
    const storedUsername = getStorageItem('emr_username', 'doctor');
    const storedPass = (await getSecureItem('emr_password')) || 'secure123';
    const doctor = getDoctorProfileSync();
    if (username === storedUsername && pass === storedPass) {
      return {
        success: true,
        user: {
          username: storedUsername,
          role: doctor.role || 'admin'
        }
      };
    }
    return {
      success: false,
      error: 'Invalid username or password. Default username is "doctor" and password is "secure123".'
    };
  },

  getPatients: async (): Promise<Patient[]> => {
    if (isElectron()) {
      const result = await invokeDb('getPatients', 'patients');
      if (result.success && result.data) {
        electronCache.patients = result.data as Patient[];
        setStorageItem('emr_patients', electronCache.patients);
        return electronCache.patients;
      }
    }
    return syncGetPatients();
  },

  getPatientById: async (id: string): Promise<Patient | undefined> => {
    if (isElectron()) {
      const result = await invokeDb('get', 'patients', { id });
      if (result.success && result.data) {
        return result.data as Patient;
      }
    }
    return syncGetPatients().find(p => p.id === id);
  },

  getPatientByIdSync: (id: string): Patient | undefined => {
    return syncGetPatients().find(p => p.id === id);
  },

  addPatient: async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const errors = validatePatient(patient);
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }
    return transaction(async () => {
      const id = generateId('PT');
      const newPatient: Patient = {
        ...patient,
        id,
        createdAt: getLocalDateTime()
      };
      if (isElectron()) {
        await invokeDb('insert', 'patients', { data: newPatient });
      }
      const existing = syncGetPatients();
      const updated = [newPatient, ...existing.filter(p => p.id !== id)];
      setStorageItem('emr_patients', updated);
      if (isElectron()) electronCache.patients = updated;

      await db.logActivity('Patient Registration', 'Registered new patient: ' + patient.firstName + ' ' + patient.lastName + ' (' + id + ')');
      emitDbChange('patients:changed');
      return newPatient;
    });
  },

  updatePatient: async (id: string, updatedFields: Partial<Patient>) => {
    await transaction(async () => {
      const existingList = syncGetPatients();
      const target = existingList.find(p => p.id === id);
      if (target) {
        const errors = validatePatient({ ...target, ...updatedFields });
        if (errors.length > 0) {
          throw new Error(errors.join(' '));
        }
        if (isElectron()) {
          await invokeDb('update', 'patients', { id, data: updatedFields });
        }
        const updatedList = existingList.map(p => p.id === id ? { ...p, ...updatedFields } : p);
        setStorageItem('emr_patients', updatedList);
        if (isElectron()) electronCache.patients = updatedList;
        await db.logActivity('Patient Update', 'Updated information for patient ID: ' + id);
        emitDbChange('patients:changed');
      }
    });
  },

  deletePatient: async (id: string) => {
    await transaction(async () => {
      const relatedTables = ['consultations', 'prescriptions', 'appointments', 'certificates', 'documents'];
      if (isElectron()) {
        for (const table of relatedTables) {
          const result = await invokeDb('deleteByPatient', table, { patientId: id });
          if (!result.success) {
            throw new Error(result.error || `Failed to remove related ${table} records.`);
          }
        }
        await invokeDb('delete', 'patients', { id });
      }
      const updatedList = syncGetPatients().filter(p => p.id !== id);
      setStorageItem('emr_patients', updatedList);
      if (isElectron()) electronCache.patients = updatedList;
      setStorageItem('emr_consultations', syncGetConsultations().filter(c => c.patientId !== id));
      setStorageItem('emr_prescriptions', syncGetPrescriptions().filter(p => p.patientId !== id));
      setStorageItem('emr_appointments', syncGetAppointments().filter(a => a.patientId !== id));
      setStorageItem('emr_certificates', syncGetCertificates().filter(c => c.patientId !== id));
      setStorageItem('emr_documents', syncGetDocuments().filter(d => d.patientId !== id));
      if (isElectron()) {
        electronCache.consultations = syncGetConsultations().filter(c => c.patientId !== id);
        electronCache.prescriptions = syncGetPrescriptions().filter(p => p.patientId !== id);
        electronCache.appointments = syncGetAppointments().filter(a => a.patientId !== id);
        electronCache.certificates = syncGetCertificates().filter(c => c.patientId !== id);
        electronCache.documents = syncGetDocuments().filter(d => d.patientId !== id);
      }
      await db.logActivity('Patient Deleted', 'Deleted patient record ID: ' + id);
      emitDbChange('patients:changed');
      emitDbChange('consultations:changed');
      emitDbChange('prescriptions:changed');
      emitDbChange('appointments:changed');
      emitDbChange('certificates:changed');
      emitDbChange('documents:changed');
    });
  },

  getConsultations: async (): Promise<Consultation[]> => {
    if (isElectron()) {
      const result = await invokeDb('getConsultations', 'consultations');
      if (result.success && result.data) {
        electronCache.consultations = result.data as Consultation[];
        setStorageItem('emr_consultations', electronCache.consultations);
        return electronCache.consultations;
      }
    }
    return syncGetConsultations();
  },

  getConsultationsByPatient: async (patientId: string): Promise<Consultation[]> => {
    if (isElectron()) {
      const result = await invokeDb('getConsultationsByPatient', 'consultations', { patientId });
      if (result.success && result.data) {
        return (result.data as Consultation[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }
    return syncGetConsultations().filter(c => c.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addConsultation: async (consultation: Omit<Consultation, 'id' | 'createdAt'>): Promise<Consultation> => {
    return transaction(async () => {
      const patientExists = syncGetPatients().some(p => p.id === consultation.patientId);
      if (!patientExists) {
        throw new Error('Selected patient does not exist.');
      }
      const id = generateId('CNS');
      const newConsultation: Consultation = {
        ...consultation,
        id,
        createdAt: getLocalDateTime()
      };
      if (isElectron()) {
        await invokeDb('insert', 'consultations', { data: newConsultation });
      }
      const updatedList = [newConsultation, ...syncGetConsultations()];
      setStorageItem('emr_consultations', updatedList);
      if (isElectron()) electronCache.consultations = updatedList;
      await db.logActivity('Consultation Added', 'Added consultation record (' + id + ') for patient ID: ' + consultation.patientId);
      emitDbChange('consultations:changed');
      return newConsultation;
    });
  },

  updateConsultation: async (id: string, updatedFields: Partial<Consultation>) => {
    await transaction(async () => {
      if (updatedFields.patientId && !syncGetPatients().some(p => p.id === updatedFields.patientId)) {
        throw new Error('Selected patient does not exist.');
      }
      if (isElectron()) {
        await invokeDb('update', 'consultations', { id, data: updatedFields });
      }
      const updatedList = syncGetConsultations().map(c => c.id === id ? { ...c, ...updatedFields } : c);
      setStorageItem('emr_consultations', updatedList);
      if (isElectron()) electronCache.consultations = updatedList;
      await db.logActivity('Consultation Update', 'Updated consultation record (' + id + ')');
      emitDbChange('consultations:changed');
    });
  },

  deleteConsultation: async (id: string) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('delete', 'consultations', { id });
      }
      const updatedList = syncGetConsultations().filter(c => c.id !== id);
      setStorageItem('emr_consultations', updatedList);
      if (isElectron()) electronCache.consultations = updatedList;
      await db.logActivity('Consultation Deleted', 'Deleted consultation record (' + id + ')');
      emitDbChange('consultations:changed');
    });
  },

  getPrescriptions: async (): Promise<Prescription[]> => {
    if (isElectron()) {
      const result = await invokeDb('getPrescriptions', 'prescriptions');
      if (result.success && result.data) {
        electronCache.prescriptions = result.data as Prescription[];
        setStorageItem('emr_prescriptions', electronCache.prescriptions);
        return electronCache.prescriptions;
      }
    }
    return syncGetPrescriptions();
  },

  getPrescriptionsByPatient: async (patientId: string): Promise<Prescription[]> => {
    if (isElectron()) {
      const result = await invokeDb('getPrescriptionsByPatient', 'prescriptions', { patientId });
      if (result.success && result.data) {
        return result.data as Prescription[];
      }
    }
    return syncGetPrescriptions().filter(p => p.patientId === patientId);
  },

  addPrescription: async (prescription: Omit<Prescription, 'id'>): Promise<Prescription> => {
    return transaction(async () => {
      const patientExists = syncGetPatients().some(p => p.id === prescription.patientId);
      if (!patientExists) {
        throw new Error('Selected patient does not exist.');
      }
      if (prescription.consultationId && prescription.consultationId !== 'CNS-NONE') {
        const consultationExists = syncGetConsultations().some(c => c.id === prescription.consultationId && c.patientId === prescription.patientId);
        if (!consultationExists) {
          throw new Error('Selected consultation does not exist for this patient.');
        }
      }
      const id = generateId('RX');
      const newPrescription = { ...prescription, id };
      if (isElectron()) {
        await invokeDb('insert', 'prescriptions', { data: newPrescription });
      }
      const updatedList = [newPrescription, ...syncGetPrescriptions()];
      setStorageItem('emr_prescriptions', updatedList);
      if (isElectron()) electronCache.prescriptions = updatedList;
      await db.logActivity('Prescription Printed', 'Generated prescription ' + id + ' for patient ID: ' + prescription.patientId);
      emitDbChange('prescriptions:changed');
      return newPrescription;
    });
  },

  updatePrescription: async (id: string, updatedFields: Partial<Prescription>) => {
    await transaction(async () => {
      const nextPatientId = updatedFields.patientId;
      const current = syncGetPrescriptions().find(p => p.id === id);
      if (nextPatientId && !syncGetPatients().some(p => p.id === nextPatientId)) {
        throw new Error('Selected patient does not exist.');
      }
      if (updatedFields.consultationId || nextPatientId) {
        const patientId = nextPatientId || current?.patientId;
        const consultationId = updatedFields.consultationId || current?.consultationId;
        if (consultationId && consultationId !== 'CNS-NONE') {
          const consultationExists = syncGetConsultations().some(c => c.id === consultationId && c.patientId === patientId);
          if (!consultationExists) {
            throw new Error('Selected consultation does not exist for this patient.');
          }
        }
      }
      if (isElectron()) {
        await invokeDb('update', 'prescriptions', { id, data: updatedFields });
      }
      const updatedList = syncGetPrescriptions().map(p => p.id === id ? { ...p, ...updatedFields } : p);
      setStorageItem('emr_prescriptions', updatedList);
      if (isElectron()) electronCache.prescriptions = updatedList;
      await db.logActivity('Prescription Updated', 'Updated prescription (' + id + ')');
      emitDbChange('prescriptions:changed');
    });
  },

  deletePrescription: async (id: string) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('delete', 'prescriptions', { id });
      }
      const updatedList = syncGetPrescriptions().filter(p => p.id !== id);
      setStorageItem('emr_prescriptions', updatedList);
      if (isElectron()) electronCache.prescriptions = updatedList;
      await db.logActivity('Prescription Deleted', 'Deleted prescription (' + id + ')');
      emitDbChange('prescriptions:changed');
    });
  },

  getAppointments: async (): Promise<Appointment[]> => {
    if (isElectron()) {
      const result = await invokeDb('getAppointments', 'appointments');
      if (result.success && result.data) {
        electronCache.appointments = result.data as Appointment[];
        setStorageItem('emr_appointments', electronCache.appointments);
        return electronCache.appointments;
      }
    }
    return syncGetAppointments();
  },

  addAppointment: async (apt: Omit<Appointment, 'id'>): Promise<Appointment> => {
    return transaction(async () => {
      const patientExists = syncGetPatients().some(p => p.id === apt.patientId);
      if (!patientExists) {
        throw new Error('Selected patient does not exist.');
      }
      const appointments = syncGetAppointments();
      const existing = appointments.find(a =>
        a.patientId === apt.patientId &&
        a.date === apt.date &&
        a.time === apt.time &&
        a.status === 'Scheduled'
      );
      if (existing) {
        throw new Error('Patient already has a scheduled appointment on ' + apt.date + ' at ' + apt.time + '.');
      }
      const id = generateId('APT');
      const newApt = { ...apt, id };
      if (isElectron()) {
        await invokeDb('insert', 'appointments', { data: newApt });
      }
      const updatedList = [newApt, ...appointments];
      setStorageItem('emr_appointments', updatedList);
      if (isElectron()) electronCache.appointments = updatedList;
      await db.logActivity('Appointment Scheduled', 'Scheduled appointment for patient ID: ' + apt.patientId + ' on ' + apt.date);
      emitDbChange('appointments:changed');
      return newApt;
    });
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('update', 'appointments', { id, data: { status } });
      }
      const updatedList = syncGetAppointments().map(a => a.id === id ? { ...a, status } : a);
      setStorageItem('emr_appointments', updatedList);
      if (isElectron()) electronCache.appointments = updatedList;
      await db.logActivity('Appointment Scheduled', 'Updated appointment ' + id + ' status to ' + status);
      emitDbChange('appointments:changed');
    });
  },

  updateAppointment: async (id: string, updatedFields: Partial<Appointment>) => {
    await transaction(async () => {
      if (updatedFields.patientId && !syncGetPatients().some(p => p.id === updatedFields.patientId)) {
        throw new Error('Selected patient does not exist.');
      }
      if (isElectron()) {
        await invokeDb('update', 'appointments', { id, data: updatedFields });
      }
      const updatedList = syncGetAppointments().map(a => a.id === id ? { ...a, ...updatedFields } : a);
      setStorageItem('emr_appointments', updatedList);
      if (isElectron()) electronCache.appointments = updatedList;
      await db.logActivity('Appointment Updated', 'Updated appointment (' + id + ')');
      emitDbChange('appointments:changed');
    });
  },

  deleteAppointment: async (id: string) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('delete', 'appointments', { id });
      }
      const updatedList = syncGetAppointments().filter(a => a.id !== id);
      setStorageItem('emr_appointments', updatedList);
      if (isElectron()) electronCache.appointments = updatedList;
      await db.logActivity('Appointment Deleted', 'Deleted appointment (' + id + ')');
      emitDbChange('appointments:changed');
    });
  },

  getCertificates: async (): Promise<MedicalCertificate[]> => {
    if (isElectron()) {
      const result = await invokeDb('getCertificates', 'certificates');
      if (result.success && result.data) {
        electronCache.certificates = result.data as MedicalCertificate[];
        setStorageItem('emr_certificates', electronCache.certificates);
        return electronCache.certificates;
      }
    }
    return syncGetCertificates();
  },

  addCertificate: async (cert: Omit<MedicalCertificate, 'id'>): Promise<MedicalCertificate> => {
    return transaction(async () => {
      const patientExists = syncGetPatients().some(p => p.id === cert.patientId);
      if (!patientExists) {
        throw new Error('Selected patient does not exist.');
      }
      const id = generateId('MC');
      const newCert = { ...cert, id };
      if (isElectron()) {
        await invokeDb('insert', 'certificates', { data: newCert });
      }
      const updatedList = [newCert, ...syncGetCertificates()];
      setStorageItem('emr_certificates', updatedList);
      if (isElectron()) electronCache.certificates = updatedList;
      await db.logActivity('Certificate Generated', 'Issued medical certificate ' + id + ' for patient ID: ' + cert.patientId);
      emitDbChange('certificates:changed');
      return newCert;
    });
  },

  updateCertificate: async (id: string, updatedFields: Partial<MedicalCertificate>) => {
    await transaction(async () => {
      if (updatedFields.patientId && !syncGetPatients().some(p => p.id === updatedFields.patientId)) {
        throw new Error('Selected patient does not exist.');
      }
      if (isElectron()) {
        await invokeDb('update', 'certificates', { id, data: updatedFields });
      }
      const updatedList = syncGetCertificates().map(c => c.id === id ? { ...c, ...updatedFields } : c);
      setStorageItem('emr_certificates', updatedList);
      if (isElectron()) electronCache.certificates = updatedList;
      await db.logActivity('Certificate Updated', 'Updated medical certificate (' + id + ')');
      emitDbChange('certificates:changed');
    });
  },

  deleteCertificate: async (id: string) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('delete', 'certificates', { id });
      }
      const updatedList = syncGetCertificates().filter(c => c.id !== id);
      setStorageItem('emr_certificates', updatedList);
      if (isElectron()) electronCache.certificates = updatedList;
      await db.logActivity('Certificate Deleted', 'Deleted certificate (' + id + ')');
      emitDbChange('certificates:changed');
    });
  },

  getDocuments: async (): Promise<MedicalDocument[]> => {
    if (isElectron()) {
      const result = await invokeDb('getDocuments', 'documents');
      if (result.success && result.data) {
        electronCache.documents = result.data as MedicalDocument[];
        setStorageItem('emr_documents', electronCache.documents);
        return electronCache.documents;
      }
    }
    return syncGetDocuments();
  },

  getDocumentsByPatient: async (patientId: string): Promise<MedicalDocument[]> => {
    if (isElectron()) {
      const result = await invokeDb('getDocumentsByPatient', 'documents', { patientId });
      if (result.success && result.data) {
        return result.data as MedicalDocument[];
      }
    }
    return syncGetDocuments().filter(d => d.patientId === patientId);
  },

  addDocument: async (doc: Omit<MedicalDocument, 'id' | 'uploadDate'>): Promise<MedicalDocument> => {
    return transaction(async () => {
      const id = generateId('DOC');
      const newDoc = { ...doc, id, uploadDate: getLocalDate() };
      if (isElectron()) {
        await invokeDb('insert', 'documents', { data: newDoc });
      }
      const updatedList = [newDoc, ...syncGetDocuments()];
      setStorageItem('emr_documents', updatedList);
      if (isElectron()) electronCache.documents = updatedList;
      await db.logActivity('Patient Update', 'Uploaded document "' + doc.name + '" for patient ID: ' + doc.patientId);
      emitDbChange('documents:changed');
      return newDoc;
    });
  },

  deleteDocument: async (id: string) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('delete', 'documents', { id });
      }
      const updatedList = syncGetDocuments().filter(d => d.id !== id);
      setStorageItem('emr_documents', updatedList);
      if (isElectron()) electronCache.documents = updatedList;
      await db.logActivity('Patient Update', 'Removed document ID: ' + id);
      emitDbChange('documents:changed');
    });
  },

  updateDocument: async (id: string, updatedFields: Partial<MedicalDocument>) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('update', 'documents', { id, data: updatedFields });
      }
      const updatedList = syncGetDocuments().map(d => d.id === id ? { ...d, ...updatedFields } : d);
      setStorageItem('emr_documents', updatedList);
      if (isElectron()) electronCache.documents = updatedList;
      await db.logActivity('Document Updated', 'Updated document (' + id + ')');
      emitDbChange('documents:changed');
    });
  },

  getActivityLogs: async (): Promise<ActivityLog[]> => {
    if (isElectron()) {
      const result = await invokeDb('getActivityLogs', 'logs');
      if (result.success && result.data) {
        electronCache.logs = result.data as ActivityLog[];
        setStorageItem('emr_logs', electronCache.logs);
        return electronCache.logs;
      }
    }
    return syncGetActivityLogs();
  },

  logActivity: async (action: string, description: string) => {
    await transaction(async () => {
      const newLog: ActivityLog = {
        id: generateId('LOG'),
        action,
        description,
        createdAt: getLocalDateTime(),
        user: 'system'
      };
      if (isElectron()) {
        await invokeDb('insert', 'logs', { data: newLog });
      }
      const logs = syncGetActivityLogs();
      const updatedList = [newLog, ...logs].slice(0, 1000);
      setStorageItem('emr_logs', updatedList);
      if (isElectron()) electronCache.logs = updatedList;
      emitDbChange('logs:changed');
    });
  },

  clearActivityLogs: async () => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('clear', 'logs');
      }
      setStorageItem('emr_logs', []);
      if (isElectron()) electronCache.logs = [];
      emitDbChange('logs:changed');
    });
  },

  getDoctorProfile: (): DoctorProfile => getDoctorProfileSync(),

  saveDoctorProfile: async (data: DoctorProfile) => {
    await transaction(async () => {
      if (isElectron()) {
        await invokeDb('saveDoctorProfile', 'doctor', { data });
      }
      setDoctorProfileToStorage(data);
      await db.logActivity('Settings Changed', 'Updated doctor profile settings.');
      emitDbChange('doctor:changed');
    });
  },

  exportBackup: async (): Promise<string> => {
    if (isElectron()) {
      const res = await invokeDb('exportAll', '*');
      if (res.success && res.data) {
        await db.logActivity('Backup Created', 'Manual database backup exported via Electron.');
        return JSON.stringify(res.data, null, 2);
      }
    }
    const fullDb = {
      schemaVersion: '2.0.0',
      exportedAt: getLocalDateTime(),
      doctor: getDoctorProfileSync(),
      patients: syncGetPatients(),
      consultations: syncGetConsultations(),
      prescriptions: syncGetPrescriptions(),
      appointments: syncGetAppointments(),
      certificates: syncGetCertificates(),
      documents: syncGetDocuments(),
      logs: syncGetActivityLogs()
    };
    await db.logActivity('Backup Created', 'Manual database backup exported.');
    return JSON.stringify(fullDb, null, 2);
  },

  restoreBackup: async (backupStr: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const parsed = JSON.parse(backupStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid backup format.' };
      }
      if (!Array.isArray(parsed.patients)) {
        return { success: false, error: 'Invalid backup format: missing patients array.' };
      }
      const arraysToValidate: Array<[keyof typeof parsed, string]> = [
        ['consultations', 'consultations'],
        ['prescriptions', 'prescriptions'],
        ['appointments', 'appointments'],
        ['certificates', 'certificates'],
        ['documents', 'documents'],
        ['logs', 'logs']
      ];
      for (const [key, label] of arraysToValidate) {
        if (parsed[key] !== undefined && !Array.isArray(parsed[key])) {
          return { success: false, error: `Invalid backup format: ${label} must be an array.` };
        }
      }
      if (isElectron()) {
        const result = await invokeDb('importBackup', '*', { data: parsed });
        if (!result.success) {
          return { success: false, error: result.error || 'Failed to import backup into SQLite.' };
        }
        await reloadTable('*');
      } else {
        if (parsed.doctor) setStorageItem('emr_doctor_profile', parsed.doctor);
        setStorageItem('emr_patients', parsed.patients);
        setStorageItem('emr_consultations', parsed.consultations || []);
        setStorageItem('emr_prescriptions', parsed.prescriptions || []);
        setStorageItem('emr_appointments', parsed.appointments || []);
        setStorageItem('emr_certificates', parsed.certificates || []);
        setStorageItem('emr_documents', parsed.documents || []);
        setStorageItem('emr_logs', parsed.logs || []);
      }
      emitDbChange('patients:changed');
      emitDbChange('consultations:changed');
      emitDbChange('prescriptions:changed');
      emitDbChange('appointments:changed');
      emitDbChange('certificates:changed');
      emitDbChange('documents:changed');
      emitDbChange('logs:changed');
      emitDbChange('doctor:changed');
      await db.logActivity('Restore Database', 'Database state successfully restored from backup.');
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to parse backup file.' };
    }
  }
};
