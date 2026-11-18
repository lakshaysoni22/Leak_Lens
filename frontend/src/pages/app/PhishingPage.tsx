import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lock,
  Globe,
  ExternalLink,
  ChevronRight,
  Link as LinkIcon,
  FileWarning,
  Shield,
  Eye,
  Fingerprint,
  KeyRound,
  Server,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import type { PhishingResult, RiskLevel } from '@/types';
import { formatDate, formatScore } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import RiskBadge from '@/components/shared/RiskBadge';
import DataSourceBadge from '@/components/shared/DataSourceBadge';
import PageTransition from '@/components/shared/PageTransition';
import RiskGauge from '@/components/charts/RiskGauge';
import ScannerAnimation from '@/components/effects/ScannerAnimation';

/* ─── Clean URL result component (low/no risk) ─── */
const CleanUrlResult: React.FC<{ result: PhishingResult; onReset: () => void }> = ({
  result,
  onReset,
}) => {
  const securityTips = [
    {
      icon: <Eye className="w-4 h-4 text-[#A3FF6F]" />,
      title: 'Always Verify URLs Visually',
      text: 'Check for subtle character substitutions, extra subdomains, or misspelled brand names before clicking.',
    },
    {
      icon: <Lock className="w-4 h-4 text-[#45D6FF]" />,
      title: 'Look for HTTPS',
      text: 'Ensure the connection is encrypted (HTTPS) before submitting any credentials or personal information.',
    },
    {
      icon: <Shield className="w-4 h-4 text-[#8B7CFF]" />,
      title: 'Use Browser Protections',
      text: 'Keep browser-based phishing protection enabled — Chrome Safe Browsing, Firefox Phishing Protection, etc.',
    },
    {
      icon: <Fingerprint className="w-4 h-4 text-[#FFB547]" />,
      title: 'Enable 2FA Everywhere',
      text: 'Even if credentials are phished, 2FA prevents attackers from accessing your accounts.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hero Clean Card */}
      <Card variant="gradient" padding="lg" className="relative overflow-hidden">
        <div className="flex flex-col items-center text-center py-6 space-y-5">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
            className="relative"
          >
            <div className="w-28 h-28 rounded-full bg-[#A3FF6F]/10 border-2 border-[#A3FF6F]/40 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ShieldCheck className="w-14 h-14 text-[#A3FF6F]" />
              </motion.div>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#A3FF6F]/30"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          <RiskGauge score={result.risk_score} size={160} label="Phishing Likelihood" />

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#A3FF6F]">
              No Phishing Indicators Detected
            </h2>
            <p className="text-base text-[#F5F7FA] font-mono">
              {result.domain}
            </p>
            <p className="text-sm text-[#929BAD] max-w-lg mx-auto">
              This URL does not exhibit phishing signatures, typosquatting patterns,
              or malicious infrastructure indicators. The domain appears legitimate.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
              <span className="text-[#929BAD]">Risk Level: </span>
              <span className="font-bold text-[#A3FF6F]">Low</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
              <span className="text-[#929BAD]">Protocol: </span>
              <span className={`font-bold ${result.is_https ? 'text-[#A3FF6F]' : 'text-[#FFB547]'}`}>
                {result.is_https ? 'HTTPS (Encrypted)' : 'HTTP'}
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
              <span className="text-[#929BAD]">Analyzed: </span>
              <span className="text-white">{formatDate(result.analyzed_at)}</span>
            </div>
          </div>
        </div>

        {result.data_notice && (
          <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-[#929BAD] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#A3FF6F] shrink-0" />
            <span>{result.data_notice}</span>
          </div>
        )}
      </Card>

      {/* Security Tips */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white">Proactive Phishing Prevention</h3>
          <p className="text-xs text-[#929BAD] mt-0.5">
            Best practices to protect against phishing attacks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityTips.map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-5 rounded-xl border border-white/10 bg-[#111827]/80 backdrop-blur-md space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {tip.icon}
                </div>
                <span className="text-sm font-bold text-white">{tip.title}</span>
              </div>
              <p className="text-xs text-[#929BAD] leading-relaxed">{tip.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scan Another */}
      <div className="pt-4 flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Analyze Another URL
        </Button>
      </div>
    </motion.div>
  );
};

/* ─── Main page component ─── */
const PhishingPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [inputError, setInputError] = useState<string | undefined>();

  /* ── Analyze handler — NO synthetic fallback ── */
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(undefined);

    let cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setInputError('Please enter a full URL to analyze');
      return;
    }

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setInputError('Please enter a valid URL (e.g. https://suspicious-domain.com/login)');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await api.post<PhishingResult>('/phishing/analyze', { url: cleanUrl });
      setResult(response.data);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        'Phishing analysis service temporarily unavailable. Please try again.';
      toast.error(errorMsg);
      // NO fake/synthetic fallback — return to input state
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setUrlInput('');
    setInputError(undefined);
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Phishing Detection | LeakLens - Cyber Exposure &amp; Intelligence</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5A5A]/15 border border-[#FF5A5A]/30 flex items-center justify-center text-[#FF5A5A]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Phishing URL Analyzer
              </h1>
            </div>
            <p className="text-sm text-[#929BAD] mt-1.5">
              Inspect suspicious hyperlinks, typosquatting domains, and weaponized credential harvesting portals.
            </p>
          </div>

          {/* Dynamic DataSourceBadge */}
          <div className="flex items-center gap-2">
            <DataSourceBadge dataSource="live_intelligence" size="md" />
          </div>
        </div>

        {/* INPUT FORM STATE */}
        {!isAnalyzing && !result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card variant="default" padding="lg" className="border-white/10 relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6 text-center py-4">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Analyze Suspicious URL
                  </h2>
                  <p className="text-sm text-[#929BAD]">
                    Dissect domain reputation, deceptive homograph characters, and credential stealing techniques safely without triggering tracking beacons.
                  </p>
                </div>

                <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-1 w-full text-left">
                    <Input
                      type="text"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        if (inputError) setInputError(undefined);
                      }}
                      placeholder="e.g. https://login-verify-account.com/auth"
                      icon={<LinkIcon className="w-4 h-4" />}
                      error={inputError}
                      className="text-base py-3"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    leftIcon={<Search className="w-4 h-4" />}
                    className="w-full sm:w-auto shrink-0 mt-0.5"
                  >
                    Analyze URL
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-2 text-xs text-[#929BAD] pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#A3FF6F]" />
                  <span>
                    Zero client footprint: URLs are analyzed server-side via DNS, SSL, and heuristic probes — never loaded in your browser.
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Context Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileWarning className="w-4 h-4 text-[#FF5A5A]" />
                  <span>Homograph & Typosquat Detection</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Identifies Cyrillic/Greek character substitutions and brand imitation patterns designed to deceive users.
                </p>
              </Card>

              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Globe className="w-4 h-4 text-[#FFB547]" />
                  <span>Live Domain Intelligence</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Real DNS resolution, SSL certificate inspection, RDAP domain age verification, and HTTP redirect chain analysis.
                </p>
              </Card>

              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-[#A3FF6F]" />
                  <span>Incident Response IOCs</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Produces actionable threat indicators and remediation playbooks for immediate deployment to security controls.
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* LOADING ANIMATION STATE */}
        {isAnalyzing && (
          <div className="py-16 flex flex-col items-center justify-center space-y-6">
            <ScannerAnimation size={300} isScanning={true} />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Analyzing URL Telemetry</h3>
              <p className="text-xs text-[#929BAD]">
                Resolving DNS, inspecting SSL certificates, checking domain age via RDAP, tracing redirect chains, and running heuristic pattern matching...
              </p>
            </div>
          </div>
        )}

        {/* RESULTS STATE — Clean URL (low risk, no factors) */}
        {result && !isAnalyzing && result.risk_factors.length === 0 && (
          <CleanUrlResult result={result} onReset={resetAnalysis} />
        )}

        {/* RESULTS STATE — Findings detected */}
        {result && !isAnalyzing && result.risk_factors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Top Score Banner Card */}
            <Card variant="gradient" padding="lg" className="relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Risk Gauge */}
                <div className="flex flex-col items-center shrink-0">
                  <RiskGauge score={result.risk_score} size={220} label="Phishing Likelihood" />
                  <div className="mt-2 flex items-center gap-2">
                    <RiskBadge level={result.risk_level} size="md" showIcon />
                    <DataSourceBadge dataSource="live_intelligence" size="sm" />
                  </div>
                </div>

                <div className="space-y-4 flex-1 text-center lg:text-left">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#929BAD]">
                      Target Domain Analysis
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                      {result.domain}
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base text-[#F5F7FA] leading-relaxed max-w-2xl">
                    {result.risk_score >= 70
                      ? 'HIGH-CONFIDENCE THREAT: This URL exhibits severe characteristics consistent with malicious credential harvesting, spoofed authentication interfaces, or malware redirection.'
                      : result.risk_score >= 40
                      ? 'SUSPICIOUS REPUTATION: Multiple anomalous indicators detected in domain registration, URL structure, or SSL configuration. Exercise elevated caution.'
                      : 'MINOR ANOMALIES: Some low-severity indicators detected but no overt phishing signatures. URL may still be safe — verify before submitting sensitive data.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">Protocol: </span>
                      <span className="font-mono text-white uppercase">{result.scheme}</span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">HTTPS: </span>
                      <span className="font-semibold text-white">
                        {result.is_https ? 'Yes (Encrypted)' : 'No (Cleartext HTTP)'}
                      </span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">Analyzed: </span>
                      <span className="text-white">{formatDate(result.analyzed_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={resetAnalysis}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Analyze Another URL
                  </Button>
                </div>
              </div>

              {result.data_notice && (
                <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-[#929BAD] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#A3FF6F] shrink-0" />
                  <span>{result.data_notice}</span>
                </div>
              )}
            </Card>

            {/* DOMAIN & NETWORK PROPERTIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-white/10 bg-[#111827]/70 space-y-1.5">
                <div className="text-xs uppercase text-[#929BAD] font-semibold">Analyzed Domain</div>
                <div className="text-base font-mono font-bold text-white truncate">
                  {result.domain}
                </div>
              </Card>

              <Card className="p-5 border-white/10 bg-[#111827]/70 space-y-1.5">
                <div className="text-xs uppercase text-[#929BAD] font-semibold">Transmission Protocol</div>
                <div className="text-base font-semibold text-white flex items-center gap-2">
                  {result.is_https ? (
                    <>
                      <Lock className="w-4 h-4 text-[#A3FF6F]" />
                      <span>HTTPS (TLS Encrypted)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-[#FF5A5A]" />
                      <span className="text-[#FF5A5A]">Insecure HTTP</span>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-5 border-white/10 bg-[#111827]/70 space-y-1.5">
                <div className="text-xs uppercase text-[#929BAD] font-semibold">Risk Rating</div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <RiskBadge level={result.risk_level} size="sm" showIcon />
                  <span className="text-xs text-[#929BAD] font-normal">
                    ({formatScore(result.risk_score)}/100)
                  </span>
                </div>
              </Card>
            </div>

            {/* RISK FACTORS TABLE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Detected Phishing Indicators</h3>
                  <p className="text-xs text-[#929BAD] mt-0.5">
                    Live analysis results from DNS probes, SSL inspection, domain age, and heuristic pattern matching
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-semibold text-[#FF5A5A]">
                  {result.risk_factors.length} Red Flags
                </span>
              </div>

              <div className="space-y-3">
                {result.risk_factors.map((factor, idx) => {
                  const severityVariant =
                    factor.severity === 'critical'
                      ? 'risk-critical'
                      : factor.severity === 'high'
                      ? 'risk-high'
                      : factor.severity === 'medium'
                      ? 'risk-medium'
                      : factor.severity === 'low'
                      ? 'risk-low'
                      : 'info';

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="glass-card p-5 rounded-xl border border-white/10 bg-[#111827]/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Badge variant={severityVariant} size="sm">
                            {factor.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-bold text-white">{factor.category}</span>
                        </div>
                      </div>

                      <p className="text-sm text-[#F5F7FA] leading-relaxed">
                        {factor.finding}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* RECOMMENDATIONS LIST */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Incident Response Playbook</h3>
                <p className="text-xs text-[#929BAD] mt-0.5">
                  Recommended mitigation and IOC containment actions
                </p>
              </div>

              <div className="space-y-2.5">
                {result.recommendations.map((rec, rIdx) => (
                  <motion.div
                    key={rIdx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rIdx * 0.05 }}
                    className="p-4 rounded-xl border border-white/10 bg-[#111827]/80 flex items-center gap-3.5 text-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FF5A5A]/15 border border-[#FF5A5A]/30 flex items-center justify-center text-[#FF5A5A] shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-[#F5F7FA] font-medium leading-relaxed">{rec}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={resetAnalysis}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Analyze Another Link
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default PhishingPage;
