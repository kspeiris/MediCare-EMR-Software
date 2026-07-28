import { Table, Th, Td } from '@/components/ui/Table';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { db, Patient } from '@/services/db';
import { Edit2, Trash2, Users } from 'lucide-react';
import { onDbChange } from '@/services/db';

export function Patients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [editPatientId, setEditPatientId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nic, setNic] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [occupation, setOccupation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [previousSurgeries, setPreviousSurgeries] = useState('');
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState('');
  const [smokingStatus, setSmokingStatus] = useState('Never');
  const [alcoholConsumption, setAlcoholConsumption] = useState('Never');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [vaccinationHistory, setVaccinationHistory] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  const loadPatients = async () => {
    const data = await db.getPatients();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
    const unsub = onDbChange('patients:changed', () => {
      loadPatients();
    });
    return unsub;
  }, []);

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

  const handleOpenAddModal = () => {
    setEditPatientId(null);
    setFirstName('');
    setLastName('');
    setNic('');
    setDob('');
    setGender('Male');
    setBloodGroup('O+');
    setMaritalStatus('Single');
    setOccupation('');
    setPhone('');
    setEmail('');
    setAddress('');
    setEmergencyContact('');
    setAllergies('');
    setChronicDiseases('');
    setCurrentMedications('');
    setPreviousSurgeries('');
    setFamilyMedicalHistory('');
    setSmokingStatus('Never');
    setAlcoholConsumption('Never');
    setHeight('175');
    setWeight('70');
    setVaccinationHistory('');
    setMedicalNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Patient) => {
    setEditPatientId(p.id);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setNic(p.nic || '');
    setDob(p.dob || '');
    setGender(p.gender);
    setBloodGroup(p.bloodGroup || 'O+');
    setMaritalStatus(p.maritalStatus || 'Single');
    setOccupation(p.occupation || '');
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setAddress(p.address || '');
    setEmergencyContact(p.emergencyContact || '');
    setAllergies(Array.isArray(p.allergies) ? p.allergies.join(', ') : (typeof p.allergies === 'string' ? p.allergies : ''));
    setChronicDiseases(p.chronicDiseases || '');
    setCurrentMedications(p.currentMedications || '');
    setPreviousSurgeries(p.previousSurgeries || '');
    setFamilyMedicalHistory(p.familyMedicalHistory || '');
    setSmokingStatus(p.smokingStatus || 'Never');
    setAlcoholConsumption(p.alcoholConsumption || 'Never');
    setHeight(String(p.height || 175));
    setWeight(String(p.weight || 70));
    setVaccinationHistory(p.vaccinationHistory || '');
    setMedicalNotes(p.medicalNotes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient record? This cannot be undone.")) {
      await db.deletePatient(id);
      await loadPatients();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allergyList = allergies.split(',').map(s => s.trim()).filter(Boolean);
    const weightNum = parseFloat(weight) || 0;
    const heightNum = parseFloat(height) || 0;
    const bmiVal = weightNum && heightNum ? Number((weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1)) : undefined;

    const patientData = {
      firstName,
      lastName,
      nic,
      dob,
      gender,
      bloodGroup,
      maritalStatus,
      occupation,
      phone,
      email,
      address,
      emergencyContact,
      allergies: allergyList,
      chronicDiseases,
      currentMedications,
      previousSurgeries,
      familyMedicalHistory,
      smokingStatus,
      alcoholConsumption,
      height: heightNum,
      weight: weightNum,
      bmi: bmiVal,
      vaccinationHistory,
      medicalNotes,
    };

    if (editPatientId) {
      await db.updatePatient(editPatientId, patientData);
    } else {
      await db.addPatient(patientData);
    }

    await loadPatients();
    setIsModalOpen(false);
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query) ||
      (p.nic && p.nic.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query))
    );
  }, [patients, searchQuery]);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Patient Records</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Create, edit and manage clinical patient details.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 text-white px-3 py-1.5 rounded text-[12px] font-semibold transition-colors"
        >
          + New Patient
        </button>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editPatientId ? "Edit Patient Details" : "Add New Patient"} className="max-w-2xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Date of Birth</label>
                <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as 'Male' | 'Female')} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">NIC / Passport</label>
                <input value={nic} onChange={(e) => setNic(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Blood Group</label>
                <input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="e.g. O+" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact & Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Emergency Contact</label>
              <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="Name - Phone Number" />
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Clinical Measurements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Height (cm)</label>
                <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Weight (kg)</label>
                <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Marital Status</label>
                <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Occupation</label>
                <input value={occupation} onChange={(e) => setOccupation(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Smoking Status</label>
                <select value={smokingStatus} onChange={(e) => setSmokingStatus(e.target.value)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none">
                  <option value="Never">Never</option>
                  <option value="Former smoker">Former Smoker</option>
                  <option value="Current smoker">Current Smoker</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Alcohol Consumption</label>
                <select value={alcoholConsumption} onChange={(e) => setAlcoholConsumption(e.target.value)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none">
                  <option value="Never">Never</option>
                  <option value="Occasional">Occasional</option>
                  <option value="Socially">Socially</option>
                  <option value="Regularly">Regularly</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Medical History</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Allergies</label>
                <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none resize-y" placeholder="Penicillin, Pollen..."></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Chronic Diseases</label>
                <textarea value={chronicDiseases} onChange={(e) => setChronicDiseases(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none resize-y" placeholder="Asthma, Diabetes..."></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Current Medications</label>
                <textarea value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none resize-y" placeholder="Lisinopril 10mg..."></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Previous Surgeries</label>
                <textarea value={previousSurgeries} onChange={(e) => setPreviousSurgeries(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none resize-y" placeholder="Appendectomy (2010)..."></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Family Medical History</label>
                <textarea value={familyMedicalHistory} onChange={(e) => setFamilyMedicalHistory(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none resize-y" placeholder="Father had heart attack..."></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Vaccination History</label>
                <textarea value={vaccinationHistory} onChange={(e) => setVaccinationHistory(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none resize-y" placeholder="COVID-19 Booster (2023), Tdap (2021)..."></textarea>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Clinical Notes</h3>
            <textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} rows={3} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none resize-y" placeholder="Additional clinical observations..."></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Cancel</button>
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded text-[12px] hover:bg-sky-600 transition-colors font-semibold">
              {editPatientId ? "Update Record" : "Register Patient"}
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">All Registered Patients</h3>
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
          />
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Patient ID</Th>
              <Th>Name</Th>
              <Th>NIC</Th>
              <Th>Age/Gender</Th>
              <Th>Phone</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Td className="font-semibold text-slate-700 dark:text-slate-300">#{patient.id}</Td>
                  <Td>{patient.firstName} {patient.lastName}</Td>
                  <Td>{patient.nic || 'N/A'}</Td>
                  <Td>{calculateAge(patient.dob)} / {patient.gender}</Td>
                  <Td>{patient.phone}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link to={`/patients/${patient.id}`} className="text-sky-500 hover:text-sky-600 font-semibold text-xs">View Profile</Link>
                      <button onClick={() => handleOpenEditModal(patient)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Edit2 size={13}/></button>
                      <button onClick={() => handleDelete(patient.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
                    </div>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Users size={32} className="text-slate-300 dark:text-slate-600 mb-1" />
                    <p className="text-[13px] text-slate-500 font-medium">No patient records found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search or add a new patient to get started.</p>
                  </div>
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
        {filteredPatients.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] text-slate-500">
             Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} records
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[11px] text-slate-500 font-medium">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
