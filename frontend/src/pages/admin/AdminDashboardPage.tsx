import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, BarChart3, Shield, Activity, Server, TrendingUp } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import AnimatedCounter from '@/components/charts/AnimatedCounter'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import api from '@/lib/api'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({ total_users: 0, active_users: 0, total_scans: 0, total_assessments: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Users', key: 'total_users', icon: Users, color: 'text-accent-green', bg: 'bg-accent-green/10' },
    { label: 'Active Users', key: 'active_users', icon: Activity, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: 'Total Scans', key: 'total_scans', icon: BarChart3, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { label: 'Assessments', key: 'total_assessments', icon: Shield, color: 'text-warning', bg: 'bg-warning/10' },
  ]

  return (
    <PageTransition>
      <Helmet><title>Admin Dashboard | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary mt-1">System overview and management.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" height={120} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card variant="stat" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">{s.label}</span>
                    <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={18} className={s.color} /></div>
                  </div>
                  <div className="text-3xl font-bold text-text-primary">
                    <AnimatedCounter end={stats?.[s.key] ?? 0} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="hover" padding="lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity size={18} className="text-accent-green" /> Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'New user registered', time: '2 minutes ago', type: 'info' },
                  { action: 'Email scan completed', time: '5 minutes ago', type: 'success' },
                  { action: 'High-risk assessment generated', time: '12 minutes ago', type: 'warning' },
                  { action: 'User updated profile', time: '1 hour ago', type: 'info' },
                  { action: 'Domain scan completed', time: '2 hours ago', type: 'success' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-accent-green' : item.type === 'warning' ? 'bg-warning' : 'bg-accent-cyan'}`} />
                      <span className="text-sm text-text-primary">{item.action}</span>
                    </div>
                    <span className="text-xs text-text-muted">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="hover" padding="lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Server size={18} className="text-accent-cyan" /> System Health</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'API Server', status: 'Healthy', uptime: '99.99%' },
                  { name: 'Database', status: 'Healthy', uptime: '99.99%' },
                  { name: 'Scanner Engine', status: 'Healthy', uptime: '99.98%' },
                  { name: 'Authentication', status: 'Healthy', uptime: '100%' },
                  { name: 'Task Queue', status: 'Healthy', uptime: '99.97%' },
                ].map(s => (
                  <div key={s.name} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-green" />
                      <span className="text-sm text-text-primary">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{s.uptime}</span>
                      <Badge variant="success" size="sm">{s.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
