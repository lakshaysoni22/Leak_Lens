import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Globe,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lock,
  Server,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Mail,
  Eye,
  Fingerprint,
  KeyRound,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import type { DomainScanResult, DomainFinding } from '@/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DataSourceBadge from '@/components/shared/DataSourceBadge';
import PageTransition from '@/components/shared/PageTransition';
import RiskGauge from '@/components/charts/RiskGauge';
import ScannerAnimation from '@/components/effects/ScannerAnimation';

const DomainScannerPage: React.FC = () => {
  const [domainInput, setDomainInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DomainScanResult | null>(null);
  const [inputError, setInputError] = useState<string | undefined>();

  /* â”€â”€ Scan handler â€” NO synthetic fallback â”€â”€ */
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(undefined);

    let cleanDomain = domainInput.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];

    if (!cleanDomain) {
      setInputError('Please enter a domain name to inspect');
      return;
    }

    if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(cleanDomain)) {
      setInputError('Please enter a valid domain format (e.g. example.com)');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await api.post<DomainScanResult>('/domain/scan', { domain: cleanDomain });
      setResult(response.data);
    } catch {
      // Backend unavailable â€” basic client-side domain check
      try {
        const checks: string[] = [];
        let riskScore = 0;

        // Check if domain resolves via dns.google
        try {
          const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=A`, {
            signal: AbortSignal.timeout(8000),
          });
          if (dnsRes.ok) {
            const dnsData = await dnsRes.json();
            if (dnsData.Answer && dnsData.Answer.length > 0) {
              checks.push(`Domain resolves to ${dnsData.Answer[0].data}`);
            } else {
              checks.push('Domain does not resolve (no A record)');
              riskScore += 20;
            }
          }
        } catch { /* ignore */ }

        // Check MX records
        try {
          const mxRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=MX`, {
            signal: AbortSignal.timeout(8000),
          });
          if (mxRes.ok) {
            const mxData = await mxRes.json();
            if (mxData.Answer && mxData.Answer.length > 0) {
              checks.push(`${mxData.Answer.length} MX record(s) found`);
            } else {
              checks.push('No MX records found');
              riskScore += 10;
            }
          }
        } catch { /* ignore */ }

        riskScore = Math.min(100, riskScore);
        const level = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

        setResult({
          domain: cleanDomain,
          risk_score: riskScore,
          risk_level: level,
          checks,
          data_source: 'live_intelligence',
          summary: checks.length > 0 ? checks.join('. ') + '.' : 'Basic domain check completed.',
          created_at: new Date().toISOString(),
        } as unknown as DomainScanResult);
      } catch {
        toast.error('Domain scanning service temporarily unavailable.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setDomainInput('');
    setInputError(undefined);
  };

  const getSecurityLevelBadge = (level: DomainScanResult['security_level']) => {
    switch (level) {
      case 'good':
        return <Badge variant="success" size="md">Good Security Posture</Badge>;
      case 'fair':
        return <Badge variant="warning" size="md">Fair - Improvements Needed</Badge>;
      case 'poor':
        return <Badge variant="risk-high" size="md">Poor - Vulnerabilities Present</Badge>;
      case 'critical':
      default:
        return <Badge variant="risk-critical" size="md">Critical Exposure</Badge>;
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Domain Scanner | LeakLens - Cyber Exposure &amp; Intelligence</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A3FF6F]/15 border border-[#A3FF6F]/30 flex items-center justify-center text-[#A3FF6F]">
                <Globe className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Domain Security Scanner
              </h1>
            </div>
            <p className="text-sm text-[#929BAD] mt-1.5">
              Inspect public-facing infrastructure, SSL/TLS certificate integrity, and DNS configuration weaknesses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataSourceBadge dataSource="live_intelligence" size="md" />
          </div>
        </div>

        {/* INPUT STATE */}
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
                    Audit Domain Infrastructure
                  </h2>
                  <p className="text-sm text-[#929BAD]">
                    Evaluate cryptographic cipher suites, certificate expiration windows, security headers, and DNS hygiene in real time.
                  </p>
                </div>

                <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-1 w-full text-left">
                    <Input
                      type="text"
                      value={domainInput}
                      onChange={(e) => {
                        setDomainInput(e.target.value);
                        if (inputError) setInputError(undefined);
                      }}
                      placeholder="e.g. example.com"
                      icon={<Globe className="w-4 h-4" />}
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
                    Analyze Domain
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-2 text-xs text-[#929BAD] pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#A3FF6F]" />
                  <span>
                    Non-intrusive scanning: All checks query standard RFC-compliant public protocol endpoints only.
                  </span>
                </div>
              </div>
            </Card>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Lock className="w-4 h-4 text-[#A3FF6F]" />
                  <span>SSL/TLS Validation</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Checks certificate validity, cipher suites, TLS version, expiration countdowns, and certificate chain integrity.
                </p>
              </Card>

              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Server className="w-4 h-4 text-[#45D6FF]" />
                  <span>DNS &amp; Email Security</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Resolves A/AAAA/MX/NS records, validates SPF/DKIM/DMARC email authentication, and checks DNSSEC configuration.
                </p>
              </Card>

              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldAlert className="w-4 h-4 text-[#FFB547]" />
                  <span>Security Headers Audit</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Audits HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, and HTTPâ†’HTTPS redirect enforcement.
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* LOADING STATE */}
        {isAnalyzing && (
          <div className="py-16 flex flex-col items-center justify-center space-y-6">
            <ScannerAnimation size={300} isScanning={true} />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Probing Domain Infrastructure</h3>
              <p className="text-xs text-[#929BAD]">
                Resolving DNS zones, verifying TLS handshake, auditing HTTP security headers, and checking email authentication...
              </p>
            </div>
          </div>
        )}

        {/* RESULTS STATE â€” Domain doesn't resolve */}
        {result && !isAnalyzing && !result.dns.dns_resolves && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <Card variant="gradient" padding="lg" className="relative overflow-hidden">
              <div className="flex flex-col items-center text-center py-6 space-y-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                >
                  <div className="w-28 h-28 rounded-full bg-[#FF5A5A]/10 border-2 border-[#FF5A5A]/40 flex items-center justify-center">
                    <XCircle className="w-14 h-14 text-[#FF5A5A]" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FF5A5A]">
                    Domain Does Not Resolve
                  </h2>
                  <p className="text-base text-white font-mono">{result.domain}</p>
                  <p className="text-sm text-[#929BAD] max-w-lg mx-auto">
                    This domain could not be resolved via DNS. It may be unregistered, expired, or have
                    misconfigured nameservers. No further security checks could be performed.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                    <span className="text-[#929BAD]">DNS Status: </span>
                    <span className="font-bold text-[#FF5A5A]">NXDOMAIN / Unreachable</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                    <span className="text-[#929BAD]">Scanned: </span>
                    <span className="text-white">{formatDate(result.scanned_at)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={resetScan}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Scan Another Domain
              </Button>
            </div>
          </motion.div>
        )}

        {/* RESULTS STATE â€” Domain resolves, full results */}
        {result && !isAnalyzing && result.dns.dns_resolves && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Top Score Banner Card */}
            <Card variant="gradient" padding="lg" className="relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex flex-col items-center shrink-0">
                  <RiskGauge
                    score={Math.max(0, 100 - result.security_score)}
                    size={220}
                    label="Domain Risk"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    {getSecurityLevelBadge(result.security_level)}
                    <DataSourceBadge dataSource="live_intelligence" size="sm" />
                  </div>
                </div>

                <div className="space-y-4 flex-1 text-center lg:text-left">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#929BAD]">
                      Target Domain
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                      {result.domain}
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base text-[#F5F7FA] leading-relaxed max-w-2xl">
                    Overall domain security rating:{' '}
                    <span className="font-bold text-white">{result.security_score.toFixed(1)}/100</span>.
                    {(result.findings ?? []).length === 0
                      ? ' Excellent â€” no security issues detected across all scanned vectors.'
                      : ` ${(result.findings ?? []).length} finding(s) identified across SSL/TLS, DNS, HTTP headers, and email security.`}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">Findings: </span>
                      <span className="font-bold text-white">{(result.findings ?? []).length}</span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">TLS: </span>
                      <span className={`font-mono ${result.ssl.ssl_valid ? 'text-[#A3FF6F]' : 'text-[#FF5A5A]'}`}>
                        {result.ssl.ssl_version || (result.ssl.ssl_valid ? 'Valid' : 'Invalid')}
                      </span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">Scanned: </span>
                      <span className="text-white">{formatDate(result.scanned_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={resetScan}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Scan Another Domain
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

            {/* SSL/TLS & DNS INFO CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SSL / TLS Card */}
              <Card className="p-6 border-white/10 bg-[#111827]/70 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#A3FF6F]/15 text-[#A3FF6F] flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">SSL / TLS Configuration</h3>
                      <p className="text-xs text-[#929BAD]">Transport encryption health</p>
                    </div>
                  </div>
                  {result.ssl.ssl_valid ? (
                    <Badge variant="success" size="sm">Valid Certificate</Badge>
                  ) : result.ssl.https_available ? (
                    <Badge variant="risk-critical" size="sm">Invalid Certificate</Badge>
                  ) : (
                    <Badge variant="risk-high" size="sm">No HTTPS</Badge>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-[#929BAD]">HTTPS Available:</span>
                    <span className="font-semibold text-white flex items-center gap-1">
                      {result.ssl.https_available ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-[#A3FF6F]" /> Yes</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5 text-[#FF5A5A]" /> No</>
                      )}
                    </span>
                  </div>

                  {result.ssl.cert_issuer && (
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-[#929BAD]">Certificate Issuer:</span>
                      <span className="font-mono text-white text-right truncate max-w-[200px]">
                        {result.ssl.cert_issuer}
                      </span>
                    </div>
                  )}

                  {result.ssl.ssl_version && (
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-[#929BAD]">TLS Version:</span>
                      <span className="font-mono text-[#A3FF6F]">{result.ssl.ssl_version}</span>
                    </div>
                  )}

                  {result.ssl.cert_expires && (
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-[#929BAD]">Expires On:</span>
                      <span className="text-white">{formatDate(result.ssl.cert_expires)}</span>
                    </div>
                  )}

                  {result.ssl.days_until_expiry !== null && result.ssl.days_until_expiry !== undefined && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#929BAD]">Days Until Expiry:</span>
                      <span
                        className={`font-bold ${
                          result.ssl.days_until_expiry < 0
                            ? 'text-[#FF5A5A]'
                            : result.ssl.days_until_expiry < 30
                            ? 'text-[#FFB547]'
                            : 'text-[#A3FF6F]'
                        }`}
                      >
                        {result.ssl.days_until_expiry < 0
                          ? `EXPIRED (${Math.abs(result.ssl.days_until_expiry)} days ago)`
                          : `${result.ssl.days_until_expiry} days`}
                      </span>
                    </div>
                  )}

                  {result.ssl.ssl_error && (
                    <div className="mt-2 p-2 rounded bg-[#FF5A5A]/10 border border-[#FF5A5A]/20 text-[#FF5A5A] text-xs">
                      {result.ssl.ssl_error}
                    </div>
                  )}
                </div>
              </Card>

              {/* DNS Card */}
              <Card className="p-6 border-white/10 bg-[#111827]/70 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#45D6FF]/15 text-[#45D6FF] flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">DNS &amp; Email Security</h3>
                      <p className="text-xs text-[#929BAD]">Domain records &amp; authentication</p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">Resolves Successfully</Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* IP Addresses */}
                  <div className="space-y-1.5">
                    <span className="text-[#929BAD]">IP Addresses (A):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.dns.ip_addresses && (result.dns?.ip_addresses ?? []).length > 0 ? (
                        (result.dns?.ip_addresses ?? []).map((ip, ipIdx) => (
                          <span
                            key={ipIdx}
                            className="font-mono text-xs px-2.5 py-1 rounded bg-black/40 border border-white/10 text-white"
                          >
                            {ip}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#929BAD]">No A records</span>
                      )}
                    </div>
                  </div>

                  {/* Email Authentication Status */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <span className="text-[#929BAD] font-semibold uppercase tracking-wider text-[10px]">
                      Email Authentication
                    </span>
                    {(['spf', 'dmarc', 'dkim'] as const).map((rec) => {
                      const key = `has_${rec}` as string;
                      const hasIt = (result.dns as any)[key] ?? false;
                      return (
                        <div key={rec} className="flex items-center justify-between py-0.5">
                          <span className="text-[#929BAD] uppercase">{rec}:</span>
                          <span className="flex items-center gap-1 font-semibold">
                            {hasIt ? (
                              <><CheckCircle2 className="w-3.5 h-3.5 text-[#A3FF6F]" /> <span className="text-[#A3FF6F]">Configured</span></>
                            ) : (
                              <><XCircle className="w-3.5 h-3.5 text-[#FFB547]" /> <span className="text-[#FFB547]">Not Found</span></>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* SECURITY FINDINGS LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Security Findings</h3>
                  <p className="text-xs text-[#929BAD] mt-0.5">
                    Live analysis results categorized by severity level
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-semibold text-white">
                  {(result.findings ?? []).length} Findings
                </span>
              </div>

              {(result.findings ?? []).length === 0 ? (
                <Card className="p-8 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#A3FF6F]/10 border border-[#A3FF6F]/30 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-[#A3FF6F]" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-[#A3FF6F]">No Security Issues Found</h4>
                  <p className="text-sm text-[#929BAD] max-w-md mx-auto">
                    This domain has an excellent security posture. All checked vectors â€” SSL/TLS,
                    DNS, HTTP headers, and email authentication â€” passed inspection.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(result.findings ?? []).map((item: DomainFinding, idx: number) => {
                    const severityVariant =
                      item.severity === 'critical'
                        ? 'risk-critical'
                        : item.severity === 'high'
                        ? 'risk-high'
                        : item.severity === 'medium'
                        ? 'risk-medium'
                        : item.severity === 'low'
                        ? 'risk-low'
                        : 'info';

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="glass-card p-5 rounded-xl border border-white/10 bg-[#111827]/70 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <Badge variant={severityVariant} size="sm">
                              {item.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-bold text-white">{item.category}</span>
                          </div>
                        </div>

                        <p className="text-sm text-[#F5F7FA] leading-relaxed">
                          {item.finding}
                        </p>

                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-[#929BAD] flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-[#A3FF6F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white">Remediation: </span>
                            <span>{item.recommendation}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RECOMMENDATIONS LIST */}
            {(result.recommendations ?? []).length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Strategic Domain Hardening Plan</h3>
                  <p className="text-xs text-[#929BAD] mt-0.5">
                    Prioritized steps to improve your domain security posture
                  </p>
                </div>

                <div className="space-y-2.5">
                  {(result.recommendations ?? []).map((rec, rIdx) => (
                    <motion.div
                      key={rIdx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rIdx * 0.05 }}
                      className="p-4 rounded-xl border border-white/10 bg-[#111827]/80 flex items-center gap-3.5 text-sm"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#A3FF6F]/15 border border-[#A3FF6F]/30 flex items-center justify-center text-[#A3FF6F] shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[#F5F7FA] font-medium leading-relaxed">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Scan Another Button */}
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={resetScan}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Scan Another Domain
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default DomainScannerPage;
