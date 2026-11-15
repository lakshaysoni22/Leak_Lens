import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  Search,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is LeakLens and how does it work?',
    answer:
      'LeakLens is an advanced exposure assessment and attack surface management platform. It allows users and organizations to evaluate their digital footprint by scanning verified historical breach dumps, code registries, open DNS records, and threat feeds for compromised credentials, leaked PII, or attack vectors.',
  },
  {
    category: 'General',
    question: 'Who should use LeakLens?',
    answer:
      'LeakLens is built for individuals concerned about personal account security, cybersecurity professionals, penetration testers, IT administrators, and enterprise security operations centers (SOCs) monitoring their organization’s attack surface.',
  },
  {
    category: 'Privacy & Security',
    question: 'Do you store or log my search queries?',
    answer:
      'No. LeakLens enforces a strict zero-log policy for search lookups. Queries are processed entirely in ephemeral volatile RAM using k-Anonymity hashing and are immediately dropped once results are generated. We do not store plaintext emails, usernames, or domains in persistent database logs.',
  },
  {
    category: 'Privacy & Security',
    question: 'What is k-Anonymity and why is it important?',
    answer:
      'k-Anonymity is a mathematical privacy standard. When you search an identifier, your client generates a cryptographic hash and sends only the first few characters (the prefix). Our backend responds with all matching hash prefixes, allowing your browser to compare the full hash locally. This guarantees that LeakLens servers never learn the full identity of what you searched.',
  },
  {
    category: 'Scanners',
    question: 'How does the Email Exposure Scanner work?',
    answer:
      'Our email scanner cross-references submitted addresses against billions of records collected from verified breach archives, combo lists, and paste sites. It identifies compromised passwords, affected services, leak dates, and provides prioritized remediation steps.',
  },
  {
    category: 'Scanners',
    question: 'How does the Username Intelligence module find profiles?',
    answer:
      'Our engine performs asynchronous HTTP probes and API lookups across 300+ major developer networks, social media platforms, gaming portals, and public code registries to map public handle reuse and expose orphaned accounts.',
  },
  {
    category: 'Scanners',
    question: 'What domain security checks are performed?',
    answer:
      'The Domain Scanner evaluates mail server authentication records (SPF, DKIM, DMARC), TLS/SSL certificate lifecycle and cipher strength, subdomain discovery, dangling DNS records, and open service ports that could expose internal infrastructure.',
  },
  {
    category: 'Scanners',
    question: 'How does the Phishing & Homoglyph detection engine work?',
    answer:
      'We algorithmically calculate visual permutations, Unicode homoglyphs, and typosquatted variations of your domain (e.g. replacing Latin characters with Cyrillic lookalikes). We check newly registered domains and WHOIS feeds in real time to catch imposter sites before phishing campaigns launch.',
  },
  {
    category: 'Risk Scoring',
    question: 'How is the Composite Risk Score calculated?',
    answer:
      'Our risk scoring engine uses an explainable mathematical formula rather than an opaque black box. Scores range from 0 to 100 and take into account factor severity, credential age, presence of plaintext passwords versus hashed passwords, sensitive PII classes, and domain DNS hygiene.',
  },
  {
    category: 'API & Integrations',
    question: 'Is there a REST API available for automated scanning?',
    answer:
      'Yes! Pro, Business, and Enterprise plans include access to our high-throughput REST API with webhook event dispatching. You can integrate LeakLens directly into your CI/CD pipelines, SIEM/SOAR platforms, or automated employee onboarding workflows.',
  },
  {
    category: 'Billing',
    question: 'Can I upgrade, downgrade, or cancel anytime?',
    answer:
      'Yes, you can manage your plan directly in your account subscription dashboard. If you cancel, you will maintain access to your plan until the end of your prepaid billing period.',
  },
  {
    category: 'Billing',
    question: 'Do you offer custom plans for enterprise teams?',
    answer:
      'Yes. Our Enterprise tier offers custom query limits, dedicated cloud hosting, single sign-on (SAML/Okta), custom threat feed ingestion, and 24/7 dedicated support SLAs. Contact our sales team to discuss tailor-made agreements.',
  },
];

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'General', 'Privacy & Security', 'Scanners', 'Risk Scoring', 'API & Integrations', 'Billing'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <PageTransition>
      <Helmet>
        <title>Frequently Asked Questions — LeakLens</title>
        <meta
          name="description"
          content="Find answers to common questions about LeakLens scanning capabilities, zero-log data privacy, API integrations, and pricing plans."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="info">Knowledge Base</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            Frequently Asked <span className="gradient-green">Questions</span>
          </h1>
          <p className="text-base sm:text-lg text-[#929BAD] leading-relaxed">
            Have questions about how LeakLens operates, our privacy architecture, or subscription
            tiers? We have you covered.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-[#929BAD] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or keywords..."
              className="input-field pl-11 text-sm rounded-2xl"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer',
                selectedCategory === cat
                  ? 'bg-[#A3FF6F]/15 text-[#A3FF6F] border-[#A3FF6F]/40 shadow-[0_0_15px_rgba(163,255,111,0.2)]'
                  : 'bg-white/[0.04] text-[#929BAD] border-white/[0.08] hover:text-[#F5F7FA] hover:bg-white/[0.08]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="glass p-12 text-center rounded-2xl text-[#929BAD] space-y-2">
              <p>No questions matched your search query.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-[#A3FF6F] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3FF6F]/80">
                        {faq.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-[#F5F7FA]">
                        {faq.question}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180 bg-[#A3FF6F]/10 border-[#A3FF6F]/30 text-[#A3FF6F]'
                      )}
                    >
                      <ChevronDown className="w-4 h-4 text-[#929BAD]" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        <div className="px-5 sm:px-6 pb-6 text-sm text-[#929BAD] leading-relaxed border-t border-white/[0.06] pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <section className="glass p-8 sm:p-10 rounded-3xl border border-white/[0.08] text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
            Still have questions or need technical support?
          </h2>
          <p className="text-sm text-[#929BAD] max-w-lg mx-auto">
            Our engineering team is always available to discuss integrations, threat modeling, or
            account inquiries.
          </p>
          <div className="pt-2">
            <Link to="/contact" className="btn-primary text-sm inline-flex items-center gap-2">
              <span>Contact Support Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default FAQPage;
