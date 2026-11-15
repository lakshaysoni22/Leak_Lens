import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Search,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Database,
  Tag,
  Sliders,
  ChevronRight,
  Globe,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import type { ScanResult, RiskLevel } from '@/types';
import { formatDate, formatScore } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import RiskBadge from '@/components/shared/RiskBadge';
import DataSourceBadge from '@/components/shared/DataSourceBadge';
import PageTransition from '@/components/shared/PageTransition';
import ScannerAnimation from '@/components/effects/ScannerAnimation';
import RiskGauge from '@/components/charts/RiskGauge';

const SCAN_STAGES = [
  'Connecting to OSINT intelligence matrix...',
  'Crawling hacker forums & paste repositories...',
  'Matching username footprint across platforms...',
  'Correlating credential leaks with handle...',
  'Synthesizing platform risk profile...',
  'Username intelligence scan complete',
];

const UsernameScannerPage: React.FC = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [inputError, setInputError] = useState<string | undefined>();

  const stageTimersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      stageTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(undefined);

    const username = usernameInput.trim().replace(/^@/, '');
    if (!username) {
      setInputError('Please enter a username or handle to inspect');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]{3,35}$/.test(username)) {
      setInputError('Usernames typically contain 3-35 alphanumeric characters, underscores, or dots');
      return;
    }

    setIsScanning(true);
    setCurrentStageIndex(0);
    setResult(null);

    // Call API or provide high-assurance fallback
    const apiPromise = api
      .post<ScanResult>('/scans/username', { username })
      .then((res) => res.data)
      .catch((err) => {
        console.warn('Backend returned error or offline, providing synthetic intelligence scan:', err);
        const fallback: ScanResult = {
          assessment_id: `user-scan-${Date.now()}`,
          scan_type: 'username',
          identifier_hint: username,
          risk_score: 64.0,
          risk_level: 'medium',
          exposure_count: 2,
          data_source: 'synthetic',
          data_notice:
            'NOTICE: This assessment utilizes benchmark synthetic OSINT data to simulate credential exposure without compromising active privacy.',
          summary:
            `Target handle '${username}' was identified across 2 underground breach aggregators and linked to 5 publicly indexed technical platforms. Exposure involves password reuse vectors and developer code pastes.`,
          platform_mentions: [
            'GitHub',
            'Pastebin',
            'BreachForums',
            'Telegram (Combolist Channel)',
            'Reddit',
            'Discord Developer Network',
          ],
          exposure_records: [
            {
              source_name: 'Developer Sandbox Credential Leak',
              source_date: '2024-12-04',
              data_categories: ['API Keys', 'SHA-256 Hashes', 'Repository URLs'],
              severity: 'high',
              is_verified: true,
              data_source_type: 'synthetic',
            },
            {
              source_name: 'Gaming Community Forum Dump',
              source_date: '2023-08-19',
              data_categories: ['Usernames', 'MD5 Password Hashes', 'IP Log History'],
              severity: 'medium',
              is_verified: true,
              data_source_type: 'synthetic',
            },
          ],
          risk_factors: [
            {
              name: 'Handle Re-Use Pattern',
              weight: 0.4,
              score: 72.0,
              contribution: 28.8,
              explanation:
                'Identical handle indexed on both high-privilege developer platforms and compromised public forums.',
            },
            {
              name: 'Pastebin Code Snippet Linkage',
              weight: 0.35,
              score: 60.0,
              contribution: 21.0,
              explanation:
                'Public code pastes reference this handle alongside internal environment variable naming conventions.',
            },
            {
              name: 'Credential stuffing vulnerability',
              weight: 0.25,
              score: 56.8,
              contribution: 14.2,
              explanation:
                'Historical password hashes allow attackers to build targeted dictionary attacks against modern services.',
            },
          ],
          recommendations: [
            {
              priority: 'Urgent',
              category: 'Identity Sanitization',
              action: 'Disassociate Public Handle from Production Repos',
              explanation:
                'Avoid using the same username for public open-source contributions, gaming platforms, and corporate IAM accounts.',
            },
            {
              priority: 'High',
              category: 'Secrets Management',
              action: 'Audit Historical Git Commits for API Tokens',
              explanation:
                'Run automated secret scanning on past repositories to ensure hardcoded authentication keys were completely purged.',
            },
            {
              priority: 'Medium',
              category: 'Credential Hygiene',
              action: 'Differentiate Passwords Across Handle Footprint',
              explanation:
                'Never reuse passwords across personal forums and critical cloud development platforms.',
            },
          ],
          is_demo: true,
          created_at: new Date().toISOString(),
        };
        return fallback;
      });

    // Schedule 500ms delay timers
    stageTimersRef.current.forEach(clearTimeout);
    stageTimersRef.current = [];

    const scheduleStage = (stageIdx: number, delayMs: number) => {
      const timer = setTimeout(() => {
        setCurrentStageIndex(stageIdx);
      }, delayMs);
      stageTimersRef.current.push(timer);
    };

    SCAN_STAGES.forEach((_, idx) => {
      if (idx > 0) scheduleStage(idx, idx * 500);
    });

    const minAnimPromise = new Promise((resolve) =>
      setTimeout(resolve, SCAN_STAGES.length * 500 + 400)
    );

    try {
      const [data] = await Promise.all([apiPromise, minAnimPromise]);
      setResult(data);
    } catch (err: any) {
      toast.error('Scan failed to complete. Please try again.');
    } finally {
      setIsScanning(false);
      setCurrentStageIndex(-1);
    }
  };

  const resetScan = () => {
    setResult(null);
    setUsernameInput('');
    setInputError(undefined);
    setCurrentStageIndex(-1);
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Username Scanner | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
                <UserIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Username Intelligence Scanner
              </h1>
            </div>
            <p className="text-sm text-[#929BAD] mt-1.5">
              Correlate digital aliases across breach archives, technical forums, and paste repositories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DataSourceBadge dataSource="synthetic" size="md" />
          </div>
        </div>

        {/* INPUT STATE */}
        {!isScanning && !result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card variant="default" padding="lg" className="border-white/10 relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6 text-center py-4">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Scan Handle or Alias
                  </h2>
                  <p className="text-sm text-[#929BAD]">
                    Discover whether developer handles, admin accounts, or executive aliases have been exposed in historical compromises.
                  </p>
                </div>

                <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-1 w-full text-left">
                    <Input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value);
                        if (inputError) setInputError(undefined);
                      }}
                      placeholder="e.g. dev_sec_lead (without @ symbol)"
                      icon={<UserIcon className="w-4 h-4" />}
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
                    Scan Username
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-2 text-xs text-[#929BAD] pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#A3FF6F]" />
                  <span>
                    Privacy protected: Queries are hashed and sanitized against our synthetic OSINT dataset.
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Context Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Globe className="w-4 h-4 text-[#8B7CFF]" />
                  <span>Cross-Platform Correlation</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Maps identical handles across code hosts, discussion boards, and dark web aggregators to detect identity reuse.
                </p>
              </Card>

              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Share2 className="w-4 h-4 text-[#45D6FF]" />
                  <span>Public Footprint Analysis</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Surfaces indexed platform mentions to assess whether an attacker could pivot from public profiles into internal systems.
                </p>
              </Card>

              <Card className="p-5 border-white/5 space-y-2 bg-surface/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-[#A3FF6F]" />
                  <span>Targeted Risk Scoring</span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Evaluates the risk of credential stuffing, social engineering, and OSINT targeting based on public exposure density.
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* SCANNING RADAR ANIMATION */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative">
                <ScannerAnimation size={320} isScanning={true} />
              </div>

              <div className="w-full max-w-md bg-[#111827]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-3">
                <div className="text-xs font-semibold text-[#929BAD] uppercase tracking-wider mb-2 text-center">
                  Executing Username Intelligence Recon
                </div>

                {SCAN_STAGES.map((stageText, idx) => {
                  const isPast = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;
                  const isFuture = currentStageIndex < idx;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isFuture ? 0.3 : 1,
                        x: 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-between text-sm py-1.5 px-3 rounded-lg transition-colors ${
                        isCurrent
                          ? 'bg-[#8B7CFF]/15 border border-[#8B7CFF]/40 text-white font-medium'
                          : isPast
                          ? 'text-[#A3FF6F]'
                          : 'text-[#929BAD]/50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {isPast ? (
                          <CheckCircle2 className="w-4 h-4 text-[#A3FF6F] shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-ping shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
                        )}
                        <span>{stageText}</span>
                      </span>

                      {isPast && <span className="text-[11px] text-[#A3FF6F] font-mono">OK</span>}
                      {isCurrent && (
                        <span className="text-[11px] text-[#8B7CFF] font-mono animate-pulse">
                          SCANNING...
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS STATE */}
        {result && !isScanning && (
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
                  <RiskGauge score={result.risk_score} size={220} label="Exposure Score" />
                  <div className="mt-2 flex items-center gap-2">
                    <RiskBadge level={result.risk_level} size="md" showIcon />
                    <DataSourceBadge dataSource={result.data_source} size="md" />
                  </div>
                </div>

                <div className="space-y-4 flex-1 text-center lg:text-left">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#929BAD]">
                      Investigated Alias
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                      @{result.identifier_hint}
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base text-[#F5F7FA] leading-relaxed max-w-2xl">
                    {result.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">Breaches Found: </span>
                      <span className="font-bold text-white">{result.exposure_count}</span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">Indexed Platforms: </span>
                      <span className="font-bold text-[#45D6FF]">
                        {result.platform_mentions?.length ?? 0}
                      </span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs">
                      <span className="text-[#929BAD]">Timestamp: </span>
                      <span className="text-white">{formatDate(result.created_at)}</span>
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
                    Scan Another Handle
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

            {/* PLATFORM MENTIONS SECTION */}
            {result.platform_mentions && result.platform_mentions.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#8B7CFF]" />
                    <span>Identified Platform Mentions</span>
                  </h3>
                  <p className="text-xs text-[#929BAD] mt-0.5">
                    Online ecosystems, code hubs, and discussion boards where this handle was detected
                  </p>
                </div>

                <Card className="p-6 border-white/10 bg-[#111827]/70">
                  <div className="flex flex-wrap gap-2.5">
                    {result.platform_mentions.map((platform, pIdx) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-semibold text-white hover:border-[#8B7CFF]/50 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#8B7CFF]" />
                        <span>{platform}</span>
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* EXPOSURE RECORDS LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Linked Breach Records</h3>
                  <p className="text-xs text-[#929BAD] mt-0.5">
                    Data dump entries referencing this handle
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-semibold text-[#A3FF6F]">
                  {result.exposure_records.length} Records Found
                </span>
              </div>

              {result.exposure_records.length === 0 ? (
                <Card className="p-8 text-center text-[#929BAD]">
                  No direct breach leaks identified for this username.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.exposure_records.map((record, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="glass-card p-5 rounded-xl border border-white/10 bg-[#111827]/70 space-y-4 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-bold text-white flex items-center gap-2">
                            <Database className="w-4 h-4 text-[#8B7CFF]" />
                            <span>{record.source_name}</span>
                          </div>
                          {record.source_date && (
                            <div className="flex items-center gap-1.5 text-xs text-[#929BAD] mt-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Disclosed {formatDate(record.source_date)}</span>
                            </div>
                          )}
                        </div>

                        <RiskBadge level={record.severity as RiskLevel} size="sm" showIcon />
                      </div>

                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-[#929BAD] font-semibold mb-2">
                          Compromised Attributes:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {record.data_categories.map((cat, cIdx) => (
                            <span
                              key={cIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs text-white"
                            >
                              <Tag className="w-3 h-3 text-[#8B7CFF]" />
                              <span>{cat}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#929BAD] pt-3 border-t border-white/[0.06]">
                        <span>Verification:</span>
                        <span className="font-semibold text-white">
                          {record.is_verified ? 'Cryptographically Verified' : 'Community Reported'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* RISK FACTORS & CONTRIBUTIONS */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Risk Score Decomposition</h3>
                <p className="text-xs text-[#929BAD] mt-0.5">
                  Algorithmic weights and OSINT exposure determinants
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.risk_factors.map((factor, idx) => (
                  <Card key={idx} className="p-5 border-white/10 bg-[#111827]/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{factor.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#8B7CFF]">
                        Weight: {(factor.weight * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#929BAD]">Sub-score:</span>
                        <span className="font-bold text-white">{formatScore(factor.score)} / 100</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8B7CFF] to-[#45D6FF] rounded-full"
                          style={{ width: `${Math.min(factor.score, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-[#929BAD] leading-relaxed pt-1">
                      {factor.explanation}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Recommended Security Actions</h3>
                <p className="text-xs text-[#929BAD] mt-0.5">
                  Guidance to mitigate username reuse and account takeover vectors
                </p>
              </div>

              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-5 rounded-xl border border-white/10 bg-[#111827]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF] shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-white">{rec.action}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              rec.priority.toLowerCase() === 'urgent' ||
                              rec.priority.toLowerCase() === 'critical'
                                ? 'bg-[#FF5A5A]/15 text-[#FF5A5A] border border-[#FF5A5A]/30'
                                : 'bg-[#FFB547]/15 text-[#FFB547] border border-[#FFB547]/30'
                            }`}
                          >
                            {rec.priority}
                          </span>
                          <span className="text-[11px] text-[#929BAD]">• {rec.category}</span>
                        </div>
                        <p className="text-xs text-[#929BAD] leading-relaxed max-w-2xl">
                          {rec.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        onClick={() => toast.success(`Action logged: ${rec.action}`)}
                      >
                        Execute
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={resetScan}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Scan Another Username
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default UsernameScannerPage;
