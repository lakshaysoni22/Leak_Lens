import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, XCircle, Calendar, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const AcceptableUsePage: React.FC = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Acceptable Use Policy — LeakLens</title>
        <meta
          name="description"
          content="LeakLens Acceptable Use Policy outlining strictly permitted defensive security actions and prohibited offensive, harassment, or scraping activities."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <Badge variant="risk-critical">Security Compliance</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
            Acceptable Use Policy
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#929BAD] pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF5A5A]" />
              <span>Effective Date: January 15, 2024</span>
            </span>
            <span className="text-white/20">•</span>
            <span>Version 2.0</span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="glass p-6 rounded-2xl border border-[#FF5A5A]/30 bg-[#FF5A5A]/5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#FF5A5A] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed">
            <strong className="text-[#FF5A5A]">Strict Defensive Mandate:</strong> LeakLens is built
            to help security engineers, developers, and individuals identify and patch their own
            exposure vectors. Any malicious, unauthorized, or offensive reconnaissance is strictly
            prohibited and will result in immediate termination and referral to law enforcement.
          </div>
        </div>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 sm:p-12 rounded-3xl border border-white/[0.08] space-y-10 text-sm leading-relaxed text-[#929BAD]"
        >
          {/* Section 1: Permitted Uses */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#A3FF6F]" />
              <span>1. Permitted Defensive Activities</span>
            </h2>
            <p>You may use LeakLens solely for authorized, defensive cybersecurity objectives:</p>
            <div className="space-y-2">
              {[
                'Auditing your own personal email addresses, accounts, or corporate domains',
                'Conducting authorized attack surface management on assets owned by your employer or contracting clients',
                'Identifying credential compromise among registered employees to enforce password rotations and MFA rollout',
                'Proactively identifying homoglyphs, typosquatting domains, and brand impersonators',
                'Academic or non-invasive cybersecurity research with written consent',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F5F7FA]">
                  <CheckCircle2 className="w-4 h-4 text-[#A3FF6F] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Prohibited Uses */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#FF5A5A]" />
              <span>2. Strictly Prohibited Malicious Activities</span>
            </h2>
            <p>You may NOT use or attempt to use LeakLens to:</p>
            <div className="space-y-2">
              {[
                'Execute unauthorized reconnaissance against individuals, competitors, or critical infrastructure',
                'Facilitate or perform credential stuffing, password spraying, or account takeover (ATO) campaigns',
                'Dox, stalk, harass, blackmail, or intimidate any private person or public official',
                'Harvest, bulk-scrape, or systematically extract intelligence from our engines without an enterprise API license',
                'Bypass or circumvent rate limits, authentication boundaries, or payment paywalls',
                'Resell raw breach outputs or compile unlawful secondary databases',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#FF5A5A]">
                  <XCircle className="w-4 h-4 text-[#FF5A5A] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Monitoring & Enforcement */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA]">
              3. Telemetry &amp; Enforcement Actions
            </h2>
            <p>
              We employ automated heuristic detectors to spot abnormal query velocity, malicious
              patterns, and unauthorized mass queries. In the event of a suspected violation of this
              policy, LeakLens reserves the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Immediately freeze or permanently terminate active account privileges</li>
              <li>Invalidate active API keys without financial refund</li>
              <li>Block offending IP ranges and subnets at the edge firewall level</li>
              <li>Preserve evidentiary audit logs for submission to relevant law enforcement agencies</li>
            </ul>
          </section>

          {/* Section 4: Reporting Abuse */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA]">
              4. Reporting Suspected Abuse
            </h2>
            <p>
              If you suspect that a user or automated agent is utilizing LeakLens to facilitate harm
              or conduct unauthorized attacks, please alert our emergency incident desk:
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#F5F7FA]">
              Abuse &amp; Incident Desk: abuse@leaklens.io
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default AcceptableUsePage;
