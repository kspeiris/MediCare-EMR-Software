import { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, FileText, Image, File, Film } from 'lucide-react';
import { MedicalDocument, Referral } from '@/services/db';

interface UnifiedAttachment {
  attachmentType: 'document' | 'referral';
  name: string;
  type: string;
  fileData: string;
  date: string;
  id: string;
}

interface AttachmentViewerProps {
  documents: MedicalDocument[];
  referrals: Referral[];
  onClose: () => void;
  onUploadClick?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Laboratory Reports': <FileText size={16} />,
  'X-ray Reports': <Image size={16} />,
  'MRI Reports': <Film size={16} />,
  'ECG Reports': <File size={16} />,
  'Ultrasound Reports': <Image size={16} />,
  'Other Documents': <File size={16} />
};

export function AttachmentViewer({ documents, referrals, onClose, onUploadClick }: AttachmentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [currentDoc, setCurrentDoc] = useState<MedicalDocument | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const handleDocClick = (doc: MedicalDocument) => {
    setCurrentDoc(doc);
    setZoom(1);
  };

  const handleClose = () => {
    setCurrentDoc(null);
    onClose();
  };

  const isImage = (dataUrl: string) => {
    return dataUrl.startsWith('data:image');
  };

  const isPdf = (dataUrl: string) => {
    return dataUrl.startsWith('data:application/pdf');
  };

  if (currentDoc) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {CATEGORY_ICONS[currentDoc.type] || <FileText size={18} />}
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white truncate">{currentDoc.name}</h3>
              <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{currentDoc.type}</span>
            </div>
            <div className="flex items-center gap-2">
              {isImage(currentDoc.fileData) && (
                <>
                  <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <ZoomIn size={16} />
                  </button>
                  <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <ZoomOut size={16} />
                  </button>
                </>
              )}
              <a href={currentDoc.fileData} download={currentDoc.name} className="p-1.5 text-sky-500 hover:text-sky-700">
                <Download size={16} />
              </a>
              <button onClick={handleClose} className="p-1.5 text-slate-500 hover:text-red-600">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100 dark:bg-slate-950">
            {isImage(currentDoc.fileData) ? (
              <img
                src={currentDoc.fileData}
                alt={currentDoc.name}
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : isPdf(currentDoc.fileData) ? (
              <iframe
                src={currentDoc.fileData}
                title={currentDoc.name}
                className="w-full h-[70vh] rounded border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-600 dark:text-slate-300 mb-4">Preview not available for this file type.</p>
                <a
                  href={currentDoc.fileData}
                  download={currentDoc.name}
                  className="bg-sky-500 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-sky-600 inline-flex items-center gap-1"
                >
                  <Download size={14} /> Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const allAttachments: UnifiedAttachment[] = [
    ...documents.map(d => ({ ...d, attachmentType: 'document' as const, date: d.uploadDate })),
    ...referrals.map(r => ({ ...r, attachmentType: 'referral' as const, name: `Referral to ${r.specialistName}`, type: 'Referral', fileData: '', date: r.date }))
  ];

  const categories = Array.from(new Set(documents.map(d => d.type)));
  const filtered = filter === 'all' ? allAttachments : allAttachments.filter(a => a.type === filter || (filter === 'referrals' && a.attachmentType === 'referral'));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">Attachments</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-[10px] border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All</option>
            <option value="referrals">Referrals</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="text-sky-500 hover:text-sky-700 text-[11px] font-semibold cursor-pointer"
            >
              + Upload
            </button>
          )}
        </div>
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtered.map((att, idx) => (
            <button
              key={idx}
              onClick={() => att.attachmentType === 'document' && handleDocClick(att as unknown as MedicalDocument)}
              disabled={att.attachmentType === 'referral'}
              className={`p-3 rounded border text-left transition-colors ${
                att.attachmentType === 'referral'
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900 cursor-default'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-sky-300 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-400">
                  {att.type === 'Referral' ? <File size={14} /> : (CATEGORY_ICONS[att.type] || <FileText size={14} />)}
                </span>
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">{att.name}</span>
              </div>
              <div className="text-[10px] text-slate-500">{att.type}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{att.date}</div>
              {att.fileData && (
                <span className="inline-block mt-1 text-[9px] bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-900">
                  {isImage(att.fileData) ? 'Image' : isPdf(att.fileData) ? 'PDF' : 'File'}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <span className="text-slate-400 text-xs">No attachments found.</span>
      )}
    </div>
  );
}
