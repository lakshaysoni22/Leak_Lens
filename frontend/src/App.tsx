import { Suspense, lazy, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Logo from './components/shared/Logo'

// ── Loading fallback ──────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
      <Logo size="lg" />
      <div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Route guards ──────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  if (user?.role !== 'admin' && user?.role !== 'super_admin') return <Navigate to="/app/dashboard" replace />
  return <>{children}</>
}

// ── Page import functions (used for both lazy() and prefetch) ─────
const pageImports = {
  // Marketing
  home: () => import('./pages/marketing/HomePage'),
  features: () => import('./pages/marketing/FeaturesPage'),
  pricing: () => import('./pages/marketing/PricingPage'),
  about: () => import('./pages/marketing/AboutPage'),
  contact: () => import('./pages/marketing/ContactPage'),
  solutions: () => import('./pages/marketing/SolutionsPage'),
  docs: () => import('./pages/marketing/DocumentationPage'),
  security: () => import('./pages/marketing/SecurityPage'),
  privacyPolicy: () => import('./pages/marketing/PrivacyPolicyPage'),
  terms: () => import('./pages/marketing/TermsPage'),
  cookies: () => import('./pages/marketing/CookiePolicyPage'),
  acceptableUse: () => import('./pages/marketing/AcceptableUsePage'),
  faq: () => import('./pages/marketing/FAQPage'),
  status: () => import('./pages/marketing/StatusPage'),
  // Auth
  login: () => import('./pages/auth/LoginPage'),
  signup: () => import('./pages/auth/SignupPage'),
  forgotPassword: () => import('./pages/auth/ForgotPasswordPage'),
  resetPassword: () => import('./pages/auth/ResetPasswordPage'),
  verifyEmail: () => import('./pages/auth/VerifyEmailPage'),
  mfaSetup: () => import('./pages/auth/MFASetupPage'),
  mfaVerify: () => import('./pages/auth/MFAVerifyPage'),
  // App
  appLayout: () => import('./components/layout/AppLayout'),
  dashboard: () => import('./pages/app/DashboardPage'),
  emailScanner: () => import('./pages/app/EmailScannerPage'),
  usernameScanner: () => import('./pages/app/UsernameScannerPage'),
  domainScanner: () => import('./pages/app/DomainScannerPage'),
  phishing: () => import('./pages/app/PhishingPage'),
  threatIntel: () => import('./pages/app/ThreatIntelPage'),
  riskAnalytics: () => import('./pages/app/RiskAnalyticsPage'),
  exposureHistory: () => import('./pages/app/ExposureHistoryPage'),
  reports: () => import('./pages/app/ReportsPage'),
  monitoring: () => import('./pages/app/MonitoringPage'),
  notifications: () => import('./pages/app/NotificationsPage'),
  integrations: () => import('./pages/app/IntegrationsPage'),
  apiAccess: () => import('./pages/app/APIAccessPage'),
  profile: () => import('./pages/app/ProfilePage'),
  securitySettings: () => import('./pages/app/SecuritySettingsPage'),
  privacyCenter: () => import('./pages/app/PrivacyCenterPage'),
  subscription: () => import('./pages/app/SubscriptionPage'),
  help: () => import('./pages/app/HelpPage'),
  aiAssistant: () => import('./pages/app/AIAssistantPage'),
  // Admin
  adminDashboard: () => import('./pages/admin/AdminDashboardPage'),
  userManagement: () => import('./pages/admin/UserManagementPage'),
  auditLogs: () => import('./pages/admin/AuditLogsPage'),
  systemHealth: () => import('./pages/admin/SystemHealthPage'),
} as const

// ── Route-to-import mapping for prefetch on hover ─────────────────
export const routePrefetchMap: Record<string, () => Promise<unknown>> = {
  '/app/dashboard': pageImports.dashboard,
  '/app/email-scanner': pageImports.emailScanner,
  '/app/username-scanner': pageImports.usernameScanner,
  '/app/domain-scanner': pageImports.domainScanner,
  '/app/phishing': pageImports.phishing,
  '/app/threat-intel': pageImports.threatIntel,
  '/app/risk-analytics': pageImports.riskAnalytics,
  '/app/history': pageImports.exposureHistory,
  '/app/reports': pageImports.reports,
  '/app/monitoring': pageImports.monitoring,
  '/app/notifications': pageImports.notifications,
  '/app/integrations': pageImports.integrations,
  '/app/api-access': pageImports.apiAccess,
  '/app/profile': pageImports.profile,
  '/app/security': pageImports.securitySettings,
  '/app/privacy': pageImports.privacyCenter,
  '/app/subscription': pageImports.subscription,
  '/app/help': pageImports.help,
  '/app/ai-assistant': pageImports.aiAssistant,
  '/admin/dashboard': pageImports.adminDashboard,
  '/admin/users': pageImports.userManagement,
  '/admin/audit-logs': pageImports.auditLogs,
  '/admin/system-health': pageImports.systemHealth,
}

