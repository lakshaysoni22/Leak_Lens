import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, AlertTriangle, Activity, Shield,
  ShieldCheck, Eye, Target, ArrowRight, RefreshCw, Clock,
  Mail, User, Globe, AlertOctagon, Zap
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import DataSourceBadge from '@/components/shared/DataSourceBadge'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import RiskGauge from '@/components/charts/RiskGauge'
import AnimatedCounter from '@/components/charts/AnimatedCounter'
import ExposureTrend from '@/components/charts/ExposureTrend'
import RiskDistribution from '@/components/charts/RiskDistribution'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import api from '@/lib/api'
import type { DashboardOverview, AssessmentListItem } from '@/types'

/* ───────────────────────── Scan Type Config ───────────────────────── */
const scanTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; barColor: string; path: string }> = {
  email: { label: 'Email Scans', icon: <Mail size={14} />, color: 'text-accent-green', barColor: '#A3FF6F', path: '/app/email-scanner' },
  username: { label: 'Username Scans', icon: <User size={14} />, color: 'text-accent-cyan', barColor: '#45D6FF', path: '/app/username-scanner' },
  domain: { label: 'Domain Scans', icon: <Globe size={14} />, color: 'text-accent-purple', barColor: '#8B7CFF', path: '/app/domain-scanner' },
  phishing: { label: 'Phishing Analysis', icon: <AlertOctagon size={14} />, color: 'text-warning', barColor: '#FFB547', path: '/app/phishing' },
  url: { label: 'URL Analysis', icon: <AlertOctagon size={14} />, color: 'text-warning', barColor: '#FFB547', path: '/app/phishing' },
  ip: { label: 'IP Intelligence', icon: <Shield size={14} />, color: 'text-red-400', barColor: '#FF5A5A', path: '/app/threat-intel' },
}

const riskLevelColors: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-accent-green',
}

