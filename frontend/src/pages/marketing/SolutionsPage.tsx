import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  User,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Lock,
  Zap,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const SolutionsPage: React.FC = () => {
  const tiers = [
    {
      id: 'individuals',
      title: 'For Individuals & Researchers',
      subtitle: 'Reclaim your online privacy and eliminate identity theft vulnerabilities.',
      icon: User,
      badge: 'Personal Defense',
      color: '#A3FF6F',
      useCases: [
        'Checking if your personal or financial emails appeared in darkweb dumps',
        'Uncovering forgotten or dormant accounts across 300+ public registries',
        'Receiving automated alerts when newly compromised database leaks include your credentials',
        'Reviewing step-by-step password and credential rotation checklists',
      ],
      benefits: [
        'Complete zero-log peace of mind with k-Anonymity privacy',
        'Free tier available with no credit card required',
        'Clear risk scoring without confusing technical jargon',
      ],
      ctaText: 'Start Personal Assessment',
      ctaHref: '/auth/signup',
    },
    {
      id: 'teams',
      title: 'For Security Teams & IT Admins',
      subtitle: 'Continuous surveillance of company credentials, developer assets, and brand spoofing.',
      icon: Users,
      badge: 'Mid-Market & Startups',
      color: '#45D6FF',
      useCases: [
        'Enforcing proactive credential audits across all corporate email domains',
        'Detecting employee handle leaks on public Git repositories and pastebins',
        'Auditing external DNS records (SPF, DKIM, DMARC) for spoofing misconfigurations',
        'Setting up automated Slack and webhook triggers when employees appear in breach archives',
      ],
      benefits: [
        'Shared workspace with role-based access control (RBAC)',
        'Full REST API access to automate employee onboarding security checks',
        'Exportable executive summaries and compliance proof packets',
      ],
      ctaText: 'Start Team Trial',
      ctaHref: '/auth/signup?plan=business',
    },
    {
      id: 'enterprise',
      title: 'For Enterprise & Critical Infrastructure',
      subtitle: 'Scalable attack surface management, custom threat feeds, and dedicated SLAs.',
      icon: Building2,
      badge: 'Global Scale',
      color: '#8B7CFF',
      useCases: [
        'Surveillance of hundreds of corporate root domains, subdomains, and subsidiary brands',
        'Real-time homoglyph and punycode detection to stop executive spear-phishing campaigns',
        'Direct SIEM and SOAR pipeline ingestion for enterprise SecOps teams',
        'Custom risk weighting tailored to regulatory and sector requirements (HIPAA, FINRA, SOC 2)',
      ],
      benefits: [
        'Guaranteed 99.99% uptime SLA with 24/7 dedicated engineering support',
        'Option for private cloud instance or air-gapped VPC deployment',
        'Single Sign-On (SAML/Okta) and automated SCIM provisioning',
      ],
      ctaText: 'Contact Enterprise Team',
      ctaHref: '/contact?subject=Enterprise+Solutions',
    },
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Solutions — LeakLens for Individuals, Teams &amp; Enterprise</title>
        <meta
          name="description"
          content="Explore tailored cybersecurity solutions for individual digital footprint protection, IT security teams, and enterprise attack surface management."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="success">Targeted Solutions</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            Security Intelligence for <span className="gradient-green">Every Scale</span>
          </h1>
          <p className="text-lg text-[#929BAD] leading-relaxed">
            Whether securing personal accounts, defending a fast-growing tech startup, or auditing
            global enterprise infrastructure, LeakLens provides purpose-built exposure defense.
          </p>
        </section>

        {/* 3 Solutions Tiers */}
        <section className="space-y-16">
          {tiers.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <motion.div
                key={sol.id}
                id={sol.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass p-8 sm:p-12 rounded-3xl border border-white/[0.08] relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Info + Use Cases */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${sol.color}15`,
                          border: `1px solid ${sol.color}35`,
                          color: sol.color,
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="default">{sol.badge}</Badge>
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
                        {sol.title}
                      </h2>
                      <p className="text-base text-[#929BAD] mt-1.5">{sol.subtitle}</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                        Primary Use Cases:
                      </h3>
                      <div className="space-y-2">
                        {sol.useCases.map((uc, uIdx) => (
                          <div key={uIdx} className="flex items-start gap-2.5 text-sm text-[#929BAD]">
                            <CheckCircle2
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: sol.color }}
                            />
                            <span>{uc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Benefits Card */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-[#F5F7FA] mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" style={{ color: sol.color }} />
                        <span>Key Advantages</span>
                      </h3>
                      <div className="space-y-3">
                        {sol.benefits.map((ben, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F5F7FA]">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                              style={{ backgroundColor: sol.color }}
                            />
                            <span>{ben}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06]">
                      <Link
                        to={sol.ctaHref}
                        className="btn-primary w-full justify-center text-sm"
                      >
                        <span>{sol.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Global Consultation CTA */}
        <section className="glass p-10 sm:p-14 rounded-3xl border border-white/[0.08] text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            Not sure which solution fits your security requirements?
          </h2>
          <p className="text-sm sm:text-base text-[#929BAD] max-w-xl mx-auto">
            Our cybersecurity engineers can provide an initial attack surface overview and recommend
            the ideal monitoring architecture.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/contact" className="btn-primary text-sm px-6 py-3">
              Schedule Architecture Review
            </Link>
            <Link to="/pricing" className="btn-secondary text-sm px-6 py-3">
              Compare Tiers
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default SolutionsPage;