// Prefetch a route's chunk (call on hover, noop if already loaded)
const prefetchedRoutes = new Set<string>()
export function prefetchRoute(path: string) {
  if (prefetchedRoutes.has(path)) return
  const importer = routePrefetchMap[path]
  if (importer) {
    prefetchedRoutes.add(path)
    importer() // triggers Vite's dynamic import → loads the chunk
  }
}

// ── Lazy page components (using same import functions) ────────────
const HomePage = lazy(pageImports.home)
const FeaturesPage = lazy(pageImports.features)
const PricingPage = lazy(pageImports.pricing)
const AboutPage = lazy(pageImports.about)
const ContactPage = lazy(pageImports.contact)
const SolutionsPage = lazy(pageImports.solutions)
const DocumentationPage = lazy(pageImports.docs)
const SecurityPage = lazy(pageImports.security)
const PrivacyPolicyPage = lazy(pageImports.privacyPolicy)
const TermsPage = lazy(pageImports.terms)
const CookiePolicyPage = lazy(pageImports.cookies)
const AcceptableUsePage = lazy(pageImports.acceptableUse)
const FAQPage = lazy(pageImports.faq)
const StatusPage = lazy(pageImports.status)

const LoginPage = lazy(pageImports.login)
const SignupPage = lazy(pageImports.signup)
const ForgotPasswordPage = lazy(pageImports.forgotPassword)
const ResetPasswordPage = lazy(pageImports.resetPassword)
const VerifyEmailPage = lazy(pageImports.verifyEmail)
const MFASetupPage = lazy(pageImports.mfaSetup)
const MFAVerifyPage = lazy(pageImports.mfaVerify)

const AppLayout = lazy(pageImports.appLayout)
const DashboardPage = lazy(pageImports.dashboard)
const EmailScannerPage = lazy(pageImports.emailScanner)
const UsernameScannerPage = lazy(pageImports.usernameScanner)
const DomainScannerPage = lazy(pageImports.domainScanner)
const PhishingPage = lazy(pageImports.phishing)
const ThreatIntelPage = lazy(pageImports.threatIntel)
const RiskAnalyticsPage = lazy(pageImports.riskAnalytics)
const ExposureHistoryPage = lazy(pageImports.exposureHistory)
const ReportsPage = lazy(pageImports.reports)
const MonitoringPage = lazy(pageImports.monitoring)
const NotificationsPage = lazy(pageImports.notifications)
const IntegrationsPage = lazy(pageImports.integrations)
const APIAccessPage = lazy(pageImports.apiAccess)
const ProfilePage = lazy(pageImports.profile)
const SecuritySettingsPage = lazy(pageImports.securitySettings)
const PrivacyCenterPage = lazy(pageImports.privacyCenter)
const SubscriptionPage = lazy(pageImports.subscription)
const HelpPage = lazy(pageImports.help)
const AIAssistantPage = lazy(pageImports.aiAssistant)

const AdminDashboardPage = lazy(pageImports.adminDashboard)
const UserManagementPage = lazy(pageImports.userManagement)
const AuditLogsPage = lazy(pageImports.auditLogs)
const SystemHealthPage = lazy(pageImports.systemHealth)

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  // Idle preloading — after first render, preload critical pages in background
  useEffect(() => {
    const idlePreload = () => {
      // Preload the most visited pages during idle time
      const criticalRoutes = [
        pageImports.dashboard,
        pageImports.appLayout,
        pageImports.emailScanner,
        pageImports.domainScanner,
        pageImports.phishing,
        pageImports.threatIntel,
        pageImports.riskAnalytics,
      ]

      let i = 0
      const loadNext = () => {
        if (i < criticalRoutes.length) {
          criticalRoutes[i]()
          i++
          // Stagger loads to not block main thread
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(loadNext, { timeout: 3000 })
          } else {
            setTimeout(loadNext, 200)
          }
        }
      }

      // Start after 2 seconds (let initial page settle)
      setTimeout(() => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadNext, { timeout: 5000 })
        } else {
          loadNext()
        }
      }, 2000)
    }

    idlePreload()
  }, [])

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* ── Marketing ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/acceptable-use" element={<AcceptableUsePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/status" element={<StatusPage />} />

        {/* ── Auth ── */}
        <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/auth/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/mfa-setup" element={<ProtectedRoute><MFASetupPage /></ProtectedRoute>} />
        <Route path="/auth/mfa-verify" element={<MFAVerifyPage />} />

        {/* ── Authenticated App ── */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="email-scanner" element={<EmailScannerPage />} />
          <Route path="username-scanner" element={<UsernameScannerPage />} />
          <Route path="domain-scanner" element={<DomainScannerPage />} />
          <Route path="phishing" element={<PhishingPage />} />
          <Route path="threat-intel" element={<ThreatIntelPage />} />
          <Route path="risk-analytics" element={<RiskAnalyticsPage />} />
          <Route path="history" element={<ExposureHistoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="api-access" element={<APIAccessPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="security" element={<SecuritySettingsPage />} />
          <Route path="privacy" element={<PrivacyCenterPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
        </Route>

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="system-health" element={<SystemHealthPage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
