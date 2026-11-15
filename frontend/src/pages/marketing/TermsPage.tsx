import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Calendar, Scale, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const TermsPage: React.FC = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Terms of Service — LeakLens</title>
        <meta
          name="description"
          content="LeakLens Terms of Service agreement governing use of our digital exposure intelligence, scanning engines, and API services."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <Badge variant="warning">Legal Agreement</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
            Terms of Service
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#929BAD] pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#A3FF6F]" />
              <span>Effective Date: January 15, 2024</span>
            </span>
            <span className="text-white/20">•</span>
            <span>Version 2.1</span>
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
              <span className="text-[#A3FF6F]">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing or using the LeakLens website, APIs, or scanning platform (collectively,
              the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you are
              agreeing to these Terms on behalf of an organization or corporate entity, you represent
              that you possess the legal authority to bind that entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">2.</span> Permitted Defensive Use
            </h2>
            <p>
              LeakLens is designed exclusively for security defense, authorized risk assessments, and
              vulnerability mitigation. You agree that you will only query identifiers (emails,
              domains, handles, IP blocks) that you own, operate, or have received explicit written
              authorization to audit.
            </p>
            <div className="p-4 rounded-xl bg-[#FF5A5A]/10 border border-[#FF5A5A]/30 text-xs text-[#FF5A5A] leading-relaxed">
              <strong>Strict Prohibition:</strong> Using LeakLens to harass individuals, execute
              unauthorized reconnaissance for offensive attacks, facilitate credential stuffing, or
              scrape third-party data without consent constitutes immediate ground for permanent
              account termination and potential legal referral.
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">3.</span> Account Registration &amp; API Keys
            </h2>
            <p>
              You must maintain the confidentiality of your account credentials and any issued API
              keys. You are responsible for all activities and scans conducted under your credentials.
              LeakLens reserves the right to suspend or revoke keys that exceed agreed rate limits or
              demonstrate suspicious request patterns.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">4.</span> Subscriptions, Billing &amp; Cancellations
            </h2>
            <p>
              Paid subscription tiers are billed in advance on either a monthly or annual recurring
              basis. You may cancel your subscription at any time via the billing management portal.
              Cancellations take effect at the conclusion of the active billing period. Unless required
              by applicable consumer law, subscription fees are non-refundable.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">5.</span> Intellectual Property Rights
            </h2>
            <p>
              All proprietary algorithms, risk-scoring engines, documentation, visual design, and
              trademarks comprising LeakLens are the exclusive intellectual property of LeakLens Labs
              Inc. You receive a non-exclusive, non-transferable, revocable license to access the
              Service strictly in accordance with your chosen tier.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">6.</span> Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis.
              While we index billions of records from verified historical breaches, LeakLens does not
              warrant that our threat intelligence index captures 100% of all compromised credentials
              or emerging underground leaks. In no event shall LeakLens Labs Inc. be liable for any
              indirect, incidental, or consequential damages arising from reliance on scan outputs.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#A3FF6F]">7.</span> Contact &amp; Governing Law
            </h2>
            <p>
              These Terms are governed by and construed under the laws of the State of California,
              without regard to conflict of law principles. For questions regarding these Terms,
              contact:
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#F5F7FA]">
              Legal Counsel: legal@leaklens.io
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

export default TermsPage;
