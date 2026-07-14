import { Book, LifeBuoy, Keyboard, Info, FileText } from 'lucide-react';

export function Help() {
  return (
    <div className="p-5 space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Help & Documentation</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-455 mt-1">Resources and guides for using the MediCare EMR system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Guide */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:border-sky-300 dark:hover:border-sky-500 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/50 rounded-lg flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 transition-colors">
            <Book size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">User Guide</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">Complete manual on how to use all features including patient management, inventory, and reports.</p>
          <span className="text-[12px] font-medium text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300">Read Documentation →</span>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:border-sky-300 dark:hover:border-sky-500 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <LifeBuoy size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">FAQs</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">Frequently asked questions about database backups, setting configurations, and general troubleshooting.</p>
          <span className="text-[12px] font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">View FAQs →</span>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:border-sky-300 dark:hover:border-sky-500 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <Keyboard size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Keyboard Shortcuts</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">Learn how to navigate the application faster using global keyboard shortcuts.</p>
          <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">See Shortcuts →</span>
        </div>

        {/* License & About */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:border-sky-300 dark:hover:border-sky-500 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/50 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <Info size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">License & About</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">View application version, license information, terms of service, and privacy policies.</p>
          <span className="text-[12px] font-medium text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300">View Details →</span>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 p-5 mt-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Need direct support?</h3>
        <p className="text-[13px] text-slate-650 dark:text-slate-400 mb-4">If you cannot find the answer in the documentation, our support team is available to assist you with critical issues.</p>
        <button className="bg-slate-900 dark:bg-sky-600 text-white px-4 py-2 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors font-medium">Contact Support</button>
      </div>
    </div>
  );
}
