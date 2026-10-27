import React, { useState } from 'react';
import { ReceiptItem, OFFICIAL_CLAIM_CODES } from '../types';
import { Search, Filter, Trash2, Edit2, Eye, Receipt, Check, X, Sparkles, CloudCheck, ExternalLink } from 'lucide-react';

interface ReceiptLedgerProps {
  items: ReceiptItem[];
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: ReceiptItem) => void;
  onOpenScanner: () => void;
}

export const ReceiptLedger: React.FC<ReceiptLedgerProps> = ({
  items,
  onDeleteItem,
  onUpdateItem,
  onOpenScanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCode, setFilterCode] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptItem | null>(null);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remark.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCode = filterCode === 'ALL' || item.code === filterCode;
    return matchesSearch && matchesCode;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReceipt) return;
    const codeDef = OFFICIAL_CLAIM_CODES.find(c => c.code === editingReceipt.code);
    const updated = {
      ...editingReceipt,
      details: codeDef ? codeDef.detail : editingReceipt.details,
    };
    onUpdateItem(updated);
    setEditingReceipt(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by merchant, invoice #, code, or remark..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="w-48 shrink-0">
            <select
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All Expense Codes</option>
              {OFFICIAL_CLAIM_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  [{c.code}] {c.detail.substring(0, 25)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500">
            {filteredItems.length} of {items.length} Receipt{items.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Scan Receipt
          </button>
        </div>
      </div>

      {/* Receipts Table / Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">No Scanned Receipts Found</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            {items.length === 0
              ? 'Start by scanning receipts or selecting one of our realistic Malaysian sample receipts to automatically categorize expenses.'
              : 'No receipts match your search filter.'}
          </p>
          <button
            onClick={onOpenScanner}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Scan Your First Receipt
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-16">Preview</th>
                  <th className="py-3 px-4">Merchant & Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Code & Category</th>
                  <th className="py-3 px-4 text-right">Amount (RM)</th>
                  <th className="py-3 px-4">Remark</th>
                  <th className="py-3 px-4 text-center">OCR</th>
                  <th className="py-3 px-4 text-center w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono font-medium">
                      {idx + 1}
                    </td>

                    {/* Preview Thumbnail */}
                    <td className="py-3 px-4">
                      {item.imageUrl ? (
                        <div
                          onClick={() => setSelectedReceipt(item)}
                          className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 cursor-pointer shadow-xs hover:border-orange-500 hover:scale-105 transition-all relative group/thumb"
                        >
                          <img
                            src={item.imageUrl}
                            alt="Receipt"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <Receipt className="w-5 h-5" />
                        </div>
                      )}
                    </td>

                    {/* Merchant & Receipt # */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.merchantName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {item.receiptNumber || 'N/A'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Code & Category */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-800 font-mono font-bold text-[11px]">
                        CODE {item.code}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate max-w-xs mt-0.5">
                        {item.details}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="font-extrabold text-slate-900 text-sm">
                        RM {Number(item.amount).toFixed(2)}
                      </span>
                      {item.taxAmount ? (
                        <div className="text-[10px] text-slate-400">
                          SST: RM {Number(item.taxAmount).toFixed(2)}
                        </div>
                      ) : null}
                    </td>

                    {/* Remark */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {item.remark || <span className="text-slate-300 italic">No remark</span>}
                    </td>

                    {/* OCR Confidence */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.confidence === 'HIGH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.confidence === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.confidence}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setEditingReceipt(item)}
                          title="Edit details / re-categorize"
                          className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          title="Delete receipt"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail / Inspection Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedReceipt.merchantName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Invoice: {selectedReceipt.receiptNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                  {selectedReceipt.imageUrl ? (
                    <img
                      src={selectedReceipt.imageUrl}
                      alt="Receipt full"
                      className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="h-48 text-slate-400 text-xs flex items-center justify-center">
                      No Image File
                    </div>
                  )}
                </div>

                {/* Details Breakdown */}
                <div className="space-y-3 text-xs">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-orange-700 uppercase">Assigned Official Code</span>
                    <p className="text-sm font-bold font-mono text-orange-950 mt-0.5">
                      {selectedReceipt.code}
                    </p>
                    <p className="text-xs text-orange-800 mt-0.5">{selectedReceipt.details}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-semibold text-slate-800">{selectedReceipt.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Amount:</span>
                      <span className="font-extrabold text-orange-600 font-mono text-sm">
                        RM {Number(selectedReceipt.amount).toFixed(2)}
                      </span>
                    </div>
                    {selectedReceipt.taxAmount ? (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tax / SST:</span>
                        <span className="font-mono text-slate-800">
                          RM {Number(selectedReceipt.taxAmount).toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span className="text-slate-500">OCR Confidence:</span>
                      <span className="font-bold text-emerald-700">{selectedReceipt.confidence}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Remark for Claim Form:</span>
                    <p className="text-slate-800 mt-1 font-medium">{selectedReceipt.remark || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Raw OCR Text Box if present */}
              {selectedReceipt.ocrRawText && (
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Raw OCR Text Extracted:</span>
                  <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto text-slate-300">
                    {selectedReceipt.ocrRawText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Receipt Modal */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <form onSubmit={handleSaveEdit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h4 className="font-bold text-slate-900 text-sm">Edit Receipt & Code Assignment</h4>
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Expense Code (Official Claim Form)
                  </label>
                  <select
                    value={editingReceipt.code}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {OFFICIAL_CLAIM_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        [{c.code}] {c.detail}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={editingReceipt.merchantName}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, merchantName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Amount (RM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingReceipt.amount}
                      onChange={(e) => setEditingReceipt({ ...editingReceipt, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editingReceipt.date}
                      onChange={(e) => setEditingReceipt({ ...editingReceipt, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Remark (Claim Purpose)
                  </label>
                  <input
                    type="text"
                    value={editingReceipt.remark}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, remark: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 px-6 py-3 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
