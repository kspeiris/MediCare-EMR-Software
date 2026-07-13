import { Book, LifeBuoy, Keyboard, Info, FileText } from 'lucide-react';

export function Help() {
  return (
    <div className="p-5 space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Help & Documentation</h2>
          <p className="text-[13px] text-slate-500 mt-1">Resources and guides for using the MediCare EMR system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Guide */}
        <div className="bg-white rounded-md border border-slate-200 p-5 hover:border-sky-300 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 mb-4 group-hover:bg-sky-100 transition-colors">
            <Book size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">User Guide</h3>
          <p className="text-[13px] text-slate-500 mb-4">Complete manual on how to use all features including patient management, inventory, and reports.</p>
          <span className="text-[12px] font-medium text-sky-600 group-hover:text-sky-700">Read Documentation →</span>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-md border border-slate-200 p-5 hover:border-sky-300 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-100 transition-colors">
            <LifeBuoy size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">FAQs</h3>
          <p className="text-[13px] text-slate-500 mb-4">Frequently asked questions about database backups, setting configurations, and general troubleshooting.</p>
          <span className="text-[12px] font-medium text-indigo-600 group-hover:text-indigo-700">View FAQs →</span>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white rounded-md border border-slate-200 p-5 hover:border-sky-300 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-100 transition-colors">
            <Keyboard size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Keyboard Shortcuts</h3>
          <p className="text-[13px] text-slate-500 mb-4">Learn how to navigate the application faster using global keyboard shortcuts.</p>
          <span className="text-[12px] font-medium text-emerald-600 group-hover:text-emerald-700">See Shortcuts →</span>
        </div>

        {/* License & About */}
        <div className="bg-white rounded-md border border-slate-200 p-5 hover:border-sky-300 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-100 transition-colors">
            <Info size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">License & About</h3>
          <p className="text-[13px] text-slate-500 mb-4">View application version, license information, terms of service, and privacy policies.</p>
          <span className="text-[12px] font-medium text-amber-600 group-hover:text-amber-700">View Details →</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-md border border-slate-200 p-5 mt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Need direct support?</h3>
        <p className="text-[13px] text-slate-600 mb-4">If you cannot find the answer in the documentation, our support team is available to assist you with critical issues.</p>
        <button className="bg-slate-900 text-white px-4 py-2 rounded text-[12px] hover:bg-slate-800 transition-colors font-medium">Contact Support</button>
      </div>
    </div>
  );
}
