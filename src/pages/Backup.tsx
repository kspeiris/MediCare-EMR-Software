import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Download, Upload, AlertCircle } from 'lucide-react';
import { db } from '@/services/db';
import { getLocalDate } from '@/lib/dates';
import { onDbChange } from '@/services/db';

export function Backup() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupComplete, setBackupComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [restorePreview, setRestorePreview] = useState<{ schemaVersion: string; exportedAt: string; patients: number; consultations: number } | null>(null);
  const [pendingRestoreContent, setPendingRestoreContent] = useState('');
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    const unsub = onDbChange('patients:changed', () => setRefreshTick(t => t + 1));
    return unsub;
  }, []);

  const handleExportBackup = async () => {
    setIsBackingUp(true);
    setBackupComplete(false);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const dataStr = await db.exportBackup();
      const fileName = `medicare_emr_backup_${getLocalDate()}.json`;

      if (typeof window !== 'undefined' && window.electronAPI?.isDesktop) {
        const result = await window.electronAPI.backup.save(dataStr);
        if (result.success) {
          setBackupComplete(true);
          db.logActivity('System Backup', `User exported backup to ${result.path}`);
        } else if (!result.cancelled) {
          setErrorMessage(result.error || 'Failed to save backup file.');
        }
      } else {
        setTimeout(() => {
          const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', fileName);
          document.body.appendChild(linkElement);
          linkElement.click();
          document.body.removeChild(linkElement);
          setIsBackingUp(false);
          setBackupComplete(true);
          db.logActivity('System Backup', 'User exported a full system database backup JSON file.');
        }, 800);
        return;
      }
    } catch (err) {
      setErrorMessage('Failed to generate EMR backup file.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const readRestoreFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setSuccessMessage('');
    setRestorePreview(null);
    setPendingRestoreContent('');

    try {
      let content: string;
      if (typeof window !== 'undefined' && window.electronAPI?.isDesktop) {
        content = await readRestoreFile(file);
      } else {
        content = await readRestoreFile(file);
      }

      const parsed = JSON.parse(content);
      if (!parsed.schemaVersion) {
        setErrorMessage('Invalid backup: missing schemaVersion.');
        e.target.value = '';
        return;
      }

      setRestorePreview({
        schemaVersion: parsed.schemaVersion,
        exportedAt: parsed.exportedAt || 'Unknown',
        patients: Array.isArray(parsed.patients) ? parsed.patients.length : 0,
        consultations: Array.isArray(parsed.consultations) ? parsed.consultations.length : 0
      });
      setPendingRestoreContent(content);
    } catch (err) {
      setErrorMessage('Error reading or parsing the backup file. Please select a valid JSON backup.');
    }
    e.target.value = '';
  };

  const confirmRestore = async () => {
    if (!pendingRestoreContent) return;

    const confirmed = window.confirm(
      `WARNING: You are about to restore a backup from ${restorePreview?.exportedAt || 'unknown date'}.\n\n` +
      `This will permanently REPLACE all current data including:\n` +
      `- ${restorePreview?.patients || 0} patients\n` +
      `- ${restorePreview?.consultations || 0} consultations\n\n` +
      `A safety backup of your current state will be created automatically.\n\n` +
      `Are you absolutely sure you want to proceed?`
    );
    if (!confirmed) {
      setRestorePreview(null);
      setPendingRestoreContent('');
      return;
    }

    try {
      await db.exportBackup();
      const response = await db.restoreBackup(pendingRestoreContent);
      if (response.success) {
        setSuccessMessage('EMR Database restored successfully! Reloading...');
        db.logActivity('System Restore', `Successfully restored EMR database from backup file.`);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setErrorMessage(response.error || 'Invalid EMR backup file format.');
      }
    } catch (err) {
      setErrorMessage('Error restoring backup file.');
    }
    setRestorePreview(null);
    setPendingRestoreContent('');
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

        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Upload size={16} className="text-sky-500" /> Restore Database
            </h3>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-6 font-medium">
              Upload a previously generated `.json` backup file. The system validates schema version before restoring.
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

          {restorePreview && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded">
              <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 mb-1">
                Backup detected (schema v{restorePreview.schemaVersion})
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-500 mb-2">
                Exported: {restorePreview.exportedAt} | Patients: {restorePreview.patients} | Consultations: {restorePreview.consultations}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmRestore}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-1.5 rounded"
                >
                  Confirm Restore
                </button>
                <button
                  onClick={() => { setRestorePreview(null); setPendingRestoreContent(''); }}
                  className="px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold py-1.5 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
