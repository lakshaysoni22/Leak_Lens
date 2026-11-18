import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Mail,
  User,
  Globe as GlobeIcon,
  AlertTriangle,
  Shield,
  BarChart3,
  Activity,
  FileText,
  Bot,
  Search,
  CheckCircle,
  ArrowRight,
  Lock,
  Zap,
  Check,
  Server,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';
import AnimatedGradient from '@/components/effects/AnimatedGradient';
import Globe from '@/components/effects/Globe';
import AnimatedCounter from '@/components/charts/AnimatedCounter';
import Badge from '@/components/ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const features = [
  {
    icon: Mail,
    title: 'Email Exposure Scanner',
    description: 'Query verified breach dumps, compromised credentials, and exposure vectors across historical dumps.',
    color: '#A3FF6F',
  },
  {
    icon: User,
    title: 'Username Intelligence',
    description: 'Enumerate digital footprints across 300+ public registries, code repositories, and developer networks.',
    color: '#45D6FF',
  },
  {
    icon: GlobeIcon,
    title: 'Domain Security Audit',
    description: 'Automated inspection of SPF/DKIM/DMARC records, SSL lifecycle states, and sub-domain exposure vectors.',
    color: '#8B7CFF',
  },
  {
    icon: AlertTriangle,
    title: 'Phishing Detection',
    description: 'State-of-the-art homoglyph, punycode, and malicious URI heuristic modeling to defeat brand impersonation.',
    color: '#FFB547',
  },
  {
    icon: Shield,
    title: 'Threat Intelligence',
    description: 'Direct feeds from global Honeypots, abuse feeds, and threat syndicates unified into actionable scores.',
    color: '#A3FF6F',
  },
  {
    icon: BarChart3,
    title: 'Risk Assessment Engine',
    description: 'Explainable composite risk scoring that pinpoints severity with transparent attribution factors.',
    color: '#45D6FF',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Continuous background surveillance with instant webhooks and alert dispatching when new leaks surface.',
    color: '#8B7CFF',
  },
  {
    icon: FileText,
    title: 'Compliance Reports',
    description: 'One-click executive PDF exports mapped to SOC 2, ISO 27001, and NIST privacy control frameworks.',
    color: '#A3FF6F',
  },
  {
    icon: Bot,
    title: 'AI Security Assistant',
    description: 'Natural language threat query copilot to dissect exposure payloads and guide remediation workflows.',
    color: '#45D6FF',
  },
];

const howItWorksSteps = [
  {
    number: '01',
    icon: Mail,
    title: 'Enter Your Identifier',
    description: 'Input any email, username, domain, or suspect URL into our secure, zero-log lookup interface.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Automated Intelligence Scan',
    description: 'Our engines cross-reference billions of breach records, live DNS configurations, and threat feeds in milliseconds.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Risk Assessment & Analysis',
    description: 'Proprietary heuristic scoring calculates your aggregate exposure severity with transparent breakdown factors.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Actionable Recommendations',
    description: 'Receive guided remediation steps, automated credential reset instructions, and proactive monitoring setup.',
  },
];

