import { useState } from 'react';
import { CheckCircle2, Loader2, Download, Upload, AlertCircle } from 'lucide-react';
import { db } from '@/services/db';

export function Backup() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupComplete, setBackupComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleExportBackup = () => {
    setIsBackingUp(true);
    setBackupComplete(false);
    setErrorMessage('');
    setSuccessMessage('');

    setTimeout(() => {
      try {
        const dataStr = db.exportBackup();
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const dateStr = new Date().toISOString().split('T')[0];
        const exportFileDefaultName = `medicare_emr_backup_${dateStr}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        setIsBackingUp(false);
        setBackupComplete(true);
        db.logActivity('System Backup', 'User exported a full system database backup JSON file.');
      } catch (err) {
        setIsBackingUp(false);
        setErrorMessage('Failed to generate EMR backup file.');
      }
    }, 1200);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setSuccessMessage('');

    fileReader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const success = db.restoreBackup(result);
        if (success) {
          setSuccessMessage('EMR Database restored successfully! Reloading...');
          db.logActivity('System Restore', `Successfully restored EMR database from backup file: ${file.name}`);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setErrorMessage('Invalid EMR backup file format.');
        }
      } catch (err) {
        setErrorMessage('Error reading or parsing the backup file.');
      }
    };
    fileReader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Database Backup & Restore</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Securely download your patient records database or restore from a JSON backup file.</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-250 text-red-800 text-xs font-semibold rounded flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
           <div>
             <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
               <Download size={16} className="text-sky-500" /> Export System Backup
             </h3>
             <p className="text-[12px] text-slate-500 leading-relaxed mb-6 font-medium">
               Creates a secure, offline JSON file containing all patient registries, clinical consultation histories, prescriptions, certificates, and appointments.
             </p>
           </div>
           
           {backupComplete ? (
             <div className="bg-emerald-55 text-emerald-700 border border-emerald-200 px-3 py-2 rounded text-[12px] flex items-center justify-center gap-2 font-semibold w-full">
               <CheckCircle2 size={16} /> Backup Downloaded Successfully
             </div>
           ) : (
             <button 
               onClick={handleExportBackup}
               disabled={isBackingUp}
               className="bg-slate-900 dark:bg-sky-600 text-white px-3 py-2 rounded text-[12px] hover:bg-slate-800 dark:hover:bg-sky-700 transition-colors w-full flex items-center justify-center gap-2 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isBackingUp ? (
                 <><Loader2 size={14} className="animate-spin" /> Preparing backup...</>
               ) : (
                 "Download EMR Backup (JSON)"
               )}
             </button>
           )}
        </div>

        {/* Import Card */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
           <div>
             <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
               <Upload size={16} className="text-sky-500" /> Restore Database
             </h3>
             <p className="text-[12px] text-slate-500 leading-relaxed mb-6 font-medium">
               Upload a previously generated `.json` backup file. This will restore the EMR system to that exact point in time. 
               <span className="text-red-550 dark:text-red-400 font-bold block mt-1">Warning: This will overwrite your current offline clinic records!</span>
             </p>
           </div>
           <input type="file" id="backup-file" accept=".json" className="hidden" onChange={handleImportBackup} />
           <button 
             onClick={() => document.getElementById('backup-file')?.click()}
             className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-3 py-2 rounded text-[12px] transition-colors w-full font-bold text-center"
           >
             Select & Import Backup File
           </button>
        </div>
      </div>
    </div>
  );
}
