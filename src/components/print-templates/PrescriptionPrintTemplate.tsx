import { Prescription, Patient, DoctorProfile } from '@/services/db';

interface PrescriptionPrintProps {
  prescription: Prescription;
  patient: Patient | undefined;
  doctor: DoctorProfile;
}

export function PrescriptionPrintTemplate({ prescription, patient, doctor }: PrescriptionPrintProps) {
  const age = patient ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A';

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
            <p className="text-xs text-slate-600">{doctor.specialization}</p>
            <p className="text-xs text-slate-600 font-semibold">Reg: {doctor.regNumber}</p>
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-200 pb-2 inline-block px-8">
          Medical Prescription
        </h2>
      </div>

      {/* Patient Information */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">
          Patient Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600 font-medium">Patient Name:</span>
            <span className="ml-2 font-semibold text-slate-900">
              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Patient ID:</span>
            <span className="ml-2 font-semibold text-slate-900">{prescription.patientId}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Age / Gender:</span>
            <span className="ml-2 font-semibold text-slate-900">
              {patient ? `${age} yrs / ${patient.gender}` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Date:</span>
            <span className="ml-2 font-semibold text-slate-900">{prescription.date}</span>
          </div>
        </div>
      </div>

      {/* Prescription Details */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">
          Prescribed Medications
        </h3>
        <div className="space-y-4">
          {prescription.medicines.map((medicine, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-4">
                <div className="text-2xl font-bold text-sky-600 font-serif">Rx</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {medicine.name} {medicine.strength && <span className="text-slate-600">({medicine.strength})</span>}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-600">Dosage:</span>
                      <span className="ml-2 font-medium">{medicine.dosage || 'As directed'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Frequency:</span>
                      <span className="ml-2 font-medium">{medicine.frequency}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Duration:</span>
                      <span className="ml-2 font-medium">{medicine.duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Route:</span>
                      <span className="ml-2 font-medium">{medicine.route}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Quantity:</span>
                      <span className="ml-2 font-medium">{medicine.quantity}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Instructions:</span>
                      <span className="ml-2 font-medium">{medicine.instructions || 'As directed'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t-2 border-slate-200">
        <div className="flex justify-between items-end">
          <div className="text-xs text-slate-500">
            <p>Prescription ID: {prescription.id}</p>
            <p>Generated: {new Date().toLocaleString()}</p>
            <p className="mt-2">Powered by MediCare EMR System</p>
          </div>
          <div className="text-center w-48">
            {doctor.signature ? (
              <img src={doctor.signature} alt="Signature" className="h-12 mx-auto object-contain mb-1" />
            ) : (
              <div className="h-12 border-b-2 border-slate-300 mb-1"></div>
            )}
            <p className="text-sm font-bold text-slate-800 border-t border-slate-300 pt-1">{doctor.name}</p>
            <p className="text-xs text-slate-600">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
