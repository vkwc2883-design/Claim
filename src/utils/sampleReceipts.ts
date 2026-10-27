// Utility to generate realistic receipt canvas images for instant 1-click OCR testing

export interface SampleReceiptPreset {
  id: string;
  name: string;
  category: string;
  expectedCode: string;
  merchant: string;
  amount: number;
  date: string;
  receiptNumber: string;
  items: Array<{ desc: string; qty: number; price: number }>;
  remark: string;
}

export const SAMPLE_RECEIPT_PRESETS: SampleReceiptPreset[] = [
  {
    id: 'petronas-fuel',
    name: 'Petronas RON95 Petrol',
    category: 'Petrol - RON95/Diesel (920-0000)',
    expectedCode: '920-0000',
    merchant: 'STESEN MINYAK MESRA PETRONAS SUNWAY',
    amount: 55.40,
    date: '2026-10-22',
    receiptNumber: 'PET-8841920',
    items: [
      { desc: 'PRIMAX 95 WITH PRO-DRIVE (27.02 L @ 2.05)', qty: 1, price: 55.40 },
    ],
    remark: 'Petrol fuel for delivery van run to Klang distributor',
  },
  {
    id: 'grab-ride',
    name: 'Grab e-Hailing Ride',
    category: 'Travelling Expenses - Grab (905-0001)',
    expectedCode: '905-0001',
    merchant: 'GRABCAR MALAYSIA SDN BHD',
    amount: 34.00,
    date: '2026-10-23',
    receiptNumber: 'A-981249912',
    items: [
      { desc: 'GrabCar - Sunway PJS 7 to KLCC Book Fair Booth', qty: 1, price: 34.00 },
    ],
    remark: 'Transport to KLCC for Book Fair exhibition setup',
  },
  {
    id: 'sunway-parking',
    name: 'Sunway Pyramid Parking',
    category: 'Parking (921-0001)',
    expectedCode: '921-0001',
    merchant: 'SUNWAY PYRAMID AUTO-PAY PARKING',
    amount: 12.00,
    date: '2026-10-24',
    receiptNumber: 'SPY-PARK-04921',
    items: [
      { desc: 'Entry: 10:14  Exit: 15:30  Duration: 5h 16m', qty: 1, price: 12.00 },
    ],
    remark: 'Parking ticket during client meeting at Bandar Sunway',
  },
  {
    id: 'jt-express',
    name: 'J&T Express Courier',
    category: 'Courier Charges (928-0000)',
    expectedCode: '928-0000',
    merchant: 'J&T EXPRESS (M) SDN BHD',
    amount: 28.50,
    date: '2026-10-24',
    receiptNumber: 'JT-6029341108',
    items: [
      { desc: 'Parcel Express Shipping (3.5kg) to Penang Branch', qty: 1, price: 28.50 },
    ],
    remark: 'Courier express delivery for urgent catalogue samples',
  },
  {
    id: 'popular-stationery',
    name: 'Popular Bookstore Printing & Stationery',
    category: 'Printing & Stationery (910-0000)',
    expectedCode: '910-0000',
    merchant: 'POPULAR BOOK CO. (M) SDN BHD',
    amount: 46.80,
    date: '2026-10-25',
    receiptNumber: 'POP-7729104',
    items: [
      { desc: 'DOUBLE A A4 PAPER 80GSM (2 REAMS)', qty: 2, price: 15.50 },
      { desc: 'PILOT G2 0.7 GEL PEN BLACK (BOX)', qty: 1, price: 15.80 },
    ],
    remark: 'Office A4 printing paper and pens for accounting desk',
  },
  {
    id: 'packing-boxes',
    name: 'Carton Packaging Boxes',
    category: 'Packing Material - Box (617-0001)',
    expectedCode: '617-0001',
    merchant: 'MEGA PACKAGING SUPPLIES SDN BHD',
    amount: 85.00,
    date: '2026-10-25',
    receiptNumber: 'PKG-2026-0811',
    items: [
      { desc: 'HEAVY DUTY CORRUGATED CARTON BOX 40x30x30CM', qty: 20, price: 4.25 },
    ],
    remark: 'Packing boxes for book shipment to school libraries',
  },
  {
    id: 'poliklinik-medical',
    name: 'Klinik Mediviron Medical Consultation',
    category: 'Medical Fee (940-)',
    expectedCode: '940-',
    merchant: 'POLIKLINIK MEDIVIRON SUNWAY',
    amount: 65.00,
    date: '2026-10-26',
    receiptNumber: 'MED-550921',
    items: [
      { desc: 'Outpatient Doctor Consultation & Cough/Fever Meds', qty: 1, price: 65.00 },
    ],
    remark: 'Staff outpatient clinic visit for severe influenza',
  },
  {
    id: 'tng-toll',
    name: 'Touch n Go LDP Highway Toll',
    category: 'Toll (921-0002)',
    expectedCode: '921-0002',
    merchant: 'TOUCH N GO SDN BHD - LDP TOLL',
    amount: 25.00,
    date: '2026-10-26',
    receiptNumber: 'TNG-RELOAD-83921',
    items: [
      { desc: 'TNG Card e-Wallet Reload for Highway Toll Trips', qty: 1, price: 25.00 },
    ],
    remark: 'LDP highway toll reimbursement for warehouse trip',
  }
];

