import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search } from 'lucide-react';
import { db, Consultation } from '@/services/db';
import { Link } from 'react-router-dom';

export function Consultations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<Consultation | null>(null);

  const consultations = db.getConsultations();
  const patients = db.getPatients();
  const doc = db.getDoctorProfile();

  const enrichedConsultations = useMemo(() => {
    return consultations.map(c => {
      const patient = patients.find(p => p.id === c.patientId);
      return {
        ...c,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        physician: doc.name
      };
    });
  }, [consultations, patients, doc]);

  const filteredVisits = useMemo(() => {
    if (!searchQuery) return enrichedConsultations;
    const query = searchQuery.toLowerCase();
    return enrichedConsultations.filter(v => 
      v.patientName.toLowerCase().includes(query) || 
      v.id.toLowerCase().includes(query) ||
      v.diagnosis.toLowerCase().includes(query) ||
      v.physician.toLowerCase().includes(query)
    );
  }, [enrichedConsultations, searchQuery]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Consultation Logs</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium font-sans">View history of clinical examinations and diagnoses.</p>
        </div>
      </div>

      <Modal isOpen={!!selectedVisit} onClose={() => setSelectedVisit(null)} title="Consultation Details">
        {selectedVisit && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-md border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {patients.find(p => p.id === selectedVisit.patientId)?.firstName} {patients.find(p => p.id === selectedVisit.patientId)?.lastName}
                  </h4>
                  <p className="text-[12px] text-slate-400">ID: {selectedVisit.id} • {selectedVisit.date} {selectedVisit.time}</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="space-y-2 text-[13px] text-slate-700 dark:text-slate-350">
                <p><strong>Chief Complaint:</strong> {selectedVisit.chiefComplaint}</p>
                <p><strong>Diagnosis:</strong> {selectedVisit.diagnosis}</p>
                {selectedVisit.vitals && (
                  <p className="text-[12px] text-slate-500">
                    <strong>Vitals:</strong> BP: {selectedVisit.vitals.bloodPressure} | Temp: {selectedVisit.vitals.temperature}°F | Pulse: {selectedVisit.vitals.pulseRate}bpm | SpO2: {selectedVisit.vitals.oxygenSaturation}%
                  </p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white mb-2">Clinical Plan & Notes</h4>
              <p className="text-[12px] text-slate-650 dark:text-slate-400 bg-white dark:bg-slate-950 p-3 rounded border border-slate-100 dark:border-slate-850 leading-relaxed">
                {selectedVisit.treatmentPlan || 'No plan details added.'}
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setSelectedVisit(null)} className="bg-slate-900 dark:bg-sky-600 text-white px-4 py-2 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors font-semibold">Close</button>
            </div>
          </div>
        )}
      </Modal>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Recent Consultations</h3>
          <div className="flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search consultations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Patient Name</Th>
              <Th>Visit ID</Th>
              <Th>Date</Th>
              <Th>Diagnosis</Th>
              <Th>Physician</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit) => (
              <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Td className="font-semibold text-slate-700 dark:text-slate-350">{visit.patientName}</Td>
                <Td className="text-slate-500">#{visit.id}</Td>
                <Td>{visit.date} {visit.time}</Td>
                <Td>{visit.diagnosis}</Td>
                <Td>{visit.physician}</Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedVisit(visit)}
                      className="text-sky-500 hover:text-sky-655 font-semibold text-[12px]"
                    >
                      View Details
                    </button>
                    <Link to={`/patients/${visit.patientId}`} className="text-slate-400 hover:text-slate-600 font-semibold text-[12px]">Profile</Link>
                  </div>
                </Td>
              </tr>
            ))}
            {filteredVisits.length === 0 && (
              <tr>
                <Td colSpan={6} className="text-center py-8 text-slate-500 text-[13px]">
                  No consultations found.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

