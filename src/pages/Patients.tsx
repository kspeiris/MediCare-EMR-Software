import { Table, Th, Td } from '@/components/ui/Table';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { db, Patient } from '@/services/db';
import { Edit2, Trash2 } from 'lucide-react';

export function Patients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>(() => db.getPatients());

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
    setAllergies(p.allergies ? p.allergies.join(', ') : '');
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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient record? This cannot be undone.")) {
      db.deletePatient(id);
      setPatients(db.getPatients());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      db.updatePatient(editPatientId, patientData);
    } else {
      db.addPatient(patientData);
    }

    setPatients(db.getPatients());
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
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editPatientId ? "Edit Patient Details" : "Add New Patient"}>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Date of Birth</label>
              <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" required className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">NIC / Passport</label>
              <input value={nic} onChange={(e) => setNic(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Blood Group</label>
              <input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="e.g. O+" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Emergency Contact</label>
            <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="Name - Phone Number" />
          </div>
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
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Allergies (comma-separated)</label>
            <input value={allergies} onChange={(e) => setAllergies(e.target.value)} type="text" placeholder="Penicillin, Pollen..." className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Chronic Diseases</label>
            <input value={chronicDiseases} onChange={(e) => setChronicDiseases(e.target.value)} type="text" placeholder="Asthma, Diabetes..." className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Current Medications</label>
            <input value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} type="text" placeholder="Lisinopril 10mg..." className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Previous Surgeries</label>
            <input value={previousSurgeries} onChange={(e) => setPreviousSurgeries(e.target.value)} type="text" placeholder="Appendectomy (2010)..." className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Family Medical History</label>
            <input value={familyMedicalHistory} onChange={(e) => setFamilyMedicalHistory(e.target.value)} type="text" placeholder="Father had heart attack..." className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Vaccination History</label>
            <input value={vaccinationHistory} onChange={(e) => setVaccinationHistory(e.target.value)} type="text" placeholder="COVID-19 Booster (2023), Tdap (2021)..." className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Medical Notes</label>
            <textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-[13px] outline-none" placeholder="Additional clinical observations..."></textarea>
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
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Td className="font-semibold text-slate-700 dark:text-slate-350">#{patient.id}</Td>
                <Td>{patient.firstName} {patient.lastName}</Td>
                <Td>{patient.nic || 'N/A'}</Td>
                <Td>{calculateAge(patient.dob)} / {patient.gender}</Td>
                <Td>{patient.phone}</Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <Link to={`/patients/${patient.id}`} className="text-sky-500 hover:text-sky-600 font-semibold text-xs">View Profile</Link>
                    <button onClick={() => handleOpenEditModal(patient)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"><Edit2 size={13}/></button>
                    <button onClick={() => handleDelete(patient.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
                  </div>
                </Td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <Td colSpan={6} className="text-center py-8 text-slate-500 text-[13px]">
                  No patients found matching your search.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
