import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, AlertTriangle, Activity } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import RiskGauge from '@/components/charts/RiskGauge'
import AnimatedCounter from '@/components/charts/AnimatedCounter'
import ExposureTrend from '@/components/charts/ExposureTrend'
import RiskDistribution from '@/components/charts/RiskDistribution'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'
import type { DashboardOverview } from '@/types'

export default function RiskAnalyticsPage() {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/overview').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const avgRisk = data ? (data.stats.total_assessments > 0 ? Math.round(((data.risk_distribution.critical * 90 + data.risk_distribution.high * 70 + data.risk_distribution.medium * 45 + data.risk_distribution.low * 20) / Math.max(data.stats.total_assessments, 1))) : 0) : 0
  const total = data ? data.stats.total_assessments : 0
  const highPct = data && total > 0 ? Math.round(((data.risk_distribution.high + data.risk_distribution.critical) / total) * 100) : 0

  return (
    <PageTransition>
      <Helmet><title>Risk Analytics | LeakLens</title></Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Risk Analytics</h1>
          <p className="text-text-secondary mt-1">Comprehensive analysis of your security risk posture.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" height={120} />)}</div>
        ) : !data || total === 0 ? (
          <EmptyState icon={BarChart3} title="No analytics data" description="Run your first scan to see risk analytics here." actionLabel="Go to Email Scanner" onAction={() => window.location.href = '/app/email-scanner'} />
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Avg Risk Score</span>
                    <BarChart3 size={18} className="text-accent-green" />
                  </div>
                  <RiskGauge score={avgRisk} size={100} />
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Total Scans</span>
                    <Activity size={18} className="text-accent-cyan" />
                  </div>
                  <div className="text-3xl font-bold text-text-primary"><AnimatedCounter end={total} /></div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">High Risk %</span>
                    <AlertTriangle size={18} className="text-warning" />
                  </div>
                  <div className="text-3xl font-bold text-warning"><AnimatedCounter end={highPct} suffix="%" /></div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Trend</span>
                    <TrendingUp size={18} className="text-accent-green" />
                  </div>
                  <div className="text-3xl font-bold text-accent-green">↑ Active</div>
                  <p className="text-xs text-text-secondary mt-1">Scanning regularly</p>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card variant="hover" padding="lg">
                  <CardHeader><CardTitle>Exposure Trend (30 days)</CardTitle></CardHeader>
                  <CardContent><ExposureTrend data={data.trend} /></CardContent>
                </Card>
              </div>
              <div>
                <Card variant="hover" padding="lg">
                  <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
                  <CardContent><RiskDistribution data={data.risk_distribution} /></CardContent>
                </Card>
              </div>
            </div>

            {/* Risk by type */}
            <Card variant="hover" padding="lg">
              <CardHeader><CardTitle>Risk by Scan Type</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const types = data?.scan_type_breakdown ?? {};
                    const emailC = types.email ?? 0;
                    const usernameC = types.username ?? 0;
                    const domainC = types.domain ?? 0;
                    const phishingC = types.phishing ?? types.url ?? 0;
                    const t = emailC + usernameC + domainC + phishingC || 1;
                    return [
                      { type: 'Email Scans', pct: Math.round((emailC / t) * 100), color: '#A3FF6F' },
                      { type: 'Username Scans', pct: Math.round((usernameC / t) * 100), color: '#45D6FF' },
                      { type: 'Domain Scans', pct: Math.round((domainC / t) * 100), color: '#8B7CFF' },
                      { type: 'Phishing Analysis', pct: Math.round((phishingC / t) * 100), color: '#FFB547' },
                    ];
                  })().map(item => (
                    <div key={item.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">{item.type}</span>
                        <span className="text-text-primary font-medium">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: item.color }} initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1, delay: 0.5 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageTransition>
  )
}
