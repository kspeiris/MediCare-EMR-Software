import { Book, LifeBuoy, Keyboard, Info } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Link } from 'react-router-dom';

export function Help() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="p-5 space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Help & Documentation</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Resources and guides for using the MediCare EMR system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveModal('guide')}
          className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/50 rounded-lg flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4">
            <Book size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-sky-500 transition-colors">User Guide</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">Complete manual on how to use all features including patient management, consultations, and reports.</p>
          <span className="text-[12px] font-medium text-sky-600 dark:text-sky-400">Read Documentation →</span>
        </div>

        <div 
          onClick={() => setActiveModal('faq')}
          className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <LifeBuoy size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">FAQs</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">Frequently asked questions about database backups, setting configurations, and general troubleshooting.</p>
          <span className="text-[12px] font-medium text-indigo-600 dark:text-indigo-400">View FAQs →</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:shadow-md transition-all group"
          onClick={() => setActiveModal('shortcuts')}>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <Keyboard size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-500 transition-colors">Keyboard Shortcuts</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">Learn how to navigate the application faster using global keyboard shortcuts.</p>
          <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">See Shortcuts →</span>
        </div>

        <Link to="/settings" className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/50 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
            <Info size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-amber-500 transition-colors">License & About</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">View application version, license information, terms of service, and privacy policies in Settings.</p>
          <span className="text-[12px] font-medium text-amber-600 dark:text-amber-400">View Details →</span>
        </Link>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 p-5 mt-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Need direct support?</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">If you cannot find the answer in the documentation, our support team is available to assist you with critical issues.</p>
        <button 
          onClick={() => alert("Support ticket opened! We will respond to you shortly via contact@medicareclinic.com.")}
          className="bg-slate-900 dark:bg-sky-600 text-white px-4 py-2 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors font-medium"
        >
          Contact Support
        </button>
      </div>

      <Modal isOpen={activeModal === 'guide'} onClose={() => setActiveModal(null)} title="User Guide & System Manual">
        <div className="space-y-3 text-[13px] text-slate-650 dark:text-slate-300 max-h-[400px] overflow-y-auto pr-1">
          <p className="font-semibold text-slate-950 dark:text-white">1. Patient Registration</p>
          <p>Navigate to <strong>Patients</strong> and click <strong>+ Register Patient</strong>. Provide demographic info and initial medical history.</p>
          <p className="font-semibold text-slate-950 dark:text-white">2. Consultations & Vitals</p>
          <p>Open a patient profile, click <strong>Start Consultation</strong>. Fill in chief complaints, check vitals, and add clinical notes.</p>
          <p className="font-semibold text-slate-950 dark:text-white">3. Prescriptions</p>
          <p>Create prescriptions directly from a consultation. The system will automatically check for known allergies.</p>
          <p className="font-semibold text-slate-950 dark:text-white">4. Reports</p>
          <p>View analytics on the Reports page. Export CSV summaries or generate PDF reports for clinic records.</p>
          <p className="font-semibold text-slate-950 dark:text-white">5. Backup</p>
          <p>Regularly export JSON backups from the Backup page. Store them securely on your device or cloud storage.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'faq'} onClose={() => setActiveModal(null)} title="Frequently Asked Questions">
        <div className="space-y-3 text-[13px] text-slate-650 dark:text-slate-300 max-h-[400px] overflow-y-auto pr-1">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Q: How do backups work in the desktop container?</p>
            <p className="mt-1">A: Go to <strong>Backup</strong>. In desktop mode, saving backups writes directly to your local file system, and imports let you restore state using selected JSON backup files.</p>
          </div>
          <hr className="border-slate-100 dark:border-slate-800" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Q: Where is my EMR database stored?</p>
            <p className="mt-1">A: The EMR database persists local state in the app data directory as an `emr.db` JSON file when running as a desktop app, and in browser localStorage when running in a browser.</p>
          </div>
          <hr className="border-slate-100 dark:border-slate-800" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Q: Is my data encrypted?</p>
            <p className="mt-1">A: The current version stores data in JSON format. For sensitive deployments, ensure your operating system disk encryption is enabled and use strong passwords in Settings.</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'shortcuts'} onClose={() => setActiveModal(null)} title="Keyboard Shortcuts Navigation">
        <div className="space-y-3 text-[13px] text-slate-650 dark:text-slate-300">
           <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
             <span>Navigation</span>
            <div className="flex gap-2">
              <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[11px] font-mono">Alt</kbd>
              <span className="text-slate-500">+</span>
              <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[11px] font-mono">1-9</kbd>
            </div>
          </div>
           <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
             <span>Toggle Dark/Light Mode</span>
            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[11px] font-mono">Ctrl+D</kbd>
          </div>
           <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
             <span>Quick Logout</span>
            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[11px] font-mono">Ctrl+L</kbd>
          </div>
           <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
             <span>Dismiss Dialog / Modal</span>
            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[11px] font-mono">ESC</kbd>
          </div>
        </div>
      </Modal>
    </div>
  );
}
