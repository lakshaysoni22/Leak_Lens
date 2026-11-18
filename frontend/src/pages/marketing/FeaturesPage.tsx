import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Mail,
  User,
  Globe,
  AlertTriangle,
  Shield,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Database,
  Lock,
  Search,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  mockup: React.ReactNode;
}

export const FeaturesPage: React.FC = () => {
  const featureList: FeatureItem[] = [
    {
      id: 'email-scanner',
      badge: 'Identity Defense',
      title: 'Email Exposure Scanner',
      description:
        'Continuously correlate enterprise and personal email addresses against billions of verified credential dumps, combo lists, and paste sites with sub-second lookups.',
      bullets: [
        'Historical breach enumeration dating back 15+ years',
        'Specific exposure categorization (passwords, salts, phone numbers, PII)',
        'SHA-1 and k-Anonymity hash-matching for privacy-preserving verification',
        'Automatic recurring alerting when newly indexed pastebins surface credentials',
      ],
      icon: Mail,
      accentColor: '#A3FF6F',
      mockup: (
        <div className="glass p-5 rounded-2xl border border-white/[0.09] bg-[#0D1220]/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A5A]" />
              <span className="text-[#F5F7FA] font-sans font-semibold">breach_query_result</span>
            </div>
            <span className="text-[#FF5A5A] text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FF5A5A]/15 border border-[#FF5A5A]/30">
              High Risk
            </span>
          </div>
          <div className="space-y-1.5 text-[#929BAD]">
            <div><span className="text-[#A3FF6F]">TARGET:</span> security-lead@enterprise.com</div>
            <div><span className="text-[#45D6FF]">EXPOSURES_FOUND:</span> 4 verified archives</div>
            <div><span className="text-[#8B7CFF]">DATA_CLASSES:</span> Passwords, IP, Phone</div>
            <div><span className="text-[#FFE066]">FIRST_SEEN:</span> 2021-04-12</div>
          </div>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-[#A3FF6F]">
            ✓ Remediation: Forced password reset dispatched via IdP API.
          </div>
        </div>
      ),
    },
    {
      id: 'username-intelligence',
      badge: 'OSINT Footprint',
      title: 'Username Intelligence',
      description:
        'Trace handle reuse across 300+ platforms including developer repositories, gaming hubs, social media, and darkweb forums to reconstruct attack surfaces.',
      bullets: [
        'Simultaneous asynchronous platform enumeration in under 2 seconds',
        'Confidence scoring based on account profile metadata and registration patterns',
        'Detection of dormant or orphaned developer accounts with active tokens',
        'Cross-platform correlation to spot targeted spear-phishing vulnerability',
      ],
      icon: User,
      accentColor: '#45D6FF',
      mockup: (
        <div className="glass p-5 rounded-2xl border border-white/[0.09] bg-[#0D1220]/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[#F5F7FA] font-sans font-semibold">handle_recon: @alex_dev</span>
            <span className="text-[#45D6FF] text-[10px] font-bold px-2 py-0.5 rounded bg-[#45D6FF]/15">
              34 Profiles Active
            </span>
          </div>
          <div className="space-y-2">
            {[
              { site: 'github.com/alex_dev', status: 'Claimed (Public Keys Found)', ok: true },
              { site: 'gitlab.com/alex_dev', status: 'Claimed', ok: true },
              { site: 'keybase.io/alex_dev', status: 'PGP Fingerprint Matched', ok: true },
              { site: 'dockerhub.com/alex_dev', status: 'Unclaimed', ok: false },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-[#929BAD]">{p.site}</span>
                <span className={p.ok ? 'text-[#A3FF6F]' : 'text-white/30'}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'domain-security',
      badge: 'Infrastructure Audit',
      title: 'Domain Security Audit',
      description:
        'Comprehensive domain hygiene validation checking DNS configuration, mail server authentication (SPF, DKIM, DMARC), and TLS certificates for weak links.',
      bullets: [
        'Automated DMARC policy enforcement checking (reject, quarantine, none)',
        'Certificate expiration warning and weak cipher suite identification',
        'Subdomain discovery identifying dangling DNS records vulnerable to takeover',
        'Open port and exposed MX/SPF misconfiguration diagnostics',
      ],
      icon: Globe,
      accentColor: '#8B7CFF',
      mockup: (
        <div className="glass p-5 rounded-2xl border border-white/[0.09] bg-[#0D1220]/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[#F5F7FA] font-sans font-semibold">dns_audit: acme-corp.io</span>
            <span className="text-[#A3FF6F] text-[10px] font-bold px-2 py-0.5 rounded bg-[#A3FF6F]/15">
              Grade A-
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between"><span className="text-[#929BAD]">DMARC Policy:</span><span className="text-[#A3FF6F]">p=reject (Enforced)</span></div>
            <div className="flex justify-between"><span className="text-[#929BAD]">SPF Record:</span><span className="text-[#A3FF6F]">Valid (v=spf1 include...)</span></div>
            <div className="flex justify-between"><span className="text-[#929BAD]">DKIM Alignment:</span><span className="text-[#A3FF6F]">Pass (2048-bit RSA)</span></div>
            <div className="flex justify-between"><span className="text-[#929BAD]">TLS Expiry:</span><span className="text-[#FFE066]">21 Days Remaining</span></div>
          </div>
        </div>
      ),
    },
    {
      id: 'phishing-detection',
      badge: 'Attack Surface',
      title: 'Phishing Detection',
      description:
        'Spot lookalike domains, Unicode homoglyphs, and malicious landing pages targeting your brand and customers before fraudulent campaigns strike.',
      bullets: [
        'Typosquatting and punycode algorithmic generator testing millions of variations',
        'Live WHOIS anomaly detection on newly registered suspicious root domains',
        'Automated screenshot captures and DOM fingerprinting of spoofed login forms',
        'Direct takedown export templates for registrars and hosting providers',
      ],
      icon: AlertTriangle,
      accentColor: '#FFB547',
      mockup: (
        <div className="glass p-5 rounded-2xl border border-white/[0.09] bg-[#0D1220]/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[#F5F7FA] font-sans font-semibold">homoglyph_detection</span>
            <span className="text-[#FF5A5A] text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF5A5A]/15">
              Spoof Detected
            </span>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-[#FF5A5A]/30 text-[11px] space-y-1">
            <div className="text-[#FF5A5A] font-bold">⚠️ Malicious Domain Registered:</div>
            <div className="text-[#F5F7FA]">lеаklеns.app (Cyrillic &apos;e&apos; &amp; &apos;a&apos;)</div>
            <div className="text-[#929BAD] text-[10px]">Registrar: Abuse-Friendly Host Ltd</div>
          </div>
          <div className="text-[11px] text-[#A3FF6F] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Takedown packet generated &amp; ready to dispatch</span>
          </div>
        </div>
      ),
    },
    {
      id: 'threat-intelligence',
      badge: 'Global Feeds',
      title: 'Threat Intelligence Integration',
      description:
        'Unified telemetry aggregating open-source honeypots, commercial abuse feeds, and vulnerability exchanges into prioritized, actionable indicators of compromise.',
      bullets: [
        'Multi-provider deduplication reducing noise by over 78%',
        'IOC tagging with MITRE ATT&CK taxonomy alignments',
        'REST API endpoints for real-time SIEM/SOAR pipeline feeding',
        'Low false-positive rate powered by automated consensus verification',
      ],
      icon: Shield,
      accentColor: '#A3FF6F',
      mockup: (
        <div className="glass p-5 rounded-2xl border border-white/[0.09] bg-[#0D1220]/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[#F5F7FA] font-sans font-semibold">feed_sync: active</span>
            <span className="text-[#A3FF6F] text-[10px] font-bold px-2 py-0.5 rounded bg-[#A3FF6F]/15">
              Synced 1m ago
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[#929BAD]">Total IOCs</div>
              <div className="text-base font-bold text-[#F5F7FA]">1,482,901</div>
            </div>
            <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[#929BAD]">New Today</div>
              <div className="text-base font-bold text-[#45D6FF]">+14,290</div>
            </div>
          </div>
          <div className="text-[10px] text-[#929BAD]">
            Sources: CISA, AlienVault OTX, AbuseIPDB, LeakLens Global Sensor Network
          </div>
        </div>
      ),
    },
    {
      id: 'risk-engine',
      badge: 'Explainable AI',
      title: 'Risk Assessment Engine',
      description:
        'Say goodbye to mysterious black-box scores. LeakLens breaks down aggregate risk scores with transparent attribution factors, mathematical weights, and remediation priorities.',
      bullets: [
        'Transparent 0-100 normalized score calculation model',
        'Attribution breakdown: credential age, severity of leaked fields, frequency',
        'Customizable enterprise weighting based on your organization’s risk profile',
        'Deterministic calculation ensuring repeatable and auditable results',
      ],
      icon: BarChart3,
      accentColor: '#45D6FF',
      mockup: (
        <div className="glass p-5 rounded-2xl border border-white/[0.09] bg-[#0D1220]/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[#F5F7FA] font-sans font-semibold">risk_score_matrix</span>
            <span className="text-[#FFB547] text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFB547]/15">
              Score: 68.4 / 100
            </span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div>
              <div className="flex justify-between text-[#929BAD] mb-1">
                <span>Plaintext Passwords Found (weight 0.40)</span>
                <span className="text-[#FF5A5A]">85.0</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-[85%] h-full bg-[#FF5A5A]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#929BAD] mb-1">
                <span>Domain SPF/DMARC Hygiene (weight 0.35)</span>
                <span className="text-[#A3FF6F]">12.0</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-[12%] h-full bg-[#A3FF6F]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#929BAD] mb-1">
                <span>Social Handle Collision (weight 0.25)</span>
                <span className="text-[#FFE066]">45.0</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-[45%] h-full bg-[#FFE066]" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Features — LeakLens Security Intelligence Platform</title>
        <meta
          name="description"
          content="Explore the deep technical capabilities of LeakLens: credential scanning, domain security audits, username OSINT, phishing defense, and explainable risk analysis."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="success">Platform Architecture</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            Engineered for <span className="gradient-green">Total Visibility</span>
          </h1>
          <p className="text-lg text-[#929BAD] leading-relaxed">
            From single-user credentials to expansive corporate digital footprints, explore how
            LeakLens discovers, correlates, and mitigates exposure.
          </p>
        </section>

        {/* Alternating Feature Rows */}
        <section className="space-y-16">
          {featureList.map((item, idx) => {
            const isEven = idx % 2 === 0;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                id={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className="glass p-8 sm:p-12 rounded-3xl border border-white/[0.08] relative overflow-hidden"
              >
                <div
                  className={cn(
                    'grid grid-cols-1 lg:grid-cols-12 gap-10 items-center',
                    isEven ? '' : 'lg:flex-row-reverse'
                  )}
                >
                  {/* Text Column */}
                  <div
                    className={cn(
                      'lg:col-span-7 space-y-6',
                      isEven ? 'order-1' : 'order-1 lg:order-2'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${item.accentColor}15`,
                          border: `1px solid ${item.accentColor}35`,
                          color: item.accentColor,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="default">{item.badge}</Badge>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F7FA]">
                      {item.title}
                    </h2>

                    <p className="text-base text-[#929BAD] leading-relaxed">
                      {item.description}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {item.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-sm text-[#F5F7FA]">
                          <CheckCircle2
                            className="w-4 h-4 shrink-0 mt-0.5"
                            style={{ color: item.accentColor }}
                          />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        to="/auth/signup"
                        className="btn-primary text-sm inline-flex items-center gap-2"
                      >
                        <span>Try {item.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Mockup Column */}
                  <div
                    className={cn(
                      'lg:col-span-5',
                      isEven ? 'order-2' : 'order-2 lg:order-1'
                    )}
                  >
                    <div className="relative group">
                      <div
                        className="absolute -inset-1 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"
                        style={{ backgroundColor: item.accentColor }}
                      />
                      <div className="relative">{item.mockup}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 space-y-6">
          <h2 className="text-3xl font-bold text-[#F5F7FA]">
            Ready to integrate full-spectrum intelligence?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth/signup" className="btn-primary text-base px-8 py-3.5">
              Start Free Assessment
            </Link>
            <Link to="/pricing" className="btn-secondary text-base px-8 py-3.5">
              View Plans &amp; Pricing
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default FeaturesPage;
