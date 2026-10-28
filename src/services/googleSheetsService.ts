import { StaffClaimFormState, OFFICIAL_CLAIM_CODES } from '../types';

export function extractSpreadsheetId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export async function createGoogleSheet(accessToken: string, title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        { properties: { title: 'Master Claims Summary' } },
        { properties: { title: 'Latest Claim Details' } },
        { properties: { title: 'Receipts Audit Trail' } }
      ]
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
  };
}

export async function syncClaimToGoogleSheet(
  accessToken: string,
  spreadsheetIdOrUrl: string,
  claim: StaffClaimFormState
): Promise<string> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  if (!spreadsheetId) {
    throw new Error('Please provide your existing Google Sheet URL or Spreadsheet ID.');
  }

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

  // 1. Append summary row to "Master Claims Summary" (or create sheet if not exists)
  const summaryRow = [
    new Date().toISOString().split('T')[0],
    claim.staffName || '',
    claim.icNo || '',
    claim.claimFor || '',
    claim.dateFrom || '',
    claim.dateTo || '',
    grandTotal.toFixed(2),
    claim.items.length,
    claim.supervisorName || '',
    claim.directorName || ''
  ];

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Master Claims Summary!A:J:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Master Claims Summary!A:J',
        majorDimension: 'ROWS',
        values: [summaryRow],
      }),
    });
  } catch (e) {
    console.warn('Could not append to Master Claims Summary, writing directly:', e);
  }

  // 2. Update Detailed Claim Form worksheet ("Latest Claim Details")
  const sheet1Values: any[][] = [
    ['EMO BOOK SERVICES SDN BHD (679385-W)'],
    ['7 & 9, JALAN PJS 7/17, BANDAR SUNWAY, 46150 PETALING JAYA, SELANGOR, MALAYSIA.'],
    ['TEL : 03-56311500    EMAIL : cs@emobooks.com'],
    [],
    ['STAFF MONTHLY CLAIM FORM (MASTER FILE SYNC)'],
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
    sheet1Values.push([codeItem.code, codeItem.detail, amountVal, remarkVal]);
  });

  sheet1Values.push([]);
  sheet1Values.push(['', 'TOTAL (RM)', grandTotal.toFixed(2), '']);
  sheet1Values.push([]);
  sheet1Values.push(['CLAIMED BY :', '', 'APPROVED BY :', '', 'APPROVED BY :']);
  sheet1Values.push([`NAME : ${claim.staffName || ''}`, '', `SUPERVISOR : ${claim.supervisorName || ''}`, '', `DIRECTOR : ${claim.directorName || ''}`]);
  sheet1Values.push([`DATE : ${claim.claimedDate || new Date().toISOString().split('T')[0]}`, '', `DATE : ${claim.supervisorDate || ''}`, '', `DATE : ${claim.directorDate || ''}`]);

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Latest Claim Details!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Latest Claim Details!A1',
      majorDimension: 'ROWS',
      values: sheet1Values,
    }),
  });

  // 3. Update Receipts Audit Trail
  const sheet2Values: any[][] = [
    ['RECEIPT ITEMS AUDIT TRAIL'],
    [`Staff: ${claim.staffName || 'N/A'} | Claim Period: ${claim.claimFor || 'N/A'}`],
    [],
    ['Item #', 'Date', 'Merchant / Store', 'Receipt #', 'Expense Code', 'Expense Details', 'Amount (RM)', 'Remark / Purpose', 'OCR Confidence']
  ];

  claim.items.forEach((item, idx) => {
    sheet2Values.push([
      idx + 1,
      item.date,
      item.merchantName,
      item.receiptNumber || '-',
      item.code,
      item.details,
      Number(item.amount).toFixed(2),
      item.remark,
      item.confidence
    ]);
  });

  sheet2Values.push([]);
  sheet2Values.push(['', '', '', '', '', 'GRAND TOTAL (RM)', grandTotal.toFixed(2)]);

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Receipts Audit Trail!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Receipts Audit Trail!A1',
      majorDimension: 'ROWS',
      values: sheet2Values,
    }),
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
