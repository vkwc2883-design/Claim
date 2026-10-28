import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, ExternalLink, Sparkles, Check, Lock, ArrowRight, Cloud, ShieldCheck } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StaffClaimFormState } from '../types';
import { syncClaimToGoogleSheet } from '../services/googleSheetsService';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: StaffClaimFormState;
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose, claim }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sheetUrlOrId, setSheetUrlOrId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResultUrl, setSyncResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setUser(result.user);
      } else {
        throw new Error('Failed to obtain Google access token.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  const handleSync = async () => {
    setErrorMsg(null);
    if (!accessToken) {
      setErrorMsg('Please sign in with Google first.');
      return;
    }

    if (!sheetUrlOrId.trim()) {
      setErrorMsg('Please paste your existing Google Sheet link or ID below.');
      return;
    }

    setIsSyncing(true);
    try {
      const url = await syncClaimToGoogleSheet(accessToken, sheetUrlOrId, claim);
      setSyncResultUrl(url);
    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      setErrorMsg(err.message || 'Failed to sync to Google Sheet');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Google Sheets Master File Sync</h3>
              <p className="text-xs text-slate-500">Summarise all staff claims into your existing master Google Sheet</p>
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
        <div className="p-6 bg-slate-50 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {syncResultUrl ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-base">Claim Summarised Into Your Master Google Sheet!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  The claim has been appended to your Master Claims Summary log and itemized in your spreadsheet.
                </p>
              </div>

              <a
                href={syncResultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs"
              >
                <span>Open Master Google Sheet</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div>
                <button
                  onClick={() => setSyncResultUrl(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline mt-2"
                >
                  Submit another claim update
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Authentication */}
              {!user || !accessToken ? (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Step 1: Sign in with Google</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Authorize access to update your master spreadsheet in Google Drive.
                    </p>
                  </div>
                  <button
                    onClick={handleGoogleSignIn}
                    className="gsi-material-button mx-auto inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50 font-medium text-slate-700 gap-2 cursor-pointer"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-emerald-950 text-xs">Signed in as {user.displayName || user.email}</p>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Google Sheets & Drive permissions active
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                    Connected
                  </span>
                </div>
              )}

              {/* Step 2: Paste Existing Spreadsheet Link */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Step 2: Paste Your Existing Master Google Sheet Link
                </h4>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Google Sheet URL or Spreadsheet ID *
                  </label>
                  <input
                    type="text"
                    value={sheetUrlOrId}
                    onChange={(e) => setSheetUrlOrId(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                    Paste the full URL of your existing master Google Sheet. All claim submissions and transaction items will automatically append and summarise into this single file ("Master Claims Summary").
                  </p>
                </div>
              </div>

              {/* Summary Preview */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Submission Summary to Append</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs">
                  <div>Staff: <span className="font-bold text-slate-900">{claim.staffName}</span></div>
                  <div>Claim Period: <span className="font-bold text-slate-900">{claim.claimFor}</span></div>
                  <div>Total Items: <span className="font-bold text-slate-900">{claim.items.length} Transactions</span></div>
                  <div>Grand Total: <span className="font-bold text-emerald-600 font-mono">RM {claim.items.reduce((a,b)=>a+(Number(b.amount)||0),0).toFixed(2)}</span></div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing || !accessToken}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  isSyncing || !accessToken
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                }`}
              >
                {isSyncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Appending & Summarising to Master Sheet...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit & Summarise into Master Google Sheet</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
