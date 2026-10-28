import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileDown,
  Cloud,
  FileText,
  Plus,
  Receipt,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building2,
  Shield,
  BookOpen,
  ArrowRight,
  ExternalLink,
  UserCheck,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { StaffClaimFormState, ReceiptItem, OFFICIAL_CLAIM_CODES } from './types';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import { SAMPLE_RECEIPT_PRESETS, renderReceiptCanvas } from './utils/sampleReceipts';
import { ScannerModal } from './components/ScannerModal';
import { ManualTransactionModal } from './components/ManualTransactionModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ClaimFormPreview } from './components/ClaimFormPreview';
import { ReceiptLedger } from './components/ReceiptLedger';
import { CloudStorageModal } from './components/CloudStorageModal';
import { OriginalFormModal } from './components/OriginalFormModal';
import { UserManagementModal } from './components/UserManagementModal';
import { UserAccount, getCurrentUser, setCurrentUser } from './services/authService';

// Initial preloaded claim with realistic Malaysian expenses
const INITIAL_CLAIM_STATE: StaffClaimFormState = {
  staffName: 'AHMAD ZULKIFLI BIN HASSAN',
  icNo: '940815-10-5823',
  claimFor: 'OCTOBER 2026',
  dateFrom: '2026-10-01',
  dateTo: '2026-10-31',
  supervisorName: 'K. S. CHONG',
  supervisorDate: '2026-10-31',
  directorName: 'EMILY TAN',
  directorDate: '',
  claimedDate: '2026-10-30',
  items: [
    {
      id: 'rcpt_preset_1',
      merchantName: 'STESEN MINYAK MESRA PETRONAS SUNWAY',
      receiptNumber: 'PET-8841920',
      date: '2026-10-22',
      amount: 55.40,
      taxAmount: 3.14,
      currency: 'RM',
      code: '920-0000',
      details: 'PETROL - RON95/DIESEL',
      remark: 'RON95 fuel for Klang delivery van',
      confidence: 'HIGH',
      imageUrl: renderReceiptCanvas(SAMPLE_RECEIPT_PRESETS[0]),
      cloudSynced: true,
      uploadedAt: '2026-10-22T14:32:10Z',
    },
    {
      id: 'rcpt_preset_2',
      merchantName: 'GRABCAR MALAYSIA SDN BHD',
      receiptNumber: 'A-981249912',
      date: '2026-10-23',
      amount: 34.00,
      currency: 'RM',
      code: '905-0001',
      details: 'TRAVELLING EXPENSES - GRAB, PUBLIC TRANSPORT',
      remark: 'Transport to KLCC Book Fair setup booth',
      confidence: 'HIGH',
      imageUrl: renderReceiptCanvas(SAMPLE_RECEIPT_PRESETS[1]),
      cloudSynced: true,
      uploadedAt: '2026-10-23T09:15:00Z',
    },
    {
      id: 'rcpt_preset_3',
      merchantName: 'SUNWAY PYRAMID AUTO-PAY PARKING',
      receiptNumber: 'SPY-PARK-04921',
      date: '2026-10-24',
      amount: 12.00,
      currency: 'RM',
      code: '921-0001',
      details: 'PARKING',
      remark: 'Client book review meeting parking',
      confidence: 'HIGH',
      imageUrl: renderReceiptCanvas(SAMPLE_RECEIPT_PRESETS[2]),
      cloudSynced: true,
      uploadedAt: '2026-10-24T15:30:00Z',
    },
    {
      id: 'rcpt_preset_4',
      merchantName: 'POPULAR BOOK CO. (M) SDN BHD',
      receiptNumber: 'POP-7729104',
      date: '2026-10-25',
      amount: 46.80,
      taxAmount: 2.65,
      currency: 'RM',
      code: '910-0000',
      details: 'PRINTING & STATIONERY',
      remark: 'A4 paper reams and accounting pens',
      confidence: 'HIGH',
      imageUrl: renderReceiptCanvas(SAMPLE_RECEIPT_PRESETS[4]),
      cloudSynced: true,
      uploadedAt: '2026-10-25T11:45:00Z',
    },
    {
      id: 'rcpt_preset_5',
      merchantName: 'J&T EXPRESS (M) SDN BHD',
      receiptNumber: 'JT-6029341108',
      date: '2026-10-26',
      amount: 28.50,
      currency: 'RM',
      code: '928-0000',
      details: 'COURIER CHARGES',
      remark: 'Courier dispatch for urgent textbook sample',
      confidence: 'HIGH',
      imageUrl: renderReceiptCanvas(SAMPLE_RECEIPT_PRESETS[3]),
      cloudSynced: true,
      uploadedAt: '2026-10-26T16:20:00Z',
    }
  ]
};

