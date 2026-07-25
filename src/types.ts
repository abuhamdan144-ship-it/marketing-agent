export interface Company {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  boss_name?: string;
  boss_phone?: string;
  notes?: string;
  date: string;
}

export interface Camp {
  id: number;
  name: string;
  location: string;
  company?: string;
  boss_name: string;
  boss_phone: string;
  workers: number;
  notes?: string;
  date: string;
  category?: string;
  salaryDate?: number;
  region?: string;
  landmark?: string;
  mapsLink?: string;
  latitude?: number;
  longitude?: number;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  location?: string;
  type: string; // Individual, Business, Wholesale, Retail
  notes?: string;
  date: string;
}

export interface Visit {
  id: number;
  place: string;
  type: string; // shop, camp, crowd, company, other
  people: number;
  notes?: string;
  date: string;
  time: string;
}

export interface Feedback {
  id: number;
  customer?: string;
  type: string; // Positive, Neutral, Negative
  rating: number; // 1-5
  feedback: string;
  date: string;
}

export interface Complaint {
  id: number;
  customer: string;
  category: string; // Service, Product, Pricing, Staff, Other
  status: string; // Open, In Progress, Resolved
  description: string;
  date: string;
}

export interface CompetitorIntel {
  id: number;
  name: string;
  strategy: string;
  impact: string; // High, Medium, Low
  notes?: string;
  date: string;
}

export interface SocialAd {
  id: number;
  platform: string; // facebook, instagram, tiktok, youtube
  title: string;
  budget?: string;
  status: string; // Active, Pending, Completed
  notes?: string;
  date: string;
}

export interface MarketingPlan {
  id: number;
  title: string;
  details: string;
  budget?: string;
  status: string; // Active, Pending, Completed, On Hold
  date: string;
}

export interface AttendanceRecord {
  id: number;
  date: string; // YYYY-MM-DD
  session: string; // Morning, Afternoon, Evening, Full Day
  placeAndCampVisit: string; // Place and Camp visited
  managerSig: string; // "Signed", "Pending", or manager signature initials/text
  notes?: string;
}

export interface Settings {
  agentName: string;
  managerWhatsApp: string;
  managerEmail: string;
  monthlyVisitGoal?: number;
}

export interface ExchangeRates {
  [key: string]: number | string | undefined;
  pkr?: number;
  inr?: number;
  php?: number;
  bdt?: number;
  npr?: number;
  lkr?: number;
  egp?: number;
  usd?: number;
  lastFetch?: string;
}

export interface AppData {
  companies: Company[];
  camps: Camp[];
  customers: Customer[];
  visits: Visit[];
  feedback: Feedback[];
  complaints: Complaint[];
  competitors: CompetitorIntel[];
  social: SocialAd[];
  plans: MarketingPlan[];
  attendance: AttendanceRecord[];
  settings: Settings;
  rates: ExchangeRates;
}