/* ───────────────────────── Empty Analytics State ───────────────────────── */
function EmptyAnalyticsState() {
  const scanners = [
    { name: 'Email Scanner', desc: 'Scan email addresses for breaches', icon: <Mail size={18} />, path: '/app/email-scanner', color: 'from-green-500/20 to-emerald-500/20 border-green-500/20' },
    { name: 'Domain Scanner', desc: 'Analyze domain security posture', icon: <Globe size={18} />, path: '/app/domain-scanner', color: 'from-purple-500/20 to-blue-500/20 border-purple-500/20' },
    { name: 'Username Scanner', desc: 'Find username exposure across platforms', icon: <User size={18} />, path: '/app/username-scanner', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20' },
    { name: 'Phishing Detection', desc: 'Analyze suspicious URLs for threats', icon: <AlertOctagon size={18} />, path: '/app/phishing', color: 'from-orange-500/20 to-red-500/20 border-orange-500/20' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Hero empty state */}
      <Card variant="hover" padding="lg">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-cyan/10 border-2 border-accent-cyan/20 flex items-center justify-center">
              <BarChart3 size={36} className="text-accent-cyan" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No Analytics Data Yet</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            Run your first security scan to start building your risk analytics dashboard. 
            All data shown here comes from your real scan history — powered by live intelligence.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="success">Live Intelligence</Badge>
            <Badge variant="info">Real-time Analysis</Badge>
          </div>
        </div>
      </Card>

      {/* Quick start scanner cards */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
          <Zap size={14} className="text-accent-cyan" /> Start Scanning
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scanners.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <a href={s.path} className="block">
                <Card variant="hover" padding="md" className="h-full hover:border-accent-cyan/30 transition-colors cursor-pointer group">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${s.color} w-fit mb-3`}>
                    {s.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-accent-cyan transition-colors">{s.name}</h4>
                  <p className="text-xs text-text-secondary">{s.desc}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                    Start Scan <ArrowRight size={12} />
                  </div>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function RiskAnalyticsPage() {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      const res = await api.get('/dashboard/overview')
      setData(res.data)
      setError(false)
      if (showToast) toast.success('Analytics data refreshed')
    } catch {
      setError(true)
      // Show error state — no fake data fallback
      if (showToast) toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const total = data?.stats?.total_assessments ?? 0
  const avgRisk = data && total > 0
    ? Math.round(
        ((data.risk_distribution.critical * 90) +
         (data.risk_distribution.high * 70) +
         (data.risk_distribution.medium * 45) +
         (data.risk_distribution.low * 20)) / total
      )
    : 0

  const highPct = data && total > 0
    ? Math.round(((data.risk_distribution.high + data.risk_distribution.critical) / total) * 100)
    : 0

  const weeklyGrowth = data && data.stats.this_week > 0 && total > 0
    ? Math.round((data.stats.this_week / total) * 100)
    : 0

  return (
    <PageTransition>
      <Helmet><title>Risk Analytics | LeakLens</title></Helmet>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/20">
                <BarChart3 size={24} className="text-accent-cyan" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Risk Analytics</h1>
                <p className="text-text-secondary text-sm">Comprehensive analysis of your security risk posture based on real scan data.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchData(true)}
              loading={refreshing}
              leftIcon={<RefreshCw size={14} />}
            >
              Refresh
            </Button>
            <DataSourceBadge dataSource="live_intelligence" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" height={120} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton variant="card" height={300} className="lg:col-span-2" />
              <Skeleton variant="card" height={300} />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card variant="hover" padding="lg">
            <div className="text-center py-8">
              <AlertTriangle size={40} className="text-warning mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to Load Analytics</h3>
              <p className="text-sm text-text-secondary mb-4">
                Could not fetch analytics data from the server. Please try again.
              </p>
              <Button onClick={() => { setLoading(true); fetchData(true) }} leftIcon={<RefreshCw size={14} />}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State — no scans yet */}
        {!loading && !error && data && total === 0 && (
          <EmptyAnalyticsState />
        )}

        {/* Analytics Content — ONLY shown when REAL data exists */}
        {!loading && !error && data && total > 0 && (
          <>
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">Avg Risk Score</span>
                    <div className="p-1.5 rounded-lg bg-accent-green/10">
                      <Target size={16} className="text-accent-green" />
                    </div>
                  </div>
                  <RiskGauge score={avgRisk} size={100} />
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">Total Assessments</span>
                    <div className="p-1.5 rounded-lg bg-accent-cyan/10">
                      <Activity size={16} className="text-accent-cyan" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-text-primary"><AnimatedCounter end={total} /></div>
                  <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {data.stats.this_week > 0 ? (
                      <span className="text-accent-green">+{data.stats.this_week} this week</span>
                    ) : (
                      <span>No scans this week</span>
                    )}
                  </p>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">High Risk</span>
                    <div className="p-1.5 rounded-lg bg-warning/10">
                      <AlertTriangle size={16} className="text-warning" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-warning"><AnimatedCounter end={highPct} suffix="%" /></div>
                  <p className="text-xs text-text-secondary mt-1">
                    {data.risk_distribution.critical > 0 && (
                      <span className="text-red-400">{data.risk_distribution.critical} critical</span>
                    )}
                    {data.risk_distribution.critical > 0 && data.risk_distribution.high > 0 && ' · '}
                    {data.risk_distribution.high > 0 && (
                      <span className="text-orange-400">{data.risk_distribution.high} high</span>
                    )}
                    {data.risk_distribution.critical === 0 && data.risk_distribution.high === 0 && (
                      <span className="text-accent-green">No high risk findings</span>
                    )}
                  </p>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">Weekly Activity</span>
                    <div className="p-1.5 rounded-lg bg-accent-green/10">
                      <TrendingUp size={16} className="text-accent-green" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-accent-green">
                    <AnimatedCounter end={data.stats.this_week} />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {weeklyGrowth > 0 ? (
                      <span className="text-accent-green">{weeklyGrowth}% of total scans this week</span>
                    ) : (
                      <span>Scans in the last 7 days</span>
                    )}
                  </p>
                </Card>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card variant="hover" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-accent-green" />
                      Exposure Trend (30 days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent><ExposureTrend data={data.trend} /></CardContent>
                </Card>
              </div>
              <div>
                <Card variant="hover" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye size={18} className="text-accent-purple" />
                      Risk Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent><RiskDistribution data={data.risk_distribution} /></CardContent>
                </Card>
              </div>
            </div>

            {/* Scan Type Breakdown */}
            <Card variant="hover" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={18} className="text-accent-cyan" />
                  Scan Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const types = data?.scan_type_breakdown ?? {}
                    const entries = Object.entries(types).filter(([, count]) => count > 0)
                    const totalScans = entries.reduce((acc, [, count]) => acc + count, 0) || 1

                    if (entries.length === 0) {
                      return (
                        <p className="text-sm text-text-secondary text-center py-4">
                          No scan type data available yet.
                        </p>
                      )
                    }

                    return entries
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => {
                        const config = scanTypeConfig[type] || { label: type, barColor: '#666', icon: <Activity size={14} /> }
                        const pct = Math.round((count / totalScans) * 100)
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <span className="text-text-secondary flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-text-primary font-medium">{count} scans</span>
                                <span className="text-text-secondary text-xs">({pct}%)</span>
                              </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: config.barColor }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                              />
                            </div>
                          </div>
                        )
                      })
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Recent Assessments */}
            {data.recent_assessments && data.recent_assessments.length > 0 && (
              <Card variant="hover" padding="lg">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={18} className="text-accent-cyan" />
                      Recent Assessments
                    </CardTitle>
                    <a href="/app/exposure-history" className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
                      View All <ArrowRight size={12} />
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recent_assessments.map((assessment, i) => (
                      <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${
                            assessment.risk_level === 'critical' ? 'bg-red-500/10' :
                            assessment.risk_level === 'high' ? 'bg-orange-500/10' :
                            assessment.risk_level === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                          }`}>
                            {scanTypeConfig[assessment.scan_type]?.icon || <Activity size={14} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {assessment.identifier_hint || 'Assessment'}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {scanTypeConfig[assessment.scan_type]?.label || assessment.scan_type} · {new Date(assessment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${riskLevelColors[assessment.risk_level] || 'text-text-primary'}`}>
                            {assessment.risk_score.toFixed(0)}
                          </span>
                          <Badge variant={
                            assessment.risk_level === 'critical' ? 'danger' :
                            assessment.risk_level === 'high' ? 'warning' :
                            assessment.risk_level === 'medium' ? 'info' : 'success'
                          }>
                            {assessment.risk_level}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageTransition>
  )
}
