import { Table, Th, Td } from '@/components/ui/Table';
import { useState, useMemo, useEffect } from 'react';
import { Search, ShieldAlert } from 'lucide-react';
import { db, ActivityLog as EMRActivityLog } from '@/services/db';
import { onDbChange } from '@/services/db';

export function ActivityLog() {
  const [logs, setLogs] = useState<EMRActivityLog[]>(() => db.getActivityLogsSync());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = onDbChange('logs:changed', () => {
      setLogs(db.getActivityLogsSync());
    });
    return unsub;
  }, []);

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log =>
      log.action.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query) ||
      log.createdAt.toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldAlert className="text-sky-500" size={18} />
            EMR Audit Activity Log
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Trace security actions, patient record updates, backups, and restores. Cannot be cleared by users.</p>
        </div>
        <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded font-semibold">Read Only</span>
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
              <Th>User</Th>
              <Th>Action Event</Th>
              <Th>Details / Remarks</Th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Td className="text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">{log.createdAt}</Td>
                  <Td className="text-slate-600 dark:text-slate-300">{log.user || 'system'}</Td>
                  <Td className="font-semibold text-slate-700 dark:text-slate-300">{log.action}</Td>
                  <Td className="text-slate-600 dark:text-slate-400 text-[12px]">{log.description}</Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={4} className="text-center py-8 text-slate-500 text-[13px]">
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
