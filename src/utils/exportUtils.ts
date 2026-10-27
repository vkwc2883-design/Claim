import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { StaffClaimFormState, OFFICIAL_CLAIM_CODES } from '../types';

export function exportToExcel(claim: StaffClaimFormState) {
  // Aggregate amounts and remarks by code
  const codeAggregation: Record<string, { total: number; remarks: string[] }> = {};
  OFFICIAL_CLAIM_CODES.forEach(c => {
    codeAggregation[c.code] = { total: 0, remarks: [] };
  });

  claim.items.forEach(item => {
    if (!codeAggregation[item.code]) {
      codeAggregation[item.code] = { total: 0, remarks: [] };
    }
    codeAggregation[item.code].total += Number(item.amount) || 0;
    if (item.remark) {
      codeAggregation[item.code].remarks.push(`${item.merchantName}: ${item.remark}`);
    } else if (item.merchantName) {
      codeAggregation[item.code].remarks.push(item.merchantName);
    }
  });

  const grandTotal = Object.values(codeAggregation).reduce((sum, val) => sum + val.total, 0);

  // --- SHEET 1: Official Monthly Claim Form ---
  const formRows: any[][] = [
    ['EMO BOOK SERVICES SDN BHD (679385-W)'],
    ['7 & 9, JALAN PJS 7/17, BANDAR SUNWAY, 46150 PETALING JAYA, SELANGOR DARUL EHSAN, MALAYSIA.'],
    ['TEL : 03-56311500    EMAIL : cs@emobooks.com'],
    [],
    ['STAFF MONTHLY CLAIM FORM'],
    [],
    ['NAME (as per IC):', claim.staffName || '', '', 'IC NO :', claim.icNo || ''],
    ['CLAIM FOR :', claim.claimFor || '', '', 'DATE :', `${claim.dateFrom || ''} TO ${claim.dateTo || ''}`],
    [],
    ['CODE', 'DETAILS', 'AMOUNT (RM)', 'REMARK'],
  ];

  OFFICIAL_CLAIM_CODES.forEach(codeItem => {
    const agg = codeAggregation[codeItem.code];
    const amountVal = agg && agg.total > 0 ? agg.total.toFixed(2) : '';
    const remarkVal = agg && agg.remarks.length > 0 ? agg.remarks.slice(0, 3).join('; ') : '';
    formRows.push([codeItem.code, codeItem.detail, amountVal, remarkVal]);
  });

  formRows.push([]);
  formRows.push(['', 'TOTAL (RM)', grandTotal.toFixed(2), '']);
  formRows.push([]);
  formRows.push(['CLAIMED BY :', '', 'APPROVED BY :', '', 'APPROVED BY :']);
  formRows.push([`NAME : ${claim.staffName || ''}`, '', `SUPERVISOR : ${claim.supervisorName || ''}`, '', `DIRECTOR : ${claim.directorName || ''}`]);
  formRows.push([`DATE : ${claim.claimedDate || new Date().toISOString().split('T')[0]}`, '', `DATE : ${claim.supervisorDate || ''}`, '', `DATE : ${claim.directorDate || ''}`]);

  const wsForm = XLSX.utils.aoa_to_sheet(formRows);

  // Column widths for sheet 1
  wsForm['!cols'] = [
    { wch: 16 }, // CODE
    { wch: 48 }, // DETAILS
    { wch: 16 }, // AMOUNT
    { wch: 45 }, // REMARK
    { wch: 25 },
  ];

  // --- SHEET 2: Individual Receipt Audit Trail ---
  const receiptRows: any[][] = [
    ['RECEIPT ITEMS AUDIT TRAIL'],
    [`Staff: ${claim.staffName || 'N/A'} | Claim Period: ${claim.claimFor || 'N/A'}`],
    [],
    ['Item #', 'Date', 'Merchant / Store', 'Receipt #', 'Expense Code', 'Expense Details', 'Amount (RM)', 'Tax / SST (RM)', 'Remark / Purpose', 'OCR Confidence', 'Uploaded At']
  ];

  claim.items.forEach((item, idx) => {
    receiptRows.push([
      idx + 1,
      item.date,
      item.merchantName,
      item.receiptNumber || '-',
      item.code,
      item.details,
      Number(item.amount).toFixed(2),
      item.taxAmount ? Number(item.taxAmount).toFixed(2) : '0.00',
      item.remark,
      item.confidence,
      item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : '-'
    ]);
  });

  receiptRows.push([]);
  receiptRows.push(['', '', '', '', '', 'GRAND TOTAL (RM)', grandTotal.toFixed(2)]);

  const wsReceipts = XLSX.utils.aoa_to_sheet(receiptRows);
  wsReceipts['!cols'] = [
    { wch: 8 },  // Item #
    { wch: 14 }, // Date
    { wch: 28 }, // Merchant
    { wch: 18 }, // Receipt #
    { wch: 14 }, // Code
    { wch: 42 }, // Details
    { wch: 14 }, // Amount
    { wch: 14 }, // Tax
    { wch: 35 }, // Remark
    { wch: 15 }, // Confidence
    { wch: 22 }, // Uploaded At
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsForm, 'Staff Claim Form');
  XLSX.utils.book_append_sheet(wb, wsReceipts, 'Receipts Audit Trail');

  const fileName = `EMO_Staff_Claim_${(claim.claimFor || '2026').replace(/\s+/g, '_')}_${(claim.staffName || 'Staff').replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToPDF(claim: StaffClaimFormState) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Aggregate amounts and remarks by code
  const codeAggregation: Record<string, { total: number; remarks: string[] }> = {};
  OFFICIAL_CLAIM_CODES.forEach(c => {
    codeAggregation[c.code] = { total: 0, remarks: [] };
  });

  claim.items.forEach(item => {
    if (!codeAggregation[item.code]) {
      codeAggregation[item.code] = { total: 0, remarks: [] };
    }
    codeAggregation[item.code].total += Number(item.amount) || 0;
    if (item.remark) {
      codeAggregation[item.code].remarks.push(`${item.merchantName}: ${item.remark}`);
    } else if (item.merchantName) {
      codeAggregation[item.code].remarks.push(item.merchantName);
    }
  });

  const grandTotal = Object.values(codeAggregation).reduce((sum, val) => sum + val.total, 0);

  // --- PAGE 1: OFFICIAL CLAIM FORM ---
  // Header Logo Box
  doc.setFillColor(235, 75, 45); // Orange-Red
  doc.rect(14, 10, 24, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EMO', 26, 17, { align: 'center' });
  doc.setFontSize(5);
  doc.text('BOOKSTORES', 26, 20.5, { align: 'center' });

  // Company Details
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EMO BOOK SERVICES SDN BHD (679385-W)', pageWidth / 2 + 6, 12, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('7 & 9, JALAN PJS 7/17, BANDAR SUNWAY, 46150 PETALING JAYA,', pageWidth / 2 + 6, 16, { align: 'center' });
  doc.text('SELANGOR DARUL EHSAN, MALAYSIA.', pageWidth / 2 + 6, 19.5, { align: 'center' });
  doc.text('TEL : 03-56311500    EMAIL : cs@emobooks.com', pageWidth / 2 + 6, 23, { align: 'center' });

  // Form Title Banner
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(14, 26, pageWidth - 28, 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('STAFF MONTHLY CLAIM FORM', pageWidth / 2, 31, { align: 'center' });

  // Metadata Form Fields
  doc.setFontSize(8);
  const metaY = 37;
  doc.setFont('helvetica', 'bold');
  doc.text('NAME (as per IC):', 14, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text(claim.staffName || '', 44, metaY);
  doc.line(44, metaY + 1, 105, metaY + 1);

  doc.setFont('helvetica', 'bold');
  doc.text('IC NO :', 115, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text(claim.icNo || '', 128, metaY);
  doc.line(128, metaY + 1, pageWidth - 14, metaY + 1);

  const metaY2 = 43;
  doc.setFont('helvetica', 'bold');
  doc.text('CLAIM FOR :', 14, metaY2);
  doc.setFont('helvetica', 'normal');
  doc.text(claim.claimFor || '', 36, metaY2);
  doc.line(36, metaY2 + 1, 105, metaY2 + 1);

  doc.setFont('helvetica', 'bold');
  doc.text('DATE :', 115, metaY2);
  doc.setFont('helvetica', 'normal');
  const dateRangeStr = claim.dateFrom ? `${claim.dateFrom}  TO  ${claim.dateTo || ''}` : '';
  doc.text(dateRangeStr, 128, metaY2);
  doc.line(128, metaY2 + 1, pageWidth - 14, metaY2 + 1);

  // Table Structure
  const tableY = 47;
  const colX = {
    code: 14,
    codeWidth: 22,
    details: 36,
    detailsWidth: 88,
    amount: 124,
    amountWidth: 26,
    remark: 150,
    remarkWidth: pageWidth - 14 - 150,
  };

  const rowHeight = 5.2;

  // Header Row
  doc.setFillColor(245, 245, 245);
  doc.rect(14, tableY, pageWidth - 28, 6, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CODE', colX.code + colX.codeWidth / 2, tableY + 4.2, { align: 'center' });
  doc.text('DETAILS', colX.details + 4, tableY + 4.2);
  doc.text('AMOUNT (RM)', colX.amount + colX.amountWidth / 2, tableY + 4.2, { align: 'center' });
  doc.text('REMARK', colX.remark + colX.remarkWidth / 2, tableY + 4.2, { align: 'center' });

  // Grid lines vertical
  let currentY = tableY + 6;

  OFFICIAL_CLAIM_CODES.forEach((item, index) => {
    const agg = codeAggregation[item.code];
    const isHighlighted = agg && agg.total > 0;

    if (isHighlighted) {
      doc.setFillColor(254, 243, 199); // Light amber highlight for rows with amounts
      doc.rect(14, currentY, pageWidth - 28, rowHeight, 'F');
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(14, currentY + rowHeight, pageWidth - 14, currentY + rowHeight);

    doc.setFont('helvetica', isHighlighted ? 'bold' : 'normal');
    doc.setFontSize(6.8);
    
    // Code
    doc.text(item.code, colX.code + colX.codeWidth / 2, currentY + 3.6, { align: 'center' });
    
    // Detail (truncate if too long)
    let detailText = item.detail;
    if (detailText.length > 56) {
      detailText = detailText.substring(0, 53) + '...';
    }
    doc.text(detailText, colX.details + 2, currentY + 3.6);

    // Amount
    if (agg && agg.total > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text(agg.total.toFixed(2), colX.amount + colX.amountWidth - 2, currentY + 3.6, { align: 'right' });
    }

    // Remark
    if (agg && agg.remarks.length > 0) {
      doc.setFont('helvetica', 'normal');
      let remarkStr = agg.remarks.slice(0, 2).join('; ');
      if (remarkStr.length > 30) remarkStr = remarkStr.substring(0, 28) + '..';
      doc.text(remarkStr, colX.remark + 2, currentY + 3.6);
    }

    currentY += rowHeight;
  });

  // Table outer vertical borders
  doc.setDrawColor(0, 0, 0);
  doc.line(14, tableY, 14, currentY);
  doc.line(colX.details, tableY, colX.details, currentY);
  doc.line(colX.amount, tableY, colX.amount, currentY);
  doc.line(colX.remark, tableY, colX.remark, currentY);
  doc.line(pageWidth - 14, tableY, pageWidth - 14, currentY);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // Total Row
  doc.setFillColor(240, 240, 240);
  doc.rect(14, currentY, pageWidth - 28, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TOTAL (RM)', colX.details + colX.detailsWidth / 2, currentY + 5, { align: 'center' });
  doc.text(grandTotal.toFixed(2), colX.amount + colX.amountWidth - 2, currentY + 5, { align: 'right' });

  // Signature Blocks
  const sigY = currentY + 11;
  const sigCol1 = 14;
  const sigCol2 = 82;
  const sigCol3 = 145;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CLAIMED BY :', sigCol1, sigY);
  doc.text('APPROVED BY :', sigCol2, sigY);
  doc.text('APPROVED BY :', sigCol3, sigY);

  const sigLineY = sigY + 13;
  doc.line(sigCol1, sigLineY, sigCol1 + 52, sigLineY);
  doc.line(sigCol2, sigLineY, sigCol2 + 52, sigLineY);
  doc.line(sigCol3, sigLineY, sigCol3 + 45, sigLineY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`NAME : ${claim.staffName || ''}`, sigCol1, sigLineY + 4);
  doc.text(`DATE : ${claim.claimedDate || new Date().toISOString().split('T')[0]}`, sigCol1, sigLineY + 8);

  doc.text(`SUPERVISOR : ${claim.supervisorName || ''}`, sigCol2, sigLineY + 4);
  doc.text(`DATE : ${claim.supervisorDate || ''}`, sigCol2, sigLineY + 8);

  doc.text(`DIRECTOR : ${claim.directorName || ''}`, sigCol3, sigLineY + 4);
  doc.text(`DATE : ${claim.directorDate || ''}`, sigCol3, sigLineY + 8);

  // --- SUBSEQUENT PAGES: RECEIPT AUDIT TRAIL ---
  if (claim.items.length > 0) {
    doc.addPage();
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RECEIPT AUDIT TRAIL & OCR PROOFS', 14, 12);
    doc.setFontSize(8);
    doc.text(`Total Receipts: ${claim.items.length}  |  Claim Total: RM ${grandTotal.toFixed(2)}`, pageWidth - 14, 12, { align: 'right' });

    let itemY = 25;
    claim.items.forEach((item, index) => {
      // Check page overflow
      if (itemY + 45 > pageHeight - 15) {
        doc.addPage();
        itemY = 15;
      }

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, itemY, pageWidth - 28, 40, 2, 2, 'FD');

      // Receipt Thumbnail / Placeholder
      if (item.imageUrl && item.imageUrl.startsWith('data:image')) {
        try {
          doc.addImage(item.imageUrl, 'JPEG', 18, itemY + 4, 30, 32);
        } catch {
          doc.setFillColor(220, 225, 230);
          doc.rect(18, itemY + 4, 30, 32, 'F');
          doc.setTextColor(100, 110, 120);
          doc.setFontSize(6);
          doc.text('Receipt Photo', 33, itemY + 20, { align: 'center' });
        }
      } else {
        doc.setFillColor(241, 245, 249);
        doc.rect(18, itemY + 4, 30, 32, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.text('Scanned File', 33, itemY + 20, { align: 'center' });
      }

      // Metadata Info Box
      const textX = 52;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`#${index + 1} - ${item.merchantName || 'Receipt'}`, textX, itemY + 8);

      // Amount badge
      doc.setFillColor(234, 88, 12); // Orange-600
      doc.roundedRect(pageWidth - 45, itemY + 4, 28, 7, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.text(`RM ${Number(item.amount).toFixed(2)}`, pageWidth - 31, itemY + 8.8, { align: 'center' });

      // Code tag
      doc.setFillColor(219, 234, 254);
      doc.roundedRect(textX, itemY + 11, 48, 5, 1, 1, 'F');
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(6.5);
      doc.text(`CODE: ${item.code} | ${item.details.substring(0, 22)}`, textX + 2, itemY + 14.5);

      // Details
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Date: ${item.date || '-'}    Receipt No: ${item.receiptNumber || 'N/A'}    OCR: ${item.confidence || 'HIGH'}`, textX, itemY + 20);
      doc.text(`Remark: ${item.remark || '-'}`, textX, itemY + 24.5);

      if (item.ocrRawText) {
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        const ocrSnippet = item.ocrRawText.replace(/\n+/g, ' ').substring(0, 85);
        doc.text(`Extracted: "${ocrSnippet}..."`, textX, itemY + 29);
      }

      itemY += 45;
    });
  }

  const pdfFileName = `EMO_Staff_Claim_${(claim.claimFor || '2026').replace(/\s+/g, '_')}_${(claim.staffName || 'Staff').replace(/\s+/g, '_')}.pdf`;
  doc.save(pdfFileName);
}
