import { Table, Th, Td } from '@/components/ui/Table';
import { useState, useMemo } from 'react';
import { Search, ShieldAlert, Trash2 } from 'lucide-react';
import { db, ActivityLog as EMRActivityLog } from '@/services/db';

export function ActivityLog() {
  const [logs, setLogs] = useState<EMRActivityLog[]>(() => db.getActivityLogs());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log => 
      log.action.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query) ||
      log.createdAt.toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to permanently clear the audit logs? This action is recorded.")) {
      db.clearActivityLogs();
      db.logActivity('Audit Logs Cleared', 'The user cleared all prior clinical activity logs.');
      setLogs(db.getActivityLogs());
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldAlert className="text-sky-500" size={18} />
            EMR Audit Activity Log
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Trace security actions, patient record updates, backups, and restores.</p>
        </div>
        <button 
          onClick={handleClearLogs}
          className="bg-red-50 hover:bg-red-100 text-red-650 px-3 py-1.5 border border-red-200 rounded text-[12px] font-semibold flex items-center gap-1 transition-all"
        >
          <Trash2 size={13} />
          Clear Audit Trails
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white font-sans">Security Audit Trail</h3>
          <div className="flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search audit logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-[12px] w-64 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Timestamp</Th>
              <Th>Action Event</Th>
              <Th>Details / Remarks</Th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Td className="text-slate-450 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">{log.createdAt}</Td>
                  <Td className="font-semibold text-slate-700 dark:text-slate-350">{log.action}</Td>
                  <Td className="text-slate-600 dark:text-slate-400 text-[12px]">{log.description}</Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={3} className="text-center py-8 text-slate-500 text-[13px]">
                  No audit logs recorded.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
