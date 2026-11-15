// All TypeScript interfaces for LEAKLENS

// ── Auth ───────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: 'user' | 'analyst' | 'admin' | 'super_admin';
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  mfa_required: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  full_name: string;
  accept_terms: boolean;
}

// ── Assessments ────────────────────────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ScanType = 'email' | 'username' | 'domain' | 'url' | 'ip';
export type DataSource = 'synthetic' | 'live_intelligence' | 'demo';

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  contribution: number;
  explanation: string;
}

export interface ExposureRecord {
  source_name: string;
  source_date: string | null;
  data_categories: string[];
  severity: string;
  is_verified: boolean;
  data_source_type: string;
}

export interface Recommendation {
  priority: string;
  action: string;
  explanation: string;
  category: string;
}

export interface ScanResult {
  assessment_id: string;
  scan_type: ScanType;
  identifier_hint: string;
  risk_score: number;
  risk_level: RiskLevel;
  exposure_count: number;
  data_source: DataSource;
  data_notice: string;
  summary: string;
  exposure_records: ExposureRecord[];
  risk_factors: RiskFactor[];
  recommendations: Recommendation[];
  is_demo: boolean;
  created_at: string;
  platform_mentions?: string[];
}

export interface AssessmentListItem {
  id: string;
  scan_type: ScanType;
  identifier_hint: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  exposure_count: number;
  data_source: DataSource;
  summary: string;
  created_at: string;
}

// ── Dashboard ──────────────────────────────────────────────────
export interface DashboardStats {
  total_assessments: number;
  this_week: number;
  high_risk: number;
  critical_risk: number;
  monitored_identifiers: number;
  active_alerts: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface TrendPoint {
  date: string;
  scans: number;
}

export interface DashboardOverview {
  user: { full_name: string; email: string; role: string; is_verified: boolean };
  stats: DashboardStats;
  risk_distribution: RiskDistribution;
  trend: TrendPoint[];
  scan_type_breakdown?: Record<string, number>;
  recent_assessments: AssessmentListItem[];
}

// ── Domain Scanner ─────────────────────────────────────────────
export interface DomainFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  finding: string;
  recommendation: string;
}

export interface DomainScanResult {
  domain: string;
  security_score: number;
  security_level: 'good' | 'fair' | 'poor' | 'critical';
  ssl: {
    https_available: boolean;
    ssl_valid: boolean;
    cert_issuer?: string;
    cert_expires?: string;
    days_until_expiry?: number;
    ssl_version?: string;
    ssl_error?: string;
  };
  dns: { dns_resolves: boolean; ip_addresses: string[] };
  findings: DomainFinding[];
  recommendations: string[];
  data_notice: string;
  scanned_at: string;
}

// ── Phishing ───────────────────────────────────────────────────
export interface PhishingResult {
  domain: string;
  scheme: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_factors: Array<{ severity: string; finding: string; category: string }>;
  is_https: boolean;
  recommendations: string[];
  data_notice: string;
  analyzed_at: string;
}

// ── Subscriptions ──────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  price_monthly: number | null;
  price_yearly: number | null;
  features: string[];
  limits: { assessments_per_month: number; api_access: boolean; team_members: number };
}

// ── API ────────────────────────────────────────────────────────
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
