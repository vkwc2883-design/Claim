export interface ClaimCodeItem {
  code: string;
  detail: string;
  description: string;
  iconName?: string;
  categoryGroup?: 'Transport & Fuel' | 'Operations & Office' | 'Personnel & Welfare' | 'Packaging & Shipping' | 'Sales & Marketing' | 'Other';
}

export interface LineItem {
  description: string;
  qty?: number;
  unitPrice?: number;
  total: number;
}

export interface ReceiptItem {
  id: string;
  merchantName: string;
  receiptNumber: string;
  date: string;
  amount: number;
  taxAmount?: number;
  currency: string;
  code: string;
  details: string;
  remark: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  lineItems?: LineItem[];
  ocrRawText?: string;
  imageUrl?: string;
  storageId?: string;
  cloudSynced?: boolean;
  uploadedAt: string;
}

export interface StaffClaimFormState {
  staffName: string;
  icNo: string;
  claimFor: string;
  dateFrom: string;
  dateTo: string;
  supervisorName: string;
  supervisorDate: string;
  directorName: string;
  directorDate: string;
  claimedDate: string;
  items: ReceiptItem[];
}

export interface CloudStorageFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
  meta?: any;
}

export const OFFICIAL_CLAIM_CODES: ClaimCodeItem[] = [
  { code: '400-00', detail: 'CASH PURCHASE (for book / resell only)', description: 'Book stock for inventory resale', categoryGroup: 'Sales & Marketing', iconName: 'BookOpen' },
  { code: '923-0000', detail: 'ACCOMODATION - STATE:', description: 'Hotel stay, lodging state specific', categoryGroup: 'Transport & Fuel', iconName: 'Hotel' },
  { code: '928-0000', detail: 'COURIER CHARGES', description: 'Courier, parcel delivery (J&T, PosLaju, DHL)', categoryGroup: 'Packaging & Shipping', iconName: 'PackageCheck' },
  { code: '919-0000', detail: 'ENTERTAINMENT', description: 'Client entertainment, business meal, hospitality', categoryGroup: 'Sales & Marketing', iconName: 'Utensils' },
  { code: '966-0002', detail: 'SPONSORSHIP - OTHERS - FOR:', description: 'Sponsorships, event contributions', categoryGroup: 'Sales & Marketing', iconName: 'Award' },
  { code: '913-0000', detail: 'EXHIBITION, ROAD SHOW & PROMOTION', description: 'Book fair roadshows, exhibition booths & banners', categoryGroup: 'Sales & Marketing', iconName: 'Megaphone' },
  { code: '946-0000', detail: 'RECRUITMENT EXPENSES', description: 'Job advertisements, hiring interview fees', categoryGroup: 'Personnel & Welfare', iconName: 'UserPlus' },
  { code: '939-0000', detail: 'LICENSE & REGISTRATION FEE', description: 'Business licensing, council / SSM registration', categoryGroup: 'Operations & Office', iconName: 'FileCheck' },
  { code: '940-', detail: 'MEDICAL FEE', description: 'Clinic consultation, prescription, medical bill', categoryGroup: 'Personnel & Welfare', iconName: 'Stethoscope' },
  { code: '920-0000', detail: 'PETROL - RON95/DIESEL', description: 'Fuel from Petronas, Shell, BHP, Caltex, Petron', categoryGroup: 'Transport & Fuel', iconName: 'Fuel' },
  { code: '921-0001', detail: 'PARKING', description: 'Parking fee, mall parking, roadside parking coupon', categoryGroup: 'Transport & Fuel', iconName: 'SquareParking' },
  { code: '921-0002', detail: 'TOLL', description: 'Highway toll receipt, Touch n Go statement', categoryGroup: 'Transport & Fuel', iconName: 'Ticket' },
  { code: '910-0000', detail: 'PRINTING & STATIONERY', description: 'Printing, office stationery, photocopying, toner', categoryGroup: 'Operations & Office', iconName: 'Printer' },
  { code: '912-0000', detail: 'POSTAGE & STAMP', description: 'Postal stamps, franked mail', categoryGroup: 'Packaging & Shipping', iconName: 'Mail' },
  { code: '905-0001', detail: 'TRAVELLING EXPENSES - GRAB, PUBLIC TRANSPORT', description: 'Grab ride, MRT, LRT, bus, taxi', categoryGroup: 'Transport & Fuel', iconName: 'Car' },
  { code: '905-0002', detail: 'TRAVELLING EXPENSES - LOCAL', description: 'Local travel mileage, intercity transit', categoryGroup: 'Transport & Fuel', iconName: 'Compass' },
  { code: '922-', detail: 'ATTENDANCE ALLOWANCE', description: 'Staff attendance incentive/allowance', categoryGroup: 'Personnel & Welfare', iconName: 'CalendarCheck' },
  { code: '925-0000', detail: 'STAFF ALLOWANCE', description: 'Monthly fixed or shift duty allowances', categoryGroup: 'Personnel & Welfare', iconName: 'Coins' },
  { code: '926-0000', detail: 'STAFF WELFARE', description: 'Office pantry snacks, team building, condolence', categoryGroup: 'Personnel & Welfare', iconName: 'HeartHandshake' },
  { code: '968-', detail: 'TRAVELLING ALLOWANCE', description: 'Designated travel allowance per diem', categoryGroup: 'Personnel & Welfare', iconName: 'Briefcase' },
  { code: '615-0000', detail: 'CARRIAGE INWARDS (for forwarder only)', description: 'Freight charges, forwarding cargo inward', categoryGroup: 'Packaging & Shipping', iconName: 'Ship' },
  { code: '959-0001', detail: 'UPKEEP OF HARDWARE', description: 'Computer hardware repair, PC maintenance, monitors', categoryGroup: 'Operations & Office', iconName: 'Cpu' },
  { code: '906-0001', detail: 'UPKEEP OF MOTOR VEHICLE (for van only)', description: 'Company van servicing, tire replacement, battery', categoryGroup: 'Operations & Office', iconName: 'Truck' },
  { code: '918-0000', detail: 'UPKEEP OF OFFICE', description: 'Air conditioner servicing, office repairs, plumbing', categoryGroup: 'Operations & Office', iconName: 'Building' },
  { code: '924-', detail: 'WAGES / OVERTIME', description: 'Overtime claim, holiday extra work hours', categoryGroup: 'Personnel & Welfare', iconName: 'Clock' },
  { code: '909-0000', detail: 'TELEPHONE CHARGES', description: 'Mobile plan bill, broadband, telco reload', categoryGroup: 'Operations & Office', iconName: 'PhoneCall' },
  { code: '952-0001', detail: 'TRANSPORTATION (Delivery Expenses)', description: 'Lorry transport, dispatch runner delivery fees', categoryGroup: 'Transport & Fuel', iconName: 'Navigation' },
  { code: '617-0001', detail: 'PACKING MATERIAL - BOX', description: 'Cardboard carton boxes for book packaging', categoryGroup: 'Packaging & Shipping', iconName: 'Boxes' },
  { code: '617-0002', detail: 'PACKING MATERIAL - BAG/ PLASTIC BAG', description: 'Plastic shopping bags, courier poly mailers', categoryGroup: 'Packaging & Shipping', iconName: 'ShoppingBag' },
  { code: '617-0003', detail: 'PACKING MATERIAL - OTHERS EG. BUBBLE WRAP', description: 'Bubble wrap rolls, packing tape, fragile stickers', categoryGroup: 'Packaging & Shipping', iconName: 'Layers' },
  { code: 'OTHERS', detail: 'OTHERS', description: 'Any other miscellaneous operational expense', categoryGroup: 'Other', iconName: 'MoreHorizontal' }
];
