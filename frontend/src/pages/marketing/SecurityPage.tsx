import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck,
  CheckCircle2,
  KeyRound,
  Database,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const SecurityPage: React.FC = () => {
  const sections = [
    {
      id: 'data-protection',
      icon: ShieldCheck,
      color: '#A3FF6F',
      title: 'Data Protection & Zero-Knowledge Architecture',
      content: [
        'k-Anonymity Querying: When you search an identifier, only truncated cryptographic hashes are transmitted across network boundaries. Neither our servers nor transit intermediaries ever receive the full plaintext identifier.',
        'Zero Search Logs: We do not retain historical search strings, IP associations, or correlation profiles. Queries are processed strictly in volatile RAM and dismissed immediately upon output delivery.',
        'No Data Brokering: We never monetize, aggregate, repackage, or resell user search patterns to third parties, advertising syndicates, or data brokers.',
      ],
    },
    {
      id: 'encryption',
      icon: Lock,
      color: '#45D6FF',
      title: 'State-of-the-Art Encryption Standards',
      content: [
        'Data in Transit: Enforced TLS 1.3 with strict modern cipher suites, Perfect Forward Secrecy (PFS), and mandatory HTTP Strict Transport Security (HSTS) with preloading.',
        'Data at Rest: All persistence stores, breach hashes, and system configuration volumes utilize AES-256 GCM encryption managed by automated KMS key rotation.',
        'Hashed Indexing: Sensitive breach reference catalogs utilize salted cryptographic hashes (Argon2id and scrypt) to ensure breach artifacts cannot be inverted.',
      ],
    },
    {
      id: 'infrastructure',
      icon: Server,
      color: '#8B7CFF',
      title: 'Resilient Infrastructure & Threat Defense',
      content: [
        'Multi-Cloud Geographic Isolation: Critical lookup backends run on hardened cloud clusters with multi-region failover and distributed denial-of-service (DDoS) mitigation via Anycast edge nodes.',
        'Least Privilege IAM: System internal access is guarded by strict role-based access control (RBAC), multi-factor hardware keys (FIDO2/WebAuthn), and continuous session validation.',
        'Immutable Ephemeral Workloads: Scanner compute instances are deployed using immutable container images that auto-terminate, eliminating persistent attacker footprint opportunities.',
      ],
    },
    {
      id: 'compliance',
      icon: FileCheck,
      color: '#FFB547',
      title: 'Compliance, Audits & Responsible Disclosure',
      content: [
        'SOC 2 Type II Alignment: Our controls and architectural safeguards follow rigorous SOC 2 Trust Services Criteria for Security, Availability, and Confidentiality.',
        'GDPR & CCPA Compliant: Designed from day one to honor data subject rights, right to erasure, and privacy-by-design standards.',
        'Third-Party Penetration Testing: Independent, accredited security research firms conduct continuous annual black-box and white-box penetration testing against our perimeter.',
      ],
    },
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Security Practices &amp; Infrastructure — LeakLens</title>
        <meta
          name="description"
          content="Learn how LeakLens protects user privacy, employs zero-knowledge k-anonymity queries, implements AES-256 encryption, and complies with SOC 2 standards."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="success">Security Posture</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            Security at the <span className="gradient-green">Core of Everything</span>
          </h1>
          <p className="text-lg text-[#929BAD] leading-relaxed">
            As a cybersecurity platform, we hold ourselves to the highest standards of defense,
            transparency, and zero-knowledge privacy.
          </p>
        </section>

        {/* Security Pillars Overview Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-2xl border border-white/[0.08] text-center space-y-2">
            <div className="text-3xl font-extrabold text-[#A3FF6F] font-mono">0-Logs</div>
            <div className="text-sm font-semibold text-[#F5F7FA]">Zero Log Policy</div>
            <p className="text-xs text-[#929BAD]">Search queries never saved to persistent disks</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/[0.08] text-center space-y-2">
            <div className="text-3xl font-extrabold text-[#45D6FF] font-mono">256-Bit</div>
            <div className="text-sm font-semibold text-[#F5F7FA]">End-to-End Encryption</div>
            <p className="text-xs text-[#929BAD]">TLS 1.3 in transit &amp; AES-256 at rest</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/[0.08] text-center space-y-2">
            <div className="text-3xl font-extrabold text-[#8B7CFF] font-mono">k-Anon</div>
            <div className="text-sm font-semibold text-[#F5F7FA]">k-Anonymity Model</div>
            <p className="text-xs text-[#929BAD]">Only partial hash prefixes leave your browser</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/[0.08] text-center space-y-2">
            <div className="text-3xl font-extrabold text-[#FFB547] font-mono">SOC 2</div>
            <div className="text-sm font-semibold text-[#F5F7FA]">Architectural Controls</div>
            <p className="text-xs text-[#929BAD]">Aligned to Trust Services Criteria</p>
          </div>
        </section>

        {/* 4 Deep Dive Sections */}
        <section className="space-y-12">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <motion.div
                key={sec.id}
                id={sec.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass p-8 sm:p-10 rounded-3xl border border-white/[0.08] space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${sec.color}15`,
                      border: `1px solid ${sec.color}35`,
                      color: sec.color,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">{sec.title}</h2>
                </div>

                <div className="space-y-4 pt-2">
                  {sec.content.map((point, pIdx) => {
                    const [heading, ...rest] = point.split(': ');
                    return (
                      <div key={pIdx} className="flex items-start gap-3 text-sm leading-relaxed">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-1"
                          style={{ color: sec.color }}
                        />
                        <p className="text-[#929BAD]">
                          <strong className="text-[#F5F7FA]">{heading}:</strong> {rest.join(': ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Responsible Disclosure Banner */}
        <section className="glass p-8 sm:p-10 rounded-3xl border border-[#A3FF6F]/30 bg-[#A3FF6F]/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-[#F5F7FA]">Responsible Vulnerability Disclosure</h3>
            <p className="text-sm text-[#929BAD] max-w-2xl">
              We welcome reports from ethical security researchers. If you have identified a potential
              vulnerability within LeakLens services, please alert our security team directly.
            </p>
          </div>
          <Link
            to="/contact?subject=Responsible+Disclosure"
            className="btn-primary text-sm shrink-0"
          >
            <span>Submit Security Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default SecurityPage;
