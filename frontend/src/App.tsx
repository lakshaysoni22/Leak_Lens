import { Suspense, lazy } from 'react'
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

// ── Lazy page imports ─────────────────────────────────────────────
// Marketing
const HomePage = lazy(() => import('./pages/marketing/HomePage'))
const FeaturesPage = lazy(() => import('./pages/marketing/FeaturesPage'))
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'))
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'))
const ContactPage = lazy(() => import('./pages/marketing/ContactPage'))
const SolutionsPage = lazy(() => import('./pages/marketing/SolutionsPage'))
const DocumentationPage = lazy(() => import('./pages/marketing/DocumentationPage'))
const SecurityPage = lazy(() => import('./pages/marketing/SecurityPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/marketing/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./pages/marketing/TermsPage'))
const CookiePolicyPage = lazy(() => import('./pages/marketing/CookiePolicyPage'))
const AcceptableUsePage = lazy(() => import('./pages/marketing/AcceptableUsePage'))
const FAQPage = lazy(() => import('./pages/marketing/FAQPage'))
const StatusPage = lazy(() => import('./pages/marketing/StatusPage'))

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const SignupPage = lazy(() => import('./pages/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const MFASetupPage = lazy(() => import('./pages/auth/MFASetupPage'))
const MFAVerifyPage = lazy(() => import('./pages/auth/MFAVerifyPage'))

// App
const AppLayout = lazy(() => import('./components/layout/AppLayout'))
const DashboardPage = lazy(() => import('./pages/app/DashboardPage'))
const EmailScannerPage = lazy(() => import('./pages/app/EmailScannerPage'))
const UsernameScannerPage = lazy(() => import('./pages/app/UsernameScannerPage'))
const DomainScannerPage = lazy(() => import('./pages/app/DomainScannerPage'))
const PhishingPage = lazy(() => import('./pages/app/PhishingPage'))
const ThreatIntelPage = lazy(() => import('./pages/app/ThreatIntelPage'))
const RiskAnalyticsPage = lazy(() => import('./pages/app/RiskAnalyticsPage'))
const ExposureHistoryPage = lazy(() => import('./pages/app/ExposureHistoryPage'))
const ReportsPage = lazy(() => import('./pages/app/ReportsPage'))
const MonitoringPage = lazy(() => import('./pages/app/MonitoringPage'))
const NotificationsPage = lazy(() => import('./pages/app/NotificationsPage'))
const IntegrationsPage = lazy(() => import('./pages/app/IntegrationsPage'))
const APIAccessPage = lazy(() => import('./pages/app/APIAccessPage'))
const ProfilePage = lazy(() => import('./pages/app/ProfilePage'))
const SecuritySettingsPage = lazy(() => import('./pages/app/SecuritySettingsPage'))
const PrivacyCenterPage = lazy(() => import('./pages/app/PrivacyCenterPage'))
const SubscriptionPage = lazy(() => import('./pages/app/SubscriptionPage'))
const HelpPage = lazy(() => import('./pages/app/HelpPage'))
const AIAssistantPage = lazy(() => import('./pages/app/AIAssistantPage'))

// Admin
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'))
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'))
const SystemHealthPage = lazy(() => import('./pages/admin/SystemHealthPage'))

// ── App ───────────────────────────────────────────────────────────
export default function App() {
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
