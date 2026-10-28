import React, { useState } from 'react';
import { X, PlusCircle, Check, FileText } from 'lucide-react';
import { ReceiptItem, OFFICIAL_CLAIM_CODES } from '../types';

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (item: ReceiptItem) => void;
}

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [merchantName, setMerchantName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState(OFFICIAL_CLAIM_CODES[0].code);
  const [remark, setRemark] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName.trim() || !amount) {
      alert('Please enter merchant name and amount.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    const codeDef = OFFICIAL_CLAIM_CODES.find(c => c.code === code) || OFFICIAL_CLAIM_CODES[0];

    const newItem: ReceiptItem = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      merchantName: merchantName.trim().toUpperCase(),
      receiptNumber: receiptNumber.trim() || `MAN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: date || new Date().toISOString().split('T')[0],
      amount: numericAmount,
      currency: 'RM',
      code: codeDef.code,
      details: codeDef.detail,
      remark: remark.trim() || 'Manual expense entry without receipt',
      confidence: 'HIGH',
      cloudSynced: true,
      uploadedAt: new Date().toISOString(),
    };

    onAddTransaction(newItem);
    setMerchantName('');
    setReceiptNumber('');
    setAmount('');
    setRemark('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Add Transaction (Without Receipt)</h3>
              <p className="text-xs text-slate-500">Manually enter claim expenses categorized by official code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-slate-50">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Expense Code (Official Form) *
            </label>
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {OFFICIAL_CLAIM_CODES.map((item) => (
                <option key={item.code} value={item.code}>
                  [{item.code}] {item.detail}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              {OFFICIAL_CLAIM_CODES.find(c => c.code === code)?.description}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Merchant / Store Name *
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. PARKING MBPJ, OFFICE PANTRY SUPPLIES"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Amount (RM) *
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Receipt / Reference No (Optional)
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g. MAN-98214"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Remark / Purpose for Claim Form
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Toll reload and roadside parking without physical slip"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Add Manual Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
