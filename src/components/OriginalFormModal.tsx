import React from 'react';
import { X, FileText, ExternalLink, Download } from 'lucide-react';

interface OriginalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalFormModal: React.FC<OriginalFormModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const pdfPath = '/assets/aistudio/Staff_Claim_Form_2025_6e48f28b.pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">EMO Book Services - Staff Claim Form 2025</h3>
              <p className="text-xs text-slate-500">Official template reference with exact 'CODE' column categories</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open In Tab
            </a>
            <a
              href={pdfPath}
              download="Staff_Claim_Form_2025.pdf"
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Embed */}
        <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex flex-col">
          <iframe
            src={pdfPath}
            title="Official Staff Claim Form"
            className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