export const HomePage: React.FC = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>LeakLens — Digital Footprint Intelligence & Attack Surface Management</title>
        <meta
          name="description"
          content="Understand your digital exposure, uncover potential security risks, and make smarter cybersecurity decisions with privacy-focused intelligence."
        />
      </Helmet>

      {/* Global Navigation */}
      <Navbar />

      <main className="relative overflow-x-hidden pt-20">
        {/* ========================================================
            1. HERO SECTION
            ======================================================== */}
        <section className="relative min-h-[92vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
          {/* Background Layers */}
          <ParticleBackground className="opacity-60" particleCount={65} />
          <AnimatedGradient className="opacity-90" />

          {/* Radial gradient glow behind hero */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#A3FF6F]/10 via-[#45D6FF]/10 to-[#8B7CFF]/10 blur-[130px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 text-center lg:text-left space-y-8 z-10"
            >
              <motion.div variants={itemVariants} className="inline-block">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#A3FF6F] animate-pulse" />
                  <span className="text-xs font-medium text-[#F5F7FA]">
                    Next-Gen Exposure & Threat Intelligence
                  </span>
                  <span className="text-[#A3FF6F] text-xs">→</span>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#F5F7FA] leading-[1.08]"
              >
                Your <span className="gradient-green">Digital Footprint</span>.
                <br />
                Your <span className="gradient-green">Security</span>. Your{' '}
                <span className="gradient-green">Control</span>.
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-[#929BAD] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Understand your digital exposure, uncover potential security risks, and make
                smarter cybersecurity decisions with privacy-focused intelligence.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  to="/auth/signup"
                  className="btn-primary w-full sm:w-auto text-base px-8 py-3.5 shadow-[0_0_35px_rgba(163,255,111,0.4)] group"
                >
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/features"
                  className="btn-secondary w-full sm:w-auto text-base px-8 py-3.5"
                >
                  <span>Explore Platform</span>
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center lg:justify-start gap-6 text-xs text-[#929BAD] pt-4"
              >
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#A3FF6F]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#A3FF6F]" />
                  <span>Zero logs stored</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#A3FF6F]" />
                  <span>Instant scan results</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual: 3D Globe + Floating Glass Badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="lg:col-span-5 relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-[440px] h-[440px] flex items-center justify-center">
                {/* Globe Canvas Component */}
                <Globe size={420} className="relative z-10" />

                {/* Floating Glass Card 1 - Top Left */}
                <div className="absolute -top-2 left-0 glass p-3.5 rounded-xl border border-white/[0.12] shadow-xl float z-20 flex items-center gap-3 bg-[#0D1220]/80 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-[#A3FF6F]/15 text-[#A3FF6F] flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F7FA]">256-bit Encryption</div>
                    <div className="text-[10px] text-[#A3FF6F]">Quantum-Resistant</div>
                  </div>
                </div>

                {/* Floating Glass Card 2 - Bottom Right */}
                <div className="absolute bottom-6 -right-4 glass p-3.5 rounded-xl border border-white/[0.12] shadow-xl float-delayed z-20 flex items-center gap-3 bg-[#0D1220]/80 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-[#45D6FF]/15 text-[#45D6FF] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F7FA]">Zero-Trust</div>
                    <div className="text-[10px] text-[#45D6FF]">Privacy-First Design</div>
                  </div>
                </div>

                {/* Floating Glass Card 3 - Bottom Left */}
                <div className="absolute bottom-2 left-6 glass p-3 rounded-xl border border-white/[0.12] shadow-xl float z-20 flex items-center gap-2.5 bg-[#0D1220]/80 backdrop-blur-md">
                  <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F7FA]">Real-time</div>
                    <div className="text-[10px] text-[#8B7CFF]">50ms Intelligence Query</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================
            2. TRUST BAR
            ======================================================== */}
        <section className="relative py-10 border-y border-white/[0.06] bg-[#0D1220]/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center justify-around gap-6 sm:gap-8"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#A3FF6F]" />
                <span className="text-sm font-semibold tracking-wide text-[#F5F7FA]">
                  Privacy-First
                </span>
              </div>
              <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-[#45D6FF]" />
                <span className="text-sm font-semibold tracking-wide text-[#F5F7FA]">
                  End-to-End Encrypted
                </span>
              </div>
              <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-[#8B7CFF]" />
                <span className="text-sm font-semibold tracking-wide text-[#F5F7FA]">
                  GDPR Ready
                </span>
              </div>
              <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-[#A3FF6F]" />
                <span className="text-sm font-semibold tracking-wide text-[#F5F7FA]">
                  SOC 2 Architecture
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================
            3. FEATURES GRID
            ======================================================== */}
        <section className="relative py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16 space-y-4"
            >
              <Badge variant="info">Defense in Depth</Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
                <span className="gradient-green">Comprehensive Security</span> Intelligence
              </h2>
              <p className="text-base sm:text-lg text-[#929BAD] leading-relaxed">
                Everything required to identify exposures, audit brand impersonation, and safeguard
                your identities across open and darkweb networks.
              </p>
            </motion.div>

            {/* 3x3 Feature Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    className="glass glass-hover p-6 rounded-2xl border border-white/[0.08] hover:border-[#A3FF6F]/40 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: `${feature.color}15`,
                          border: `1px solid ${feature.color}35`,
                          color: feature.color,
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#F5F7FA] mb-2 group-hover:text-[#A3FF6F] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#929BAD] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-4 border-t border-white/[0.05] flex items-center text-xs font-medium text-[#A3FF6F] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Learn more</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ========================================================
            4. HOW IT WORKS
            ======================================================== */}
        <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#0D1220]/50 border-y border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-20 space-y-4"
            >
              <Badge variant="success">Streamlined Process</Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
                How <span className="gradient-green">LeakLens</span> Works
              </h2>
              <p className="text-base sm:text-lg text-[#929BAD]">
                From raw search identifier to crystal-clear remediation in four autonomous steps.
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {/* Connecting line on desktop */}
              <div className="hidden lg:block absolute top-1/2 left-10 right-10 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#A3FF6F]/10 via-[#A3FF6F]/40 to-[#45D6FF]/30 -z-0" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {howItWorksSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.15 }}
                      className="glass p-6 rounded-2xl border border-white/[0.08] hover:border-[#A3FF6F]/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#A3FF6F]/15 text-[#A3FF6F] border border-[#A3FF6F]/30">
                            {step.number}
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#45D6FF]">
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-[#929BAD] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. STATS SECTION
            ======================================================== */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="stat-card text-center">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#A3FF6F] mb-2 font-mono">
                  <AnimatedCounter end={10} suffix="M+" />
                </div>
                <div className="text-sm font-semibold text-[#F5F7FA]">Scans Completed</div>
                <p className="text-xs text-[#929BAD] mt-1">Breach & credential checks</p>
              </div>

              <div className="stat-card text-center">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#45D6FF] mb-2 font-mono">
                  <AnimatedCounter end={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-sm font-semibold text-[#F5F7FA]">Engine Uptime</div>
                <p className="text-xs text-[#929BAD] mt-1">Enterprise-grade reliability</p>
              </div>

              <div className="stat-card text-center">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#8B7CFF] mb-2 font-mono">
                  <AnimatedCounter end={50} suffix="ms" />
                </div>
                <div className="text-sm font-semibold text-[#F5F7FA]">Average Latency</div>
                <p className="text-xs text-[#929BAD] mt-1">High-throughput lookups</p>
              </div>

              <div className="stat-card text-center">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#A3FF6F] mb-2 font-mono">
                  <AnimatedCounter end={256} suffix="-bit" />
                </div>
                <div className="text-sm font-semibold text-[#F5F7FA]">Cryptographic Guard</div>
                <p className="text-xs text-[#929BAD] mt-1">Zero-knowledge indexing</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================
            6. PRICING PREVIEW
            ======================================================== */}
        <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#0D1220]/40 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16 space-y-4"
            >
              <Badge variant="warning">Transparent Models</Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
                Simple, <span className="gradient-green">Transparent Pricing</span>
              </h2>
              <p className="text-base sm:text-lg text-[#929BAD]">
                Scale from individual privacy audits to continuous team-wide surveillance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass p-8 rounded-2xl border border-white/[0.08] flex flex-col justify-between"
              >
                <div>
                  <div className="text-lg font-semibold text-[#F5F7FA] mb-1">Free</div>
                  <p className="text-xs text-[#929BAD] mb-6">Essential personal exposure checks</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-[#F5F7FA] font-mono">$0</span>
                    <span className="text-sm text-[#929BAD]">/ month</span>
                  </div>

                  <ul className="space-y-3 text-sm text-[#929BAD]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#A3FF6F]" />
                      <span>5 scans / month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#A3FF6F]" />
                      <span>Basic risk scoring algorithm</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#A3FF6F]" />
                      <span>Email Exposure Scanner</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#A3FF6F]" />
                      <span>Community support</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8 mt-6 border-t border-white/[0.06]">
                  <Link
                    to="/auth/signup"
                    className="btn-secondary w-full justify-center text-sm py-2.5"
                  >
                    Get Started Free
                  </Link>
                </div>
              </motion.div>

              {/* Pro Plan (Popular) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass p-8 rounded-2xl border-2 border-[#45D6FF]/60 relative flex flex-col justify-between shadow-[0_0_50px_rgba(69,214,255,0.15)] bg-[#0D1220]/90"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#45D6FF] text-[#080B12] text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>

                <div>
                  <div className="text-lg font-semibold text-[#F5F7FA] mb-1">Pro</div>
                  <p className="text-xs text-[#929BAD] mb-6">For power users and security analysts</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-[#F5F7FA] font-mono">$29</span>
                    <span className="text-sm text-[#929BAD]">/ month</span>
                  </div>

                  <ul className="space-y-3 text-sm text-[#F5F7FA]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#45D6FF]" />
                      <span>100 scans / month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#45D6FF]" />
                      <span>All scanners (Email, Username, Domain, Phishing)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#45D6FF]" />
                      <span>REST API Access & Webhooks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#45D6FF]" />
                      <span>Priority Support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#45D6FF]" />
                      <span>Automated Alert Monitoring</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8 mt-6 border-t border-white/[0.06]">
                  <Link
                    to="/auth/signup?plan=pro"
                    className="btn-primary w-full justify-center text-sm py-2.5 shadow-[0_0_30px_rgba(163,255,111,0.4)]"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </motion.div>

              {/* Business Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass p-8 rounded-2xl border border-white/[0.08] flex flex-col justify-between"
              >
                <div>
                  <div className="text-lg font-semibold text-[#F5F7FA] mb-1">Business</div>
                  <p className="text-xs text-[#929BAD] mb-6">For growing teams and IT departments</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-[#F5F7FA] font-mono">$99</span>
                    <span className="text-sm text-[#929BAD]">/ month</span>
                  </div>

                  <ul className="space-y-3 text-sm text-[#929BAD]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B7CFF]" />
                      <span>Unlimited monthly scans</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B7CFF]" />
                      <span>Team workspace & RBAC</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B7CFF]" />
                      <span>Custom SIEM & Slack integrations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B7CFF]" />
                      <span>Dedicated Account Manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B7CFF]" />
                      <span>Executive Compliance Exports</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8 mt-6 border-t border-white/[0.06]">
                  <Link
                    to="/auth/signup?plan=business"
                    className="btn-secondary w-full justify-center text-sm py-2.5 hover:border-[#8B7CFF]/50 hover:text-[#8B7CFF]"
                  >
                    Start Business Trial
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="text-center mt-12 text-sm text-[#929BAD]">
              Need custom enterprise features or self-hosted deployment?{' '}
              <Link to="/contact" className="text-[#A3FF6F] font-semibold hover:underline">
                Contact Enterprise Sales →
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            7. CTA SECTION
            ======================================================== */}
        <section className="relative py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl p-10 sm:p-16 border border-white/[0.12] bg-gradient-to-b from-[#111827]/90 to-[#0D1220]/90 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden text-center space-y-6"
            >
              {/* Glow accents */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#A3FF6F]/20 blur-[80px] pointer-events-none" />

              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight relative z-10">
                Ready to Secure Your <span className="gradient-green">Digital Presence</span>?
              </h2>

              <p className="text-base sm:text-lg text-[#929BAD] max-w-2xl mx-auto relative z-10 leading-relaxed">
                Start your free assessment today. No credit card required. Uncover exposures before
                threat actors exploit them.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link
                  to="/auth/signup"
                  className="btn-primary text-base px-10 py-4 shadow-[0_0_40px_rgba(163,255,111,0.5)] group"
                >
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="btn-ghost text-sm text-[#929BAD] hover:text-[#F5F7FA]">
                  Talk to a Security Expert
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </PageTransition>
  );
};

export default HomePage;
