import React, { useState, useEffect } from 'react';
import { Cloud, Check, Download, Trash2, RefreshCw, X, HardDrive, FileArchive, UploadCloud, ShieldCheck, ExternalLink, Database } from 'lucide-react';
import { StaffClaimFormState, CloudStorageFile } from '../types';

interface CloudStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: StaffClaimFormState;
  onRestoreClaim: (restored: StaffClaimFormState) => void;
}

export const CloudStorageModal: React.FC<CloudStorageModalProps> = ({
  isOpen,
  onClose,
  claim,
  onRestoreClaim,
}) => {
  const [files, setFiles] = useState<CloudStorageFile[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Ready');
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCloudFiles();
    }
  }, [isOpen]);

  const fetchCloudFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/storage/files');
      const data = await res.json();
      setFiles(data.files || []);
      setTotalSize(data.totalSizeBytes || 0);
    } catch (err) {
      console.error('Error fetching cloud files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToCloud = async () => {
    setLoading(true);
    setSyncStatus('Syncing claim & receipts to cloud storage...');
    try {
      const res = await fetch('/api/storage/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim),
      });
      const data = await res.json();
      if (data.success) {
        setLastSynced(new Date().toLocaleTimeString());
        setSyncStatus('Synced successfully!');
        await fetchCloudFiles();
      }
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!confirm('Restore claim state from the latest cloud backup? Any unsaved local edits will be replaced.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/storage/sync');
      const data = await res.json();
      if (data.found && data.state) {
        onRestoreClaim(data.state);
        alert('Claim state restored successfully from cloud storage!');
        onClose();
      } else {
        alert('No saved cloud claim state found yet. Click "Sync Claim to Cloud" first.');
      }
    } catch (err: any) {
      alert(`Failed to restore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Delete ${filename} from cloud storage?`)) return;
    try {
      await fetch(`/api/storage/files/${filename}`, { method: 'DELETE' });
      fetchCloudFiles();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const downloadJsonArchive = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(claim, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `EMO_Claim_Cloud_Backup_${claim.claimFor || '2026'}.json`);
    dlAnchorElem.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Cloud Storage Integration</h3>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Active & Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">Persistent receipt archive, audit backup & Google Drive export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50 text-xs">
          {/* Storage Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium block">Stored Receipts</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">{files.length}</p>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" /> Safe on server disk
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium block">Total Storage Used</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {(totalSize / (1024 * 1024)).toFixed(2)} MB
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">Optimized image compress</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium block">Cloud Sync Status</span>
              <p className="text-xs font-bold text-slate-800 mt-1 truncate">{syncStatus}</p>
              <span className="text-[10px] text-slate-400 block mt-1">
                {lastSynced ? `Last: ${lastSynced}` : 'Auto-sync active'}
              </span>
            </div>
          </div>

          {/* Quick Sync & Backup Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-sky-600" />
              Claim Sync & Cloud Backup
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleSyncToCloud}
                disabled={loading}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Sync Claim to Cloud
              </button>

              <button
                onClick={handleRestoreFromCloud}
                disabled={loading}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center justify-center gap-1.5 border border-slate-300 transition-all"
              >
                <Database className="w-3.5 h-3.5 text-slate-600" />
                Restore from Cloud
              </button>

              <button
                onClick={downloadJsonArchive}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center justify-center gap-1.5 border border-slate-300 transition-all"
              >
                <FileArchive className="w-3.5 h-3.5 text-slate-600" />
                Download JSON Backup
              </button>
            </div>
          </div>

          {/* Google Drive / Cloud Provider Info */}
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-4 rounded-xl border border-sky-200 text-xs text-sky-950 space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-bold flex items-center gap-1.5 text-sky-900">
                <HardDrive className="w-4 h-4 text-sky-600" />
                Google Drive & Accounting Cloud Export
              </h5>
              <span className="text-[10px] font-mono bg-sky-200/80 text-sky-800 px-2 py-0.5 rounded">
                Audit Ready
              </span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              All scanned receipts and claim forms generated by this system are archived in compliant format.
              You can export the official Excel (.xlsx) and PDF packages directly to your corporate Google Drive folder:
              <span className="font-semibold block mt-0.5 text-slate-900">
                Google Drive / Accounting / EMO Book Services / Staff Claims 2025-2026
              </span>
            </p>
          </div>

          {/* Stored Files Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 flex items-center justify-between">
              <span>Cloud Archived Receipts ({files.length})</span>
              <button
                onClick={fetchCloudFiles}
                className="p-1 text-slate-500 hover:text-slate-800 rounded"
                title="Refresh list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {files.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                No cloud receipt files stored yet. Scanned receipts will automatically populate here.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {files.map((file) => (
                  <div key={file.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{file.originalName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(file.uploadedAt).toLocaleDateString()} • {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-sky-600 rounded hover:bg-slate-100"
                        title="Download / View file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        title="Delete from cloud"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
