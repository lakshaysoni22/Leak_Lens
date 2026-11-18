import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Calendar, FileText } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Privacy Policy — LeakLens</title>
        <meta
          name="description"
          content="LeakLens Privacy Policy. Learn about our strict zero-knowledge search query handling, data minimization, and user privacy safeguards."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <Badge variant="success">Legal &amp; Privacy</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#929BAD] pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#A3FF6F]" />
              <span>Effective: January 15, 2024</span>
            </span>
            <span className="text-white/20">•</span>
            <span>Last Updated: November 2024</span>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="glass p-6 rounded-2xl border border-[#A3FF6F]/30 bg-[#A3FF6F]/5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#A3FF6F] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed">
            <strong className="text-[#A3FF6F]">Zero-Search Log Guarantee:</strong> LeakLens does not
            log, record, store, or sell the email addresses, usernames, domains, or IP addresses you
            submit for security scans. All scans are executed in volatile RAM and immediately discarded.
          </div>
        </div>

        {/* Legal Text Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 sm:p-12 rounded-3xl border border-white/[0.08] space-y-10 text-sm leading-relaxed text-[#929BAD]"
        >
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">1.</span> Information We Collect
            </h2>
            <p>
              LeakLens operates on the principle of strict data minimization. The categories of
              information we process include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong className="text-[#F5F7FA]">Account Information:</strong> When you register for
                an account, we collect your name, email address, username, and encrypted authentication
                credentials.
              </li>
              <li>
                <strong className="text-[#F5F7FA]">Billing Data:</strong> For paid subscriptions,
                payment processing is handled directly by PCI-DSS compliant third-party payment gateways
                (Stripe/PayPal). We do not store complete credit card numbers on our servers.
              </li>
              <li>
                <strong className="text-[#F5F7FA]">Query Telemetry (Ephemeral Only):</strong> Search
                inputs are processed in memory using cryptographic k-Anonymity hash matching and are
                never appended to user profiles or persistent databases.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">2.</span> How We Use Information
            </h2>
            <p>We use the limited information collected strictly for:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Delivering and securing the LeakLens intelligence platform</li>
              <li>Authenticating users and preventing brute force or abusive automated access</li>
              <li>Dispatching critical account security notifications and verified breach alerts</li>
              <li>Processing plan subscriptions, invoicing, and service renewal authorizations</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">3.</span> Data Storage, Retention &amp; Security
            </h2>
            <p>
              All account information is stored in hardened, geographically partitioned cloud facilities
              protected by AES-256 encryption at rest and TLS 1.3 in transit. We retain account records
              only for as long as your account is active. If you delete your account, all associated
              metadata and tokens are permanently purged within 30 days.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">4.</span> Third-Party Service Providers
            </h2>
            <p>
              We do not sell, rent, or lease personal information to third parties. We only share
              necessary data with accredited infrastructure providers who meet rigorous security and
              GDPR/SOC 2 standards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Infrastructure &amp; Cloud Compute: Amazon Web Services / Google Cloud Platform</li>
              <li>Transactional Email: Postmark / SendGrid (strictly for system auth tokens)</li>
              <li>Payment Processing: Stripe (PCI-DSS Level 1 Provider)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">5.</span> Your Rights (GDPR &amp; CCPA/CPRA)
            </h2>
            <p>
              Regardless of your geographic location, LeakLens affords all users full privacy rights:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>The right to access and receive a portable copy of your account data</li>
              <li>The right to rectify inaccurate or outdated personal details</li>
              <li>The right to erasure (&quot;Right to be Forgotten&quot;) without impediment</li>
              <li>The right to restrict or object to automated processing</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">6.</span> Contact Our Data Protection Officer
            </h2>
            <p>
              For privacy inquiries, data subject requests, or questions regarding our cryptographic
              zero-log architecture, please contact:
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#F5F7FA]">
              Data Protection Office: privacy@leaklens.io
              <br />
              LeakLens Labs Inc., 548 Market St, Suite 72000, San Francisco, CA 94104
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default PrivacyPolicyPage;
