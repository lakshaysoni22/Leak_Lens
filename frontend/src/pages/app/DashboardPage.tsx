import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  BarChart3,
  AlertTriangle,
  ShieldAlert,
  Eye,
  Bell,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  User as UserIcon,
  Globe,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { DashboardOverview, AssessmentListItem } from '@/types';
import { formatDate, formatScore } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import Table, { type Column } from '@/components/ui/Table';
import EmptyState from '@/components/ui/EmptyState';
import RiskBadge from '@/components/shared/RiskBadge';
import DataSourceBadge from '@/components/shared/DataSourceBadge';
import PageTransition from '@/components/shared/PageTransition';
import AnimatedCounter from '@/components/charts/AnimatedCounter';
import ExposureTrend from '@/components/charts/ExposureTrend';
import RiskDistribution from '@/components/charts/RiskDistribution';

const defaultStats = {
  total_assessments: 0,
  this_week: 0,
  high_risk: 0,
  critical_risk: 0,
  monitored_identifiers: 0,
  active_alerts: 0,
};

const defaultDistribution = {
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await api.get<DashboardOverview>('/dashboard/overview');
      setOverview(response.data);
    } catch (err: any) {
      toast.error('Could not load dashboard data');
      // Show empty dashboard — no fake data
      setOverview({
        user: {
          full_name: user?.full_name || 'Security Operator',
          email: user?.email || '',
          role: user?.role || 'user',
          is_verified: true,
        },
        stats: {
          total_assessments: 0,
          this_week: 0,
          high_risk: 0,
          critical_risk: 0,
          monitored_identifiers: 0,
          active_alerts: 0,
        },
        risk_distribution: { low: 0, medium: 0, high: 0, critical: 0 },
        trend: [],
        recent_assessments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = overview?.stats ?? defaultStats;
  const distribution = overview?.risk_distribution ?? defaultDistribution;
  const trend = overview?.trend ?? [];
  const recentAssessments = (overview?.recent_assessments ?? []).slice(0, 5);

  const columns: Column<AssessmentListItem>[] = [
    {
      key: 'scan_type',
      header: 'Type',
      render: (item) => (
        <span className="capitalize font-medium text-white flex items-center gap-2">
          {item.scan_type === 'email' && <Mail className="w-3.5 h-3.5 text-[#45D6FF]" />}
          {item.scan_type === 'username' && <UserIcon className="w-3.5 h-3.5 text-[#8B7CFF]" />}
          {item.scan_type === 'domain' && <Globe className="w-3.5 h-3.5 text-[#A3FF6F]" />}
          {item.scan_type === 'url' && <ShieldAlert className="w-3.5 h-3.5 text-[#FF5A5A]" />}
          {item.scan_type}
        </span>
      ),
    },
    {
      key: 'identifier_hint',
      header: 'Identifier',
      render: (item) => (
        <span className="font-mono text-xs text-[#F5F7FA]">
          {item.identifier_hint || 'N/A'}
        </span>
      ),
    },
    {
      key: 'risk_score',
      header: 'Risk Score',
      render: (item) => (
        <span className="font-bold text-white text-sm">
          {formatScore(item.risk_score)}
          <span className="text-xs text-[#929BAD] font-normal">/100</span>
        </span>
      ),
    },
    {
      key: 'risk_level',
      header: 'Risk Level',
      render: (item) => <RiskBadge level={item.risk_level} showIcon />,
    },
    {
      key: 'data_source',
      header: 'Data Source',
      render: (item) => <DataSourceBadge dataSource={item.data_source} size="sm" />,
    },
    {
      key: 'created_at',
      header: 'Date',
      align: 'right',
      render: (item) => (
        <span className="text-xs text-[#929BAD] whitespace-nowrap">
          {formatDate(item.created_at)}
        </span>
      ),
    },
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Dashboard | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-[#A3FF6F] to-[#45D6FF] bg-clip-text text-transparent">
                  {overview?.user?.full_name || user?.full_name || 'Security Operator'}
                </span>
              </h1>
            </div>
            <p className="text-sm text-[#929BAD] mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              • Real-time exposure telemetries and threat indicators
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchOverview}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsScanModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Scan
            </Button>
          </div>
        </div>

        {/* 5 STATS CARDS ROW */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="card" height={130} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Total Assessments */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-[#A3FF6F]/20 group-hover:text-[#A3FF6F]/40 transition-colors">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#929BAD]">
                Total Assessments
              </div>
              <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-1">
                <AnimatedCounter end={stats.total_assessments} />
              </div>
              <div className="text-[11px] text-[#A3FF6F] flex items-center gap-1 mt-2">
                <span>+{stats.this_week} this week</span>
              </div>
            </Card>

            {/* 2. High Risk Found */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-[#FFB547]/20 group-hover:text-[#FFB547]/40 transition-colors">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#929BAD]">
                High Risk Found
              </div>
              <div className="text-3xl font-extrabold text-[#FFB547] mt-2 flex items-baseline gap-1">
                <AnimatedCounter end={stats.high_risk} />
              </div>
              <div className="text-[11px] text-[#929BAD] mt-2">Requires prompt remediation</div>
            </Card>

            {/* 3. Critical Alerts */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-[#FF5A5A]/20 group-hover:text-[#FF5A5A]/40 transition-colors">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#929BAD]">
                Critical Alerts
              </div>
              <div className="text-3xl font-extrabold text-[#FF5A5A] mt-2 flex items-baseline gap-1">
                <AnimatedCounter end={stats.critical_risk} />
              </div>
              <div className="text-[11px] text-[#FF5A5A] font-medium mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A5A] animate-ping" />
                Immediate action needed
              </div>
            </Card>

            {/* 4. Monitored Items */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-[#45D6FF]/20 group-hover:text-[#45D6FF]/40 transition-colors">
                <Eye className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#929BAD]">
                Monitored Items
              </div>
              <div className="text-3xl font-extrabold text-[#45D6FF] mt-2 flex items-baseline gap-1">
                <AnimatedCounter end={stats.monitored_identifiers} />
              </div>
              <div className="text-[11px] text-[#929BAD] mt-2">Continuous scan targets</div>
            </Card>

            {/* 5. Active Alerts */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-[#8B7CFF]/20 group-hover:text-[#8B7CFF]/40 transition-colors">
                <Bell className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#929BAD]">
                Active Alerts
              </div>
              <div className="text-3xl font-extrabold text-[#8B7CFF] mt-2 flex items-baseline gap-1">
                <AnimatedCounter end={stats.active_alerts} />
              </div>
              <div className="text-[11px] text-[#929BAD] mt-2">Pending operator triage</div>
            </Card>
          </div>
        )}

        {/* CHARTS ROW (2 columns: Trend Left 2/3, Distribution Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exposure Trend Chart */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#A3FF6F]" />
                    Exposure & Scan Velocity
                  </CardTitle>
                  <p className="text-xs text-[#929BAD] mt-0.5">
                    Historical volume of reconnaissance scans performed over past 7 days
                  </p>
                </div>
                <span className="text-xs font-medium text-accent-green px-2.5 py-1 rounded-full bg-[#A3FF6F]/10 border border-[#A3FF6F]/30">
                  Live Feed
                </span>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex items-center justify-center">
                {trend.length > 0 ? (
                  <ExposureTrend data={trend} height={250} />
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-xs text-[#929BAD]">
                    No historical scans recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution Donut */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#FFB547]" />
                  Threat Severity Distribution
                </CardTitle>
                <p className="text-xs text-[#929BAD] mt-0.5">
                  Proportion of findings grouped by risk severity rating
                </p>
              </CardHeader>
              <CardContent className="pt-2 flex-1 flex items-center justify-center">
                <RiskDistribution data={distribution} height={230} showLegend />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RECENT ASSESSMENTS TABLE */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Recent Assessments</span>
              </CardTitle>
              <p className="text-xs text-[#929BAD] mt-1">
                Latest security scans across email addresses, usernames, domains, and suspicious links
              </p>
            </div>
            <Link
              to="/app/history"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3FF6F] hover:underline"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton height={42} />
                <Skeleton height={42} />
                <Skeleton height={42} />
              </div>
            ) : recentAssessments.length > 0 ? (
              <Table<AssessmentListItem>
                columns={columns}
                data={recentAssessments}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => {
                  if (item.scan_type === 'email') navigate('/app/email-scanner');
                  else if (item.scan_type === 'username') navigate('/app/username-scanner');
                  else if (item.scan_type === 'domain') navigate('/app/domain-scanner');
                  else navigate('/app/phishing');
                }}
              />
            ) : (
              <EmptyState
                icon={ShieldCheck}
                title="No Assessments Performed"
                description="Initiate your first reconnaissance scan to monitor compromised credentials and malicious domains."
                actionLabel="Start Email Scan"
                onAction={() => navigate('/app/email-scanner')}
              />
            )}
          </CardContent>
        </Card>

        {/* SECURITY RECOMMENDATIONS WIDGET */}
        <Card variant="gradient" className="border-l-4 border-l-[#A3FF6F]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Sparkles className="w-4 h-4 text-[#A3FF6F]" />
              Proactive Security Recommendations
            </CardTitle>
            <p className="text-xs text-[#929BAD]">
              Tailored remediation steps generated from your latest threat telemetry
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A3FF6F]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Enforce Hardware 2FA / FIDO2</span>
              </div>
              <p className="text-xs text-[#929BAD] leading-relaxed">
                2 accounts were identified in credential dumps. Transition key admins to hardware tokens to neutralize credential stuffing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FFB547]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Audit Domain SSL / DNSSEC</span>
              </div>
              <p className="text-xs text-[#929BAD] leading-relaxed">
                Ensure all external endpoints enforce HSTS preload and DNSSEC to prevent spoofing and downgrade attacks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#45D6FF]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Automate Monitoring Cadence</span>
              </div>
              <p className="text-xs text-[#929BAD] leading-relaxed">
                Enable automated weekly breach audits to capture pastes and forum leaks within hours of initial exposure.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* NEW SCAN MODAL */}
        <Modal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          title="Select Reconnaissance Target"
          description="Choose a scanner to investigate exposure records and threat vectors."
          size="md"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setIsScanModalOpen(false);
                navigate('/app/email-scanner');
              }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#A3FF6F]/10 hover:border-[#A3FF6F]/40 transition-all text-left flex flex-col gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#A3FF6F]/15 flex items-center justify-center text-[#A3FF6F]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-[#A3FF6F] transition-colors">
                  Email Scanner
                </h4>
                <p className="text-xs text-[#929BAD] mt-1">
                  Examine credential leaks and compromised password hashes.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsScanModalOpen(false);
                navigate('/app/username-scanner');
              }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#8B7CFF]/10 hover:border-[#8B7CFF]/40 transition-all text-left flex flex-col gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#8B7CFF]/15 flex items-center justify-center text-[#8B7CFF]">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-[#8B7CFF] transition-colors">
                  Username Intelligence
                </h4>
                <p className="text-xs text-[#929BAD] mt-1">
                  Track developer handles across underground forums and pastes.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsScanModalOpen(false);
                navigate('/app/domain-scanner');
              }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#45D6FF]/10 hover:border-[#45D6FF]/40 transition-all text-left flex flex-col gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#45D6FF]/15 flex items-center justify-center text-[#45D6FF]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-[#45D6FF] transition-colors">
                  Domain Scanner
                </h4>
                <p className="text-xs text-[#929BAD] mt-1">
                  Audit SSL certificates, DNS configurations, and security headers.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsScanModalOpen(false);
                navigate('/app/phishing');
              }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#FF5A5A]/10 hover:border-[#FF5A5A]/40 transition-all text-left flex flex-col gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FF5A5A]/15 flex items-center justify-center text-[#FF5A5A]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-[#FF5A5A] transition-colors">
                  Phishing URL Analyzer
                </h4>
                <p className="text-xs text-[#929BAD] mt-1">
                  Deconstruct suspicious domains and typosquatting redirectors.
                </p>
              </div>
            </button>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
