import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Shield,
  Zap,
  ChevronDown,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: 'Free',
      description: 'Essential personal exposure detection and basic risk scoring.',
      monthlyPrice: 0,
      annualPrice: 0,
      priceLabel: '$0',
      periodLabel: 'forever',
      features: [
        '5 scans / month',
        'Basic email scanner',
        'Composite risk scoring',
        'Community support',
        'Web dashboard access',
      ],
      notIncluded: [
        'API & webhook access',
        'Username & domain scanner',
        'Automated recurring surveillance',
        'Executive PDF reports',
        'Multi-user seats',
      ],
      ctaText: 'Get Started Free',
      ctaHref: '/auth/signup',
      variant: 'default',
      accentColor: '#A3FF6F',
    },
    {
      name: 'Pro',
      popular: true,
      description: 'For proactive individuals, researchers, and security professionals.',
      monthlyPrice: 29,
      annualPrice: 279,
      periodLabel: billingCycle === 'annual' ? '/ year' : '/ month',
      features: [
        '100 scans / month',
        'All scanners (Email, Username, Domain, Phishing)',
        'Full REST API access (5,000 req/mo)',
        'Priority email & ticket support',
        'Exportable PDF reports',
        'Real-time automated breach alerts',
        'Darkweb monitor for 3 identifiers',
      ],
      notIncluded: [
        'Multi-user team management',
        'Custom SSO / SAML authentication',
        'Dedicated account manager',
      ],
      ctaText: 'Start Pro Trial',
      ctaHref: '/auth/signup?plan=pro',
      variant: 'pro',
      accentColor: '#45D6FF',
    },
    {
      name: 'Business',
      description: 'Comprehensive attack surface defense for teams and IT departments.',
      monthlyPrice: 99,
      annualPrice: 949,
      periodLabel: billingCycle === 'annual' ? '/ year' : '/ month',
      features: [
        'Unlimited scans / month',
        'Team management (5 seats included)',
        'All intelligence scanners & feeds',
        'High-capacity API (100,000 req/mo)',
        'Custom Slack & SIEM integrations',
        'Dedicated support engineer & SLA',
        'Admin audit logs & exportable compliance packets',
        'Continuous attack surface monitoring (25 domains)',
      ],
      notIncluded: [
        'Air-gapped on-premise deployment',
      ],
      ctaText: 'Start Business Trial',
      ctaHref: '/auth/signup?plan=business',
      variant: 'business',
      accentColor: '#8B7CFF',
    },
    {
      name: 'Enterprise',
      description: 'Custom configurations, unlimited volume, and dedicated security infrastructure.',
      monthlyPrice: null,
      annualPrice: null,
      priceLabel: 'Custom',
      periodLabel: 'tailored to requirements',
      features: [
        'Unlimited team members & sub-organizations',
        'Custom API limits & Dedicated endpoints',
        'Private cloud or self-hosted deployment options',
        'Custom threat feed integrations & custom weights',
        '99.99% Uptime SLA with financial backing',
        'SOC 2 & ISO compliance documentation assistance',
        'Dedicated Technical Account Manager & 24/7 Phone Support',
      ],
      notIncluded: [],
      ctaText: 'Contact Enterprise Sales',
      ctaHref: '/contact?subject=Enterprise+Inquiry',
      variant: 'enterprise',
      accentColor: '#A3FF6F',
    },
  ];

  const comparisonRows = [
    { feature: 'Monthly Scans', free: '5', pro: '100', biz: 'Unlimited', ent: 'Custom / Unlimited' },
    { feature: 'Email Breach Scanner', free: true, pro: true, biz: true, ent: true },
    { feature: 'Username Footprint Scanner', free: false, pro: true, biz: true, ent: true },
    { feature: 'Domain & DNS Security Audit', free: false, pro: true, biz: true, ent: true },
    { feature: 'Phishing & Homoglyph Detection', free: false, pro: true, biz: true, ent: true },
    { feature: 'REST API & Webhooks', free: false, pro: '5k req/mo', biz: '100k req/mo', ent: 'Custom' },
    { feature: 'Automated 24/7 Monitoring', free: false, pro: '3 items', biz: '25 items', ent: 'Unlimited' },
    { feature: 'Executive PDF Reports', free: false, pro: true, biz: true, ent: true },
    { feature: 'Team Seats', free: '1', pro: '1', biz: '5 included', ent: 'Unlimited' },
    { feature: 'Custom SIEM / Webhook Integrations', free: false, pro: false, biz: true, ent: true },
    { feature: 'SAML / Okta SSO', free: false, pro: false, biz: 'Add-on', ent: true },
    { feature: 'Dedicated Account Manager', free: false, pro: false, biz: true, ent: true },
    { feature: 'Support SLA', free: 'Community', pro: 'Standard (24h)', biz: 'Priority (4h)', ent: '1 Hour (24/7)' },
  ];

  const faqs = [
    {
      q: 'Can I cancel or change my plan anytime?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any moment directly from your account settings. If you downgrade, your existing plan privileges remain active until the end of your billing cycle.',
    },
    {
      q: 'How does the 20% annual discount work?',
      a: 'When you choose annual billing, you are billed once for the entire year at a 20% discount compared to 12 individual monthly payments.',
    },
    {
      q: 'Do you offer a free trial of paid plans?',
      a: 'Yes! Both Pro and Business plans include a 14-day fully-featured trial with no credit card required to begin testing our advanced engines.',
    },
    {
      q: 'Is our search data private and compliant with zero-log policies?',
      a: 'Absolutely. LeakLens uses zero-knowledge queries and k-Anonymity hashing. We never store or log plaintext search terms in persistent storage or resell query logs.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers/ACH for annual enterprise contracts.',
    },
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Pricing Plans — LeakLens Security Intelligence</title>
        <meta
          name="description"
          content="Choose the right LeakLens plan for your digital footprint surveillance. Flexible pricing for individuals, security researchers, and enterprise teams."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="warning">Fair &amp; Transparent</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            Plans for <span className="gradient-green">Every Threat Level</span>
          </h1>
          <p className="text-lg text-[#929BAD] leading-relaxed">
            Zero setup fees. Zero long-term lock-in. Pick the tier that matches your exposure
            profile or enterprise footprint.
          </p>

          {/* Billing Toggle */}
          <div className="pt-6 flex items-center justify-center gap-4">
            <span
              className={cn(
                'text-sm font-medium cursor-pointer transition-colors',
                billingCycle === 'monthly' ? 'text-[#F5F7FA]' : 'text-[#929BAD]'
              )}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-8 rounded-full bg-white/10 p-1 transition-colors border border-white/10 focus:outline-none"
              aria-label="Toggle annual or monthly billing"
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full bg-[#A3FF6F] shadow-md transition-transform duration-200',
                  billingCycle === 'annual' && 'translate-x-6'
                )}
              />
            </button>

            <span
              className={cn(
                'text-sm font-medium cursor-pointer transition-colors flex items-center gap-1.5',
                billingCycle === 'annual' ? 'text-[#F5F7FA]' : 'text-[#929BAD]'
              )}
              onClick={() => setBillingCycle('annual')}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3FF6F]/20 text-[#A3FF6F] border border-[#A3FF6F]/40">
                SAVE 20%
              </span>
            </span>
          </div>
        </section>

        {/* 4 Plan Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, idx) => {
            const price =
              plan.monthlyPrice === null
                ? plan.priceLabel
                : billingCycle === 'annual'
                ? `$${plan.annualPrice}`
                : `$${plan.monthlyPrice}`;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={cn(
                  'glass p-6 sm:p-7 rounded-3xl border flex flex-col justify-between relative transition-all duration-300',
                  plan.popular
                    ? 'border-2 border-[#45D6FF] bg-[#0D1220]/95 shadow-[0_0_45px_rgba(69,214,255,0.18)] scale-[1.02]'
                    : 'border-white/[0.08] hover:border-white/[0.2]'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#45D6FF] text-[#080B12] text-[11px] font-bold uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#F5F7FA]">{plan.name}</h3>
                    {plan.name === 'Enterprise' && (
                      <Shield className="w-5 h-5 text-[#A3FF6F]" />
                    )}
                  </div>

                  <p className="text-xs text-[#929BAD] min-h-[36px] mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-[#F5F7FA] font-mono">
                        {price}
                      </span>
                      <span className="text-xs text-[#929BAD]">{plan.periodLabel}</span>
                    </div>
                    {billingCycle === 'annual' && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                      <div className="text-[11px] text-[#A3FF6F] mt-1">
                        Billed annually (equals ~${Math.round(plan.annualPrice! / 12)}/mo)
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/[0.06] mb-6" />

                  {/* Features included */}
                  <div className="space-y-2.5 mb-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#929BAD]/70">
                      What&apos;s Included
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-[#F5F7FA]">
                        <Check className="w-3.5 h-3.5 text-[#A3FF6F] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((notFeat, nIdx) => (
                      <div key={nIdx} className="flex items-start gap-2 text-xs text-[#929BAD]/50">
                        <X className="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" />
                        <span className="line-through">{notFeat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.06]">
                  <Link
                    to={plan.ctaHref}
                    className={cn(
                      'w-full text-center block py-2.5 rounded-xl text-sm font-semibold transition-all',
                      plan.popular
                        ? 'btn-primary shadow-[0_0_25px_rgba(163,255,111,0.4)]'
                        : 'btn-secondary'
                    )}
                  >
                    {plan.ctaText}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Feature Comparison Table */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F7FA]">
              Detailed Feature Comparison
            </h2>
            <p className="text-sm text-[#929BAD]">
              Compare capabilities line-by-line to select the optimal defense tier.
            </p>
          </div>

          <div className="glass rounded-3xl border border-white/[0.08] overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-4 px-6 text-[#F5F7FA] font-semibold w-2/5">Capabilities</th>
                  <th className="py-4 px-4 text-center text-[#929BAD] font-medium">Free</th>
                  <th className="py-4 px-4 text-center text-[#45D6FF] font-semibold bg-[#45D6FF]/5">
                    Pro
                  </th>
                  <th className="py-4 px-4 text-center text-[#8B7CFF] font-semibold">Business</th>
                  <th className="py-4 px-4 text-center text-[#A3FF6F] font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {comparisonRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-medium text-[#F5F7FA]">{row.feature}</td>

                    {/* Free */}
                    <td className="py-3.5 px-4 text-center text-[#929BAD]">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-4 h-4 text-[#A3FF6F] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-white/20 mx-auto" />
                        )
                      ) : (
                        row.free
                      )}
                    </td>

                    {/* Pro */}
                    <td className="py-3.5 px-4 text-center text-[#F5F7FA] bg-[#45D6FF]/5 font-medium">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="w-4 h-4 text-[#45D6FF] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-white/20 mx-auto" />
                        )
                      ) : (
                        row.pro
                      )}
                    </td>

                    {/* Business */}
                    <td className="py-3.5 px-4 text-center text-[#F5F7FA]">
                      {typeof row.biz === 'boolean' ? (
                        row.biz ? (
                          <Check className="w-4 h-4 text-[#8B7CFF] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-white/20 mx-auto" />
                        )
                      ) : (
                        row.biz
                      )}
                    </td>

                    {/* Enterprise */}
                    <td className="py-3.5 px-4 text-center text-[#A3FF6F] font-medium">
                      {typeof row.ent === 'boolean' ? (
                        row.ent ? (
                          <Check className="w-4 h-4 text-[#A3FF6F] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-white/20 mx-auto" />
                        )
                      ) : (
                        row.ent
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing FAQ Section */}
        <section className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#929BAD]">
              Everything you need to know about billing, subscriptions, and security.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass rounded-2xl border border-white/[0.08] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-[#F5F7FA]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-[#929BAD] transition-transform duration-200 shrink-0',
                        isOpen && 'rotate-180 text-[#A3FF6F]'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-[#929BAD] leading-relaxed border-t border-white/[0.05] pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default PricingPage;