// Generates a clean thermal-style receipt data URL from preset
export function renderReceiptCanvas(preset: SampleReceiptPreset): string {
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Paper Background with subtle crinkle texture
  ctx.fillStyle = '#fbfbfa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top Jagged Cut simulation
  ctx.fillStyle = '#e2e8f0';
  for (let x = 0; x < canvas.width; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 8, 6);
    ctx.lineTo(x + 16, 0);
    ctx.fill();
  }

  // Merchant Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(preset.merchant, 230, 45);

  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText('NO. 12, JALAN PJS 11/15, 46150 PETALING JAYA', 230, 68);
  ctx.fillText('TEL: 03-5638 9000  SST REG: W10-1808-3200001', 230, 86);

  // Divider
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, 102);
  ctx.lineTo(435, 102);
  ctx.stroke();

  // Receipt Meta
  ctx.textAlign = 'left';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`RECEIPT NO : ${preset.receiptNumber}`, 30, 126);
  ctx.fillText(`DATE/TIME  : ${preset.date} 14:32:10`, 30, 146);
  ctx.fillText(`CASHIER    : COUNTER 02 (AIDA)`, 30, 166);
  ctx.fillText(`PAYMENT    : CASH / CREDIT CARD`, 30, 186);

  ctx.beginPath();
  ctx.moveTo(25, 202);
  ctx.lineTo(435, 202);
  ctx.stroke();

  // Items Header
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('ITEM DESCRIPTION', 30, 224);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT(RM)', 430, 224);

  // Line items
  let itemY = 250;
  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#334155';

  preset.items.forEach(it => {
    ctx.textAlign = 'left';
    // Wrap long description
    const desc = it.desc.length > 32 ? it.desc.substring(0, 30) + '..' : it.desc;
    ctx.fillText(desc, 30, itemY);
    ctx.textAlign = 'right';
    ctx.fillText(it.price.toFixed(2), 430, itemY);
    itemY += 26;
  });

  // Subtotal & Tax
  itemY = Math.max(itemY, 340);
  ctx.beginPath();
  ctx.moveTo(25, itemY);
  ctx.lineTo(435, itemY);
  ctx.stroke();
  itemY += 24;

  const subtotal = (preset.amount * 0.943).toFixed(2);
  const tax = (preset.amount * 0.057).toFixed(2);

  ctx.textAlign = 'left';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText('SUBTOTAL EXCL. TAX:', 30, itemY);
  ctx.textAlign = 'right';
  ctx.fillText(subtotal, 430, itemY);

  itemY += 22;
  ctx.textAlign = 'left';
  ctx.fillText('SST (6%):', 30, itemY);
  ctx.textAlign = 'right';
  ctx.fillText(tax, 430, itemY);

  itemY += 24;
  ctx.setLineDash([]);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(25, itemY);
  ctx.lineTo(435, itemY);
  ctx.stroke();
  itemY += 28;

  // GRAND TOTAL
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.fillText('TOTAL (RM):', 30, itemY);
  ctx.textAlign = 'right';
  ctx.fillText(`RM ${preset.amount.toFixed(2)}`, 430, itemY);

  itemY += 34;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, itemY);
  ctx.lineTo(435, itemY);
  ctx.stroke();

  // Footer notes & Barcode
  itemY += 30;
  ctx.textAlign = 'center';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('*** OFFICIAL TAX INVOICE / RECEIPT ***', 230, itemY);
  ctx.fillText('THANK YOU FOR YOUR PATRONAGE!', 230, itemY + 18);
  ctx.fillText(`EXPENSE CODE TAG: ${preset.expectedCode}`, 230, itemY + 36);

  // Simulated Barcode
  itemY += 56;
  ctx.fillStyle = '#1e293b';
  for (let bx = 60; bx < 400; bx += Math.floor(Math.random() * 4 + 3)) {
    const barWidth = (bx % 3 === 0) ? 2 : 1;
    ctx.fillRect(bx, itemY, barWidth, 34);
  }

  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(`* ${preset.receiptNumber} *`, 230, itemY + 48);

  return canvas.toDataURL('image/jpeg', 0.92);
}
