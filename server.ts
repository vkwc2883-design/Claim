import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with high payload limit for receipt images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloud storage directory on server
const STORAGE_DIR = path.join(__dirname, 'storage_data');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// In-memory/File-backed storage index
const STORAGE_META_FILE = path.join(STORAGE_DIR, 'cloud_index.json');
const CLAIM_STATE_FILE = path.join(STORAGE_DIR, 'latest_claim_state.json');

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Official Claim Codes List from EMO BOOK SERVICES SDN BHD Staff Monthly Claim Form
export const CLAIM_CODES = [
  { code: '400-00', detail: 'CASH PURCHASE (for book / resell only)', description: 'Books, inventory for resale, direct stock purchases' },
  { code: '923-0000', detail: 'ACCOMODATION - STATE:', description: 'Hotel stay, lodging, travel accommodation (state specific)' },
  { code: '928-0000', detail: 'COURIER CHARGES', description: 'Courier, parcel delivery (e.g. J&T, PosLaju, DHL, NinjaVan)' },
  { code: '919-0000', detail: 'ENTERTAINMENT', description: 'Client entertainment, business meals, hospitality' },
  { code: '966-0002', detail: 'SPONSORSHIP - OTHERS - FOR:', description: 'Sponsorships, external event contributions' },
  { code: '913-0000', detail: 'EXHIBITION, ROAD SHOW & PROMOTION', description: 'Book fairs, promotional roadshows, exhibition booths & banners' },
  { code: '946-0000', detail: 'RECRUITMENT EXPENSES', description: 'Job ads, interview fees, hiring expenses' },
  { code: '939-0000', detail: 'LICENSE & REGISTRATION FEE', description: 'Business licensing, SSM fees, official registrations' },
  { code: '940-', detail: 'MEDICAL FEE', description: 'Clinic visits, medical receipts, doctor consultations, medicine' },
  { code: '920-0000', detail: 'PETROL - RON95/DIESEL', description: 'Fuel, petrol station receipts (Petronas, Shell, BHP, Caltex, Petron)' },
  { code: '921-0001', detail: 'PARKING', description: 'Parking tickets, roadside parking, Touch n Go parking, mall parking' },
  { code: '921-0002', detail: 'TOLL', description: 'Toll receipts, Touch n Go reload / toll statement, highway fees' },
  { code: '910-0000', detail: 'PRINTING & STATIONERY', description: 'Office stationery, paper, pens, printing, binding, toner' },
  { code: '912-0000', detail: 'POSTAGE & STAMP', description: 'Stamps, official postal franking, post office mail' },
  { code: '905-0001', detail: 'TRAVELLING EXPENSES - GRAB, PUBLIC TRANSPORT', description: 'Grab rides, taxi, LRT, MRT, bus, KTM e-hailing & transit' },
  { code: '905-0002', detail: 'TRAVELLING EXPENSES - LOCAL', description: 'Local travel mileage, intercity bus/train' },
  { code: '922-', detail: 'ATTENDANCE ALLOWANCE', description: 'Attendance allowance claim' },
  { code: '925-0000', detail: 'STAFF ALLOWANCE', description: 'General staff allowance, shift/duty allowances' },
  { code: '926-0000', detail: 'STAFF WELFARE', description: 'Staff pantry supplies, team pantry snacks, team building, condolence/welfare' },
  { code: '968-', detail: 'TRAVELLING ALLOWANCE', description: 'Fixed travel allowance or per diem' },
  { code: '615-0000', detail: 'CARRIAGE INWARDS (for forwarder only)', description: 'Freight charges, freight forwarding, cargo shipping inwards' },
  { code: '959-0001', detail: 'UPKEEP OF HARDWARE', description: 'Computer repair, IT hardware parts, mouse, keyboard, monitor maintenance' },
  { code: '906-0001', detail: 'UPKEEP OF MOTOR VEHICLE (for van only)', description: 'Company van servicing, tire change, motor vehicle maintenance' },
  { code: '918-0000', detail: 'UPKEEP OF OFFICE', description: 'Aircond servicing, office repairs, cleaning supplies, plumbing' },
  { code: '924-', detail: 'WAGES / OVERTIME', description: 'Staff overtime claims, extra shift hours wages' },
  { code: '909-0000', detail: 'TELEPHONE CHARGES', description: 'Mobile bill, office phone line, telco data reload (Maxis, Celcom, Digi, etc.)' },
  { code: '952-0001', detail: 'TRANSPORTATION (Delivery Expenses)', description: 'Direct delivery runners, lorry transport, dispatch fees' },
  { code: '617-0001', detail: 'PACKING MATERIAL - BOX', description: 'Carton boxes, shipping boxes, cardboard packaging' },
  { code: '617-0002', detail: 'PACKING MATERIAL - BAG/ PLASTIC BAG', description: 'Plastic bags, poly mailers, courier bags' },
  { code: '617-0003', detail: 'PACKING MATERIAL - OTHERS EG. BUBBLE WRAP', description: 'Bubble wrap, tape, stretch film, fragile stickers' },
  { code: 'OTHERS', detail: 'OTHERS', description: 'Any other company operational expense not covered above' }
];

