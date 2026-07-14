import { Patient } from '@/services/db';

interface PatientSummaryPrintProps {
  patient: Patient;
  consultations: any[];
  prescriptions: any[];
  certificates: any[];
  doctor: {
    name: string;
    clinicName: string;
    clinicAddress: string;
    phone: string;
    email: string;
    regNumber: string;
  };
}

export function PatientSummaryPrintTemplate({
  patient,
  consultations,
  prescriptions,
  certificates,
  doctor
}: PatientSummaryPrintProps) {
  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  return (
    <div className="print-page mx-auto bg-white text-slate-900 font-sans shadow-lg">
      {/* Header */}
      <div className="border-b-4 border-sky-600 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="w-2/3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">MC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{doctor.clinicName}</h1>
                <p className="text-xs text-slate-600">{doctor.clinicAddress}</p>
                <p className="text-xs text-slate-600">Phone: {doctor.phone} | Email: {doctor.email}</p>
              </div>
            </div>
          </div>
          <div className="text-right w-1/3">
            <h2 className="text-lg font-bold text-slate-800">{doctor.name}</h2>
            <p className="text-xs text-slate-600">Reg: {doctor.regNumber}</p>
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-200 pb-2 inline-block px-8">
          Patient Summary Report
        </h2>
      </div>

      {/* Patient Demographics */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">
          Patient Demographics
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600 font-medium">Patient ID:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.id}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Name:</span>
            <span className="ml-2 font-semibold text-slate-900">
              {patient.firstName} {patient.lastName}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Age / Gender:</span>
            <span className="ml-2 font-semibold text-slate-900">
              {age} yrs / {patient.gender}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Date of Birth:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.dob}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">NIC:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.nic || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Blood Group:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.bloodGroup || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Phone:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.phone}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Email:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.email || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-600 font-medium">Address:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.address || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Emergency Contact:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.emergencyContact || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">
          Medical Information
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-slate-600 font-medium">Allergies:</span>
            <div className="mt-1">
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500">No known allergies</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Chronic Diseases:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.chronicDiseases || 'None'}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Current Medications:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.currentMedications || 'None'}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Previous Surgeries:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.previousSurgeries || 'None'}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Family Medical History:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.familyMedicalHistory || 'None'}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-600 font-medium">Smoking Status:</span>
              <span className="ml-2 font-semibold text-slate-900">{patient.smokingStatus || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Alcohol Consumption:</span>
              <span className="ml-2 font-semibold text-slate-900">{patient.alcoholConsumption || 'N/A'}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Vaccination History:</span>
            <span className="ml-2 font-semibold text-slate-900">{patient.vaccinationHistory || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">
          Vitals & Measurements
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-white rounded border border-slate-200">
            <span className="text-slate-600 text-xs block">Height</span>
            <span className="text-lg font-bold text-slate-900">{patient.height} cm</span>
          </div>
          <div className="text-center p-2 bg-white rounded border border-slate-200">
            <span className="text-slate-600 text-xs block">Weight</span>
            <span className="text-lg font-bold text-slate-900">{patient.weight} kg</span>
          </div>
          <div className="text-center p-2 bg-white rounded border border-slate-200">
            <span className="text-slate-600 text-xs block">BMI</span>
            <span className="text-lg font-bold text-slate-900">{patient.bmi || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Consultation History */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">
          Recent Consultations ({consultations.length})
        </h3>
        {consultations.length > 0 ? (
          <div className="space-y-2">
            {consultations.slice(0, 5).map((consultation: any, index: number) => (
              <div key={index} className="border border-slate-200 rounded p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-slate-900">{consultation.chiefComplaint}</span>
                    <span className="text-slate-600 text-xs block">{consultation.date} at {consultation.time}</span>
                  </div>
                  <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">
                    {consultation.diagnosis}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No consultations recorded</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t-2 border-slate-200">
        <div className="flex justify-between items-end">
          <div className="text-xs text-slate-500">
            <p>Generated: {new Date().toLocaleString()}</p>
            <p className="mt-2">Powered by MediCare EMR System</p>
          </div>
            <div className="text-center w-48">
              <div className="h-12 border-b-2 border-slate-300 mb-1"></div>
              <p className="text-sm font-bold text-slate-800 border-t border-slate-300 pt-1">{doctor.name}</p>
              <p className="text-xs text-slate-600">Authorized Signatory</p>
            </div>
        </div>
      </div>
    </div>
  );
}
