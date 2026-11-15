import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Code2,
  Search,
  Plug,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export const DocumentationPage: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const docCards = [
    {
      title: 'Getting Started',
      description: 'Quick start guide to understanding your digital footprint, running your first assessment, and reading risk metrics.',
      href: '#quickstart',
      icon: BookOpen,
      color: '#A3FF6F',
    },
    {
      title: 'API Reference',
      description: 'Comprehensive REST documentation, query parameter specifications, authorization headers, and status code references.',
      href: '#api-docs',
      icon: Code2,
      color: '#45D6FF',
    },
    {
      title: 'Scanner Engine Guide',
      description: 'Technical breakdown of Email, Username, Domain DNS hygiene, and Phishing homoglyph algorithms.',
      href: '/features',
      icon: Search,
      color: '#8B7CFF',
    },
    {
      title: 'Integration Guide',
      description: 'Connect LeakLens with Slack, SIEM platforms, Okta, and automated webhook pipelines for continuous monitoring.',
      href: '#integrations',
      icon: Plug,
      color: '#FFB547',
    },
    {
      title: 'Security Best Practices',
      description: 'Recommended credential policies, zero-trust password management, DMARC enforcement, and identity hygiene.',
      href: '/security',
      icon: ShieldCheck,
      color: '#A3FF6F',
    },
    {
      title: 'Frequently Asked Questions',
      description: 'Detailed technical answers regarding k-Anonymity hashing, rate limiting, and subscription entitlements.',
      href: '/faq',
      icon: HelpCircle,
      color: '#45D6FF',
    },
  ];

  const curlCode = `curl -X POST https://api.leaklens.io/v1/scan/email \\
  -H "Authorization: Bearer ll_live_948f29c488e1" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "security-lead@enterprise.com",
    "include_historical": true
  }'`;

  const copyCode = () => {
    navigator.clipboard.writeText(curlCode);
    setCopied(true);
    toast.success('Code snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Documentation &amp; API Reference — LeakLens</title>
        <meta
          name="description"
          content="Explore the LeakLens technical documentation, REST API guides, scanner specifications, and webhook integration tutorials."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="info">Developer &amp; Security Docs</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            Documentation <span className="gradient-green">Hub</span>
          </h1>
          <p className="text-lg text-[#929BAD] leading-relaxed">
            Everything you need to integrate, query, and automate digital footprint intelligence with
            LeakLens.
          </p>
        </section>

        {/* 6 Doc Hub Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Link
                  to={card.href}
                  className="glass glass-hover p-6 rounded-2xl border border-white/[0.08] flex flex-col justify-between h-full group"
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${card.color}15`,
                        border: `1px solid ${card.color}35`,
                        color: card.color,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#F5F7FA] mb-2 group-hover:text-[#A3FF6F] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#929BAD] leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/[0.05] flex items-center text-xs font-semibold text-[#A3FF6F]">
                    <span>Read documentation</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </section>

        {/* Quick Start & API Interactive Code Section */}
        <section id="api-docs" className="glass p-8 sm:p-12 rounded-3xl border border-white/[0.08] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-[#A3FF6F]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3FF6F]">
                  RESTful Intelligence API
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
                Execute a Zero-Log Email Assessment
              </h2>
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="btn-secondary text-xs self-start md:self-auto inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#A3FF6F]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Code Block */}
            <div className="lg:col-span-7 rounded-2xl bg-black/60 border border-white/[0.08] p-5 font-mono text-xs text-[#F5F7FA] overflow-x-auto">
              <pre className="text-[#A3FF6F] leading-relaxed">{curlCode}</pre>
            </div>

            {/* Explanation & Response Preview */}
            <div className="lg:col-span-5 space-y-4 text-xs text-[#929BAD] leading-relaxed">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="text-[#F5F7FA] font-semibold">Response Payload (200 OK)</div>
                <pre className="font-mono text-[11px] text-[#45D6FF] overflow-x-auto">
{`{
  "status": "success",
  "risk_score": 72.4,
  "risk_level": "high",
  "exposures_count": 3,
  "data_classes": [
    "passwords",
    "ip_addresses"
  ],
  "k_anonymity_verified": true
}`}
                </pre>
              </div>
              <p>
                All endpoints require standard Bearer authentication. Tokens can be generated in the{' '}
                <Link to="/app/api-keys" className="text-[#A3FF6F] underline">
                  Management &gt; API Access
                </Link>{' '}
                portal.
              </p>
            </div>
          </div>
        </section>

        {/* Integration Callout */}
        <section id="integrations" className="glass p-8 sm:p-10 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#F5F7FA]">Looking for SDKs &amp; Webhook Blueprints?</h3>
            <p className="text-sm text-[#929BAD] max-w-xl">
              We provide official libraries in Python, Node.js, and Go, plus ready-to-deploy Slack
              alert and Splunk/Elasticsearch ingestion templates.
            </p>
          </div>
          <Link to="/contact?subject=Developer+SDKs" className="btn-primary text-sm shrink-0">
            <span>Request SDK Access</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default DocumentationPage;