export default function App() {
  const [currentUser, setCurrentUserSession] = useState<UserAccount | null>(() => getCurrentUser());
  const [claim, setClaim] = useState<StaffClaimFormState>(() => {
    const saved = localStorage.getItem('emo_staff_claim_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const activeUser = getCurrentUser();
        if (activeUser) {
          parsed.staffName = activeUser.name;
          parsed.icNo = activeUser.icNo;
        }
        return parsed;
      } catch (e) {
        return INITIAL_CLAIM_STATE;
      }
    }
    const activeUser = getCurrentUser();
    if (activeUser) {
      return {
        ...INITIAL_CLAIM_STATE,
        staffName: activeUser.name,
        icNo: activeUser.icNo,
      };
    }
    return INITIAL_CLAIM_STATE;
  });

  const [activeTab, setActiveTab] = useState<'form' | 'receipts' | 'codes'>('form');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isCloudStorageOpen, setIsCloudStorageOpen] = useState(false);
  const [isOriginalFormOpen, setIsOriginalFormOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Persist locally
  useEffect(() => {
    localStorage.setItem('emo_staff_claim_state', JSON.stringify(claim));
  }, [claim]);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLoginUser = (user: UserAccount) => {
    setCurrentUserSession(user);
    setCurrentUser(user);
    setClaim(prev => ({
      ...prev,
      staffName: user.name,
      icNo: user.icNo,
    }));
    showNotice(`Logged in as ${user.name}. Claim Form prefilled with name & IC.`);
  };

  const handleAddReceipt = (item: ReceiptItem) => {
    setClaim(prev => ({
      ...prev,
      items: [item, ...prev.items],
    }));
    showNotice(`Added receipt: RM ${item.amount.toFixed(2)} categorized under [${item.code}]`);
  };

  const handleAddManualTransaction = (item: ReceiptItem) => {
    setClaim(prev => ({
      ...prev,
      items: [item, ...prev.items],
    }));
    showNotice(`Added manual transaction: RM ${item.amount.toFixed(2)} under [${item.code}]`);
  };

  const handleUpdateItem = (updated: ReceiptItem) => {
    setClaim(prev => ({
      ...prev,
      items: prev.items.map(i => (i.id === updated.id ? updated : i)),
    }));
    showNotice(`Updated receipt: ${updated.merchantName}`);
  };

  const handleDeleteItem = (id: string) => {
    setClaim(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
    }));
    showNotice('Receipt removed from claim');
  };

  const handleUpdateClaim = (fields: Partial<StaffClaimFormState>) => {
    setClaim(prev => ({
      ...prev,
      ...fields,
    }));
  };

  const handleExportExcel = () => {
    exportToExcel(claim);
    showNotice('Official Excel spreadsheet (.xlsx) downloaded successfully!');
  };

  const handleExportPDF = () => {
    exportToPDF(claim);
    showNotice('Official Staff Claim Form PDF generated with audit trail!');
  };

  const totalAmount = claim.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Brand Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Title */}
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-sm tracking-tighter px-2.5 py-1 rounded-lg shadow-sm">
                  EMO
                </div>
                <div className="ml-2.5">
                  <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5">
                    EMO ClaimScan & OCR
                    <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded uppercase">
                      2025 Form
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Staff Monthly Claim • EMO Book Services Sdn Bhd (679385-W)
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Main Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Grand Total Badge */}
              <div className="hidden md:flex flex-col items-end pr-2 border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Claimed
                </span>
                <span className="text-base font-extrabold text-orange-600 font-mono">
                  RM {totalAmount.toFixed(2)}
                </span>
              </div>

              {/* User Profile / Login Button */}
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {currentUser ? currentUser.name.charAt(0) : 'U'}
                </div>
                <span className="hidden sm:inline font-bold text-slate-800">
                  {currentUser ? currentUser.username : 'Sign In'}
                </span>
              </button>

              {/* View Original Form PDF Reference */}
              <button
                onClick={() => setIsOriginalFormOpen(true)}
                title="View original attachment form PDF"
                className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">Original Form</span>
              </button>

              {/* Google Sheets Online Sync Button */}
              <button
                onClick={() => setIsGoogleSheetsOpen(true)}
                title="Summarize and sync to online Google Sheet"
                className="px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span className="hidden md:inline">Google Sheets Sync</span>
              </button>

              {/* Cloud Storage Button */}
              <button
                onClick={() => setIsCloudStorageOpen(true)}
                title="Cloud storage and persistent backup"
                className="px-2.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Cloud Storage</span>
              </button>

              {/* Export Excel */}
              <button
                onClick={handleExportExcel}
                title="Download formatted Excel (.xlsx) matching claim form"
                className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden lg:inline">Excel</span>
              </button>

              {/* Export PDF */}
              <button
                onClick={handleExportPDF}
                title="Download official PDF Claim Form ready for signing"
                className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden lg:inline">PDF</span>
              </button>

              {/* Add Manual Transaction Button */}
              <button
                onClick={() => setIsManualModalOpen(true)}
                title="Add transaction without receipt"
                className="px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-amber-700" />
                <span className="hidden md:inline">No Receipt Entry</span>
              </button>

              {/* Scan Receipt Button */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3.5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Scan Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Subheader / Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 sm:space-x-4 py-2">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Official Claim Form ({OFFICIAL_CLAIM_CODES.length} Codes)
              </button>

              <button
                onClick={() => setActiveTab('receipts')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'receipts'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Transactions & Receipts ({claim.items.length})
              </button>

              <button
                onClick={() => setActiveTab('codes')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'codes'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Official Code Guide
              </button>
            </div>

            {/* Quick Helper Badge */}
            <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>User: {currentUser ? currentUser.name : 'Not Logged In'} (Auto-Prefilled)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {activeTab === 'form' && (
          <ClaimFormPreview
            claim={claim}
            onUpdateClaim={handleUpdateClaim}
            onOpenScanner={() => setIsScannerOpen(true)}
            onSelectReceipt={() => setActiveTab('receipts')}
          />
        )}

        {activeTab === 'receipts' && (
          <ReceiptLedger
            items={claim.items}
            onDeleteItem={handleDeleteItem}
            onUpdateItem={handleUpdateItem}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'codes' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Official 'CODE' Column Categorization Directory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exact expense codes extracted from EMO Book Services Staff Monthly Claim Form 2025
                </p>
              </div>
              <button
                onClick={() => setIsOriginalFormOpen(true)}
                className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"
              >
                Compare With Attachment PDF <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {OFFICIAL_CLAIM_CODES.map((item) => {
                const count = claim.items.filter(i => i.code === item.code).length;
                const sum = claim.items.filter(i => i.code === item.code).reduce((a, b) => a + (Number(b.amount) || 0), 0);

                return (
                  <div
                    key={item.code}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-white transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-slate-200 text-slate-900 px-2 py-0.5 rounded">
                        CODE {item.code}
                      </span>
                      {count > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {count} item ({sum.toFixed(2)} RM)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">0 items</span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs">{item.detail}</h4>
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          EMO BOOK SERVICES SDN BHD (679385-W) • 7 & 9, Jalan PJS 7/17, Bandar Sunway, 46150 Petaling Jaya, Selangor.
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Equipped with Gemini 3.8 Flash OCR • Google Sheets Online Sync • Firebase Firestore & Auth
        </p>
      </footer>

      {/* Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddReceipt={handleAddReceipt}
      />

      <ManualTransactionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddTransaction={handleAddManualTransaction}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        claim={claim}
      />

      <CloudStorageModal
        isOpen={isCloudStorageOpen}
        onClose={() => setIsCloudStorageOpen(false)}
        claim={claim}
        onRestoreClaim={(restored) => {
          setClaim(restored);
          showNotice('Restored claim from Cloud Storage');
        }}
      />

      <OriginalFormModal
        isOpen={isOriginalFormOpen}
        onClose={() => setIsOriginalFormOpen(false)}
      />

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLoginUser}
      />
    </div>
  );
}