// Helper to sanitize base64
function cleanBase64(base64Data: string): { mimeType: string; data: string } {
  const match = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2],
    };
  }
  return {
    mimeType: 'image/jpeg',
    data: base64Data,
  };
}

// API: OCR & Automatic Categorization using Gemini 3.8 Flash
app.post('/api/scan', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const { mimeType: detectedMime, data } = cleanBase64(imageBase64);
    const finalMime = mimeType || detectedMime;

    const codeListPrompt = CLAIM_CODES.map(c => `- CODE "${c.code}": "${c.detail}" (${c.description})`).join('\n');

    const promptText = `
You are an expert Malaysian corporate accounting OCR assistant analyzing an expense receipt, bill, or invoice for EMO BOOK SERVICES SDN BHD.
Analyze this receipt image thoroughly and extract all information accurately.

CRITICAL REQUIREMENT - CATEGORIZATION BY 'CODE':
You MUST categorize this receipt strictly matching one of the official codes below:
${codeListPrompt}

Categorization instructions:
- Petrol / Fuel receipts (e.g. Petronas, Shell, Caltex, BHP, Petron) -> '920-0000'
- Parking tickets or receipts -> '921-0001'
- Toll / Touch 'n Go -> '921-0002'
- Grab, Taxi, MRT, LRT, Bus, e-hailing -> '905-0001'
- Stationery, paper, printing, bookstore office supplies -> '910-0000'
- Courier, PosLaju, J&T, DHL, Ninja Van -> '928-0000'
- Mobile, phone bills, internet reload -> '909-0000'
- Clinic, pharmacy, doctor, medical fee -> '940-'
- Meals, dining, cafe business entertainment -> '919-0000'
- Packing boxes -> '617-0001'
- Packing bags/plastic bags -> '617-0002'
- Bubble wrap, tape -> '617-0003'
- Books purchase for resell -> '400-00'
- Accommodation/hotel -> '923-0000'
- Hardware repair -> '959-0001'
- Motor vehicle (van) upkeep -> '906-0001'
- Office upkeep/cleaning -> '918-0000'
- If none of these match, select 'OTHERS'.

Output JSON format strictly conforming to the requested schema. Ensure amounts are numbers (e.g. 15.50), date is YYYY-MM-DD format (if ambiguous use best estimate or today's date), and provide extracted text summary.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: finalMime,
              data: data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: {
              type: Type.STRING,
              description: 'Name of the merchant or store, e.g. PETRONAS SUNWAY, GRAB, POPULAR BOOKSTORE',
            },
            receiptNumber: {
              type: Type.STRING,
              description: 'Invoice or Receipt Number if found',
            },
            date: {
              type: Type.STRING,
              description: 'Date in YYYY-MM-DD format',
            },
            amount: {
              type: Type.NUMBER,
              description: 'Total amount in Malaysian Ringgit (RM)',
            },
            taxAmount: {
              type: Type.NUMBER,
              description: 'Tax or SST amount if displayed',
            },
            currency: {
              type: Type.STRING,
              description: 'Currency code, usually MYR or RM',
            },
            code: {
              type: Type.STRING,
              description: 'The exact matching CODE from the list, e.g. 920-0000, 921-0001, 910-0000',
            },
            details: {
              type: Type.STRING,
              description: 'The exact DETAILS title matching the code',
            },
            remark: {
              type: Type.STRING,
              description: 'Concise remark describing the purchase, e.g., Petrol RON95 for customer delivery',
            },
            confidence: {
              type: Type.STRING,
              description: 'HIGH, MEDIUM, or LOW',
            },
            lineItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  qty: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                },
              },
            },
            ocrRawText: {
              type: Type.STRING,
              description: 'Key raw text lines extracted from the receipt for audit trail',
            },
          },
          required: ['merchantName', 'date', 'amount', 'code', 'details', 'remark'],
        },
      },
    });

    const resultText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(resultText);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI OCR response', raw: resultText });
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('OCR scanning error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to scan and categorize receipt',
    });
  }
});

// API: Get available codes list
app.get('/api/codes', (req, res) => {
  res.json({ codes: CLAIM_CODES });
});

// API: Cloud Storage - Upload & persist receipt image or claim file
app.post('/api/storage/upload', (req, res) => {
  try {
    const { filename, fileData, mimeType, meta } = req.body;
    if (!filename || !fileData) {
      return res.status(400).json({ error: 'Filename and fileData are required' });
    }

    // Clean filename
    const safeName = `${Date.now()}_${path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(STORAGE_DIR, safeName);

    const { data } = cleanBase64(fileData);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

    // Update index
    let index: any[] = [];
    if (fs.existsSync(STORAGE_META_FILE)) {
      try {
        index = JSON.parse(fs.readFileSync(STORAGE_META_FILE, 'utf-8'));
      } catch (e) {
        index = [];
      }
    }

    const fileMeta = {
      id: safeName,
      originalName: filename,
      mimeType: mimeType || 'image/jpeg',
      size: fs.statSync(filePath).size,
      uploadedAt: new Date().toISOString(),
      url: `/api/storage/files/${safeName}`,
      meta: meta || {},
    };

    index.unshift(fileMeta);
    fs.writeFileSync(STORAGE_META_FILE, JSON.stringify(index, null, 2));

    res.json({
      success: true,
      file: fileMeta,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save to cloud storage' });
  }
});

// API: Cloud Storage - List files
app.get('/api/storage/files', (req, res) => {
  try {
    let index: any[] = [];
    if (fs.existsSync(STORAGE_META_FILE)) {
      try {
        index = JSON.parse(fs.readFileSync(STORAGE_META_FILE, 'utf-8'));
      } catch (e) {
        index = [];
      }
    }
    const totalSize = index.reduce((acc, f) => acc + (f.size || 0), 0);
    res.json({
      files: index,
      totalCount: index.length,
      totalSizeBytes: totalSize,
      storageStatus: 'Connected & Synced',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list storage files' });
  }
});

// API: Cloud Storage - Get specific file
app.get('/api/storage/files/:filename', (req, res) => {
  const filePath = path.join(STORAGE_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
});

// API: Cloud Storage - Delete specific file
app.delete('/api/storage/files/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(STORAGE_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (fs.existsSync(STORAGE_META_FILE)) {
      try {
        let index = JSON.parse(fs.readFileSync(STORAGE_META_FILE, 'utf-8'));
        index = index.filter((f: any) => f.id !== filename);
        fs.writeFileSync(STORAGE_META_FILE, JSON.stringify(index, null, 2));
      } catch (e) {}
    }

    res.json({ success: true, deleted: filename });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Cloud Storage - Sync full claim state
app.post('/api/storage/sync', (req, res) => {
  try {
    const claimState = req.body;
    fs.writeFileSync(CLAIM_STATE_FILE, JSON.stringify({
      updatedAt: new Date().toISOString(),
      ...claimState,
    }, null, 2));
    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Cloud Storage - Retrieve synced claim state
app.get('/api/storage/sync', (req, res) => {
  try {
    if (fs.existsSync(CLAIM_STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CLAIM_STATE_FILE, 'utf-8'));
      return res.json({ found: true, state: data });
    }
    res.json({ found: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in development with Vite middlewares, or static build in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
