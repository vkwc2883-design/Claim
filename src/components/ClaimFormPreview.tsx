import React, { useState } from 'react';
import { StaffClaimFormState, OFFICIAL_CLAIM_CODES, ReceiptItem } from '../types';
import { FileText, Plus, Eye, ChevronDown, ChevronUp, Sparkles, Receipt, CheckCircle } from 'lucide-react';

interface ClaimFormPreviewProps {
  claim: StaffClaimFormState;
  onUpdateClaim: (updated: Partial<StaffClaimFormState>) => void;
  onOpenScanner: () => void;
  onSelectReceipt?: (item: ReceiptItem) => void;
}

export const ClaimFormPreview: React.FC<ClaimFormPreviewProps> = ({
  claim,
  onUpdateClaim,
  onOpenScanner,
  onSelectReceipt,
}) => {
  const [showOnlyClaimed, setShowOnlyClaimed] = useState(false);
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({});

  // Group items by code
  const itemsByCode: Record<string, ReceiptItem[]> = {};
  OFFICIAL_CLAIM_CODES.forEach(c => {
    itemsByCode[c.code] = [];
  });

  claim.items.forEach(item => {
    if (!itemsByCode[item.code]) {
      itemsByCode[item.code] = [];
    }
    itemsByCode[item.code].push(item);
  });

  // Calculate totals
  const totalAmount = claim.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const toggleExpand = (code: string) => {
    setExpandedCodes(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const displayedCodes = showOnlyClaimed
    ? OFFICIAL_CLAIM_CODES.filter(c => (itemsByCode[c.code]?.length || 0) > 0)
    : OFFICIAL_CLAIM_CODES;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Official Form Header Bar */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-md border border-white/20">
              EMO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-wide text-white">STAFF MONTHLY CLAIM FORM</h2>
                <span className="text-[10px] font-mono uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  2025/2026 Format
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                EMO BOOK SERVICES SDN BHD (679385-W) • BANDAR SUNWAY
              </p>
            </div>
          </div>

          {/* Quick Toggle Controls */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={() => setShowOnlyClaimed(!showOnlyClaimed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                showOnlyClaimed
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {showOnlyClaimed ? 'Showing Claimed Only' : 'Show All 31 Form Codes'}
            </button>
            <button
              onClick={onOpenScanner}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Scan New Receipt
            </button>
          </div>
        </div>

        {/* Form Metadata Fill-ins */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-400 font-medium text-[11px] block">NAME (as per IC)</span>
            <input
              type="text"
              value={claim.staffName}
              onChange={(e) => onUpdateClaim({ staffName: e.target.value })}
              placeholder="e.g. TAN WEI CHEN"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-orange-500 mt-1"
            />
          </div>

          <div>
            <span className="text-slate-400 font-medium text-[11px] block">IC NO :</span>
            <input
              type="text"
              value={claim.icNo}
              onChange={(e) => onUpdateClaim({ icNo: e.target.value })}
              placeholder="e.g. 920514-10-5541"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-orange-500 mt-1"
            />
          </div>

          <div>
            <span className="text-slate-400 font-medium text-[11px] block">CLAIM FOR (Month/Year)</span>
            <input
              type="text"
              value={claim.claimFor}
              onChange={(e) => onUpdateClaim({ claimFor: e.target.value })}
              placeholder="e.g. OCTOBER 2026"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold uppercase focus:outline-none focus:border-orange-500 mt-1"
            />
          </div>

          <div>
            <span className="text-slate-400 font-medium text-[11px] block">DATE RANGE (From - To)</span>
            <div className="flex items-center space-x-1 mt-1">
              <input
                type="date"
                value={claim.dateFrom}
                onChange={(e) => onUpdateClaim({ dateFrom: e.target.value })}
                className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[11px] focus:outline-none focus:border-orange-500"
              />
              <span className="text-slate-500 text-[10px]">TO</span>
              <input
                type="date"
                value={claim.dateTo}
                onChange={(e) => onUpdateClaim({ dateTo: e.target.value })}
                className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[11px] focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Official Form Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3 px-4 w-32 border-r border-slate-200">CODE</th>
              <th className="py-3 px-4 border-r border-slate-200">DETAILS</th>
              <th className="py-3 px-4 w-36 text-right border-r border-slate-200">AMOUNT (RM)</th>
              <th className="py-3 px-4 w-64 border-r border-slate-200">REMARK</th>
              <th className="py-3 px-3 w-16 text-center">RECEIPTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {displayedCodes.map((codeItem) => {
              const matchedItems = itemsByCode[codeItem.code] || [];
              const codeTotal = matchedItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const hasClaim = matchedItems.length > 0;
              const isExpanded = expandedCodes[codeItem.code];

              // Compile remarks
              const remarkSnippet = matchedItems.length > 0
                ? matchedItems.map(m => m.remark || m.merchantName).filter(Boolean).slice(0, 2).join('; ')
                : '';

              return (
                <React.Fragment key={codeItem.code}>
                  <tr
                    className={`transition-colors group ${
                      hasClaim
                        ? 'bg-amber-50/70 hover:bg-amber-100/60 font-medium'
                        : 'hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    {/* CODE */}
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 border-r border-slate-200">
                      <div className="flex items-center space-x-1.5">
                        {hasClaim && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />
                        )}
                        <span className={hasClaim ? 'text-orange-900' : 'text-slate-800'}>
                          {codeItem.code}
                        </span>
                      </div>
                    </td>

                    {/* DETAILS */}
                    <td className="py-2.5 px-4 border-r border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className={`${hasClaim ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                          {codeItem.detail}
                        </span>
                        {hasClaim && (
                          <button
                            onClick={() => toggleExpand(codeItem.code)}
                            className="text-[10px] text-orange-700 hover:text-orange-900 flex items-center gap-0.5 bg-orange-100/70 px-1.5 py-0.5 rounded transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {matchedItems.length} receipt{matchedItems.length > 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* AMOUNT (RM) */}
                    <td className="py-2.5 px-4 text-right font-mono border-r border-slate-200">
                      {hasClaim ? (
                        <span className="font-extrabold text-slate-950 bg-amber-200/60 px-2 py-0.5 rounded text-sm">
                          {codeTotal.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* REMARK */}
                    <td className="py-2.5 px-4 border-r border-slate-200 text-slate-600">
                      {remarkSnippet ? (
                        <span className="truncate block max-w-xs text-[11px]" title={remarkSnippet}>
                          {remarkSnippet}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px] italic">No remarks</span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-2.5 px-3 text-center">
                      {hasClaim ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-[11px] font-bold shadow-xs">
                          {matchedItems.length}
                        </span>
                      ) : (
                        <button
                          onClick={onOpenScanner}
                          title="Scan receipt for this category"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-orange-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expandable Breakdown Drawer for this Code */}
                  {hasClaim && isExpanded && (
                    <tr className="bg-orange-50/40 border-b border-orange-200">
                      <td colSpan={5} className="py-3 px-6">
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-orange-900 uppercase tracking-wide">
                            Attached Receipts for [{codeItem.code}] {codeItem.detail}:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {matchedItems.map((item, idx) => (
                              <div
                                key={item.id}
                                onClick={() => onSelectReceipt?.(item)}
                                className="bg-white p-2.5 rounded-lg border border-orange-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-orange-500 transition-all"
                              >
                                <div className="flex items-center space-x-2.5">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt="Receipt"
                                      className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                      <Receipt className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="truncate">
                                    <p className="font-bold text-slate-800 text-xs truncate">
                                      {item.merchantName}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {item.date} • {item.receiptNumber || 'No Ref'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <p className="font-bold text-orange-600 text-xs font-mono">
                                    RM {Number(item.amount).toFixed(2)}
                                  </p>
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-medium">
                                    OCR {item.confidence}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Form Total Footer */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold text-sm">
              <td colSpan={2} className="py-3.5 px-6 text-right uppercase tracking-wider text-slate-300">
                TOTAL (RM)
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-base font-extrabold text-orange-400">
                RM {totalAmount.toFixed(2)}
              </td>
              <td colSpan={2} className="py-3.5 px-4 text-xs text-slate-400 font-normal">
                {claim.items.length} Scanned Receipt{claim.items.length !== 1 ? 's' : ''} Included
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Sign-off Blocks */}
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Claimed By */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              CLAIMED BY :
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">NAME :</span>
                <input
                  type="text"
                  value={claim.staffName}
                  onChange={(e) => onUpdateClaim({ staffName: e.target.value })}
                  placeholder="Staff Name"
                  className="w-full font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 mt-0.5 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">DATE :</span>
                <input
                  type="date"
                  value={claim.claimedDate}
                  onChange={(e) => onUpdateClaim({ claimedDate: e.target.value })}
                  className="w-full text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 mt-0.5 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Approved By Supervisor */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              APPROVED BY :
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">SUPERVISOR :</span>
                <input
                  type="text"
                  value={claim.supervisorName}
                  onChange={(e) => onUpdateClaim({ supervisorName: e.target.value })}
                  placeholder="Supervisor Name"
                  className="w-full font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 mt-0.5 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">DATE :</span>
                <input
                  type="date"
                  value={claim.supervisorDate}
                  onChange={(e) => onUpdateClaim({ supervisorDate: e.target.value })}
                  className="w-full text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 mt-0.5 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Approved By Director */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              APPROVED BY :
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">DIRECTOR :</span>
                <input
                  type="text"
                  value={claim.directorName}
                  onChange={(e) => onUpdateClaim({ directorName: e.target.value })}
                  placeholder="Director Name"
                  className="w-full font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 mt-0.5 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">DATE :</span>
                <input
                  type="date"
                  value={claim.directorDate}
                  onChange={(e) => onUpdateClaim({ directorDate: e.target.value })}
                  className="w-full text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 mt-0.5 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
