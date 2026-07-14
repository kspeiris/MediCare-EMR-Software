import { Consultation, Patient, DoctorProfile } from '@/services/db';

interface ConsultationPrintProps {
  consultation: Consultation;
  patient: Patient | undefined;
  doctor: DoctorProfile;
}

export function ConsultationPrintTemplate({ consultation, patient, doctor }: ConsultationPrintProps) {
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
          Clinical Consultation Report
        </h2>
      </div>

      {/* Patient & Visit Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-1">
          Visit Information
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
            <span className="ml-2 font-semibold text-slate-900">{consultation.patientId}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Age / Gender:</span>
            <span className="ml-2 font-semibold text-slate-900">
              {patient ? `${age} yrs / ${patient.gender}` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Consultation ID:</span>
            <span className="ml-2 font-semibold text-slate-900">{consultation.id}</span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Date & Time:</span>
            <span className="ml-2 font-semibold text-slate-900">
              {consultation.date} at {consultation.time}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Physician:</span>
            <span className="ml-2 font-semibold text-slate-900">{doctor.name}</span>
          </div>
        </div>
      </div>

      {/* Clinical Details */}
      <div className="mb-6 space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 border-b border-slate-200 pb-1">
            Chief Complaint
          </h3>
          <p className="text-sm text-slate-800">{consultation.chiefComplaint}</p>
        </div>

        {consultation.historyOfPresentIllness && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 border-b border-slate-200 pb-1">
              History of Present Illness
            </h3>
            <p className="text-sm text-slate-800">{consultation.historyOfPresentIllness}</p>
          </div>
        )}

        {consultation.physicalExamination && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 border-b border-slate-200 pb-1">
              Physical Examination
            </h3>
            <p className="text-sm text-slate-800">{consultation.physicalExamination}</p>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 border-b border-slate-200 pb-1">
            Clinical Diagnosis
          </h3>
          <p className="text-sm font-semibold text-slate-900">{consultation.diagnosis}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 border-b border-slate-200 pb-1">
            Vitals
          </h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600 text-xs block">Blood Pressure</span>
              <span className="font-semibold text-slate-900">{consultation.vitals?.bloodPressure || 'N/A'} mmHg</span>
            </div>
            <div>
              <span className="text-slate-600 text-xs block">Temperature</span>
              <span className="font-semibold text-slate-900">{consultation.vitals?.temperature || 'N/A'} °F</span>
            </div>
            <div>
              <span className="text-slate-600 text-xs block">Pulse</span>
              <span className="font-semibold text-slate-900">{consultation.vitals?.pulseRate || 'N/A'} bpm</span>
            </div>
            <div>
              <span className="text-slate-600 text-xs block">SpO2</span>
              <span className="font-semibold text-slate-900">{consultation.vitals?.oxygenSaturation || 'N/A'}%</span>
            </div>
          </div>
        </div>

        {consultation.treatmentPlan && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 border-b border-slate-200 pb-1">
              Treatment Plan
            </h3>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{consultation.treatmentPlan}</p>
          </div>
        )}

        {consultation.clinicalNotes && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 border-b border-slate-200 pb-1">
              Clinical Notes
            </h3>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{consultation.clinicalNotes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t-2 border-slate-200">
        <div className="flex justify-between items-end">
          <div className="text-xs text-slate-500">
            <p>Consultation ID: {consultation.id}</p>
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
