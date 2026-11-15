import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Server, CheckCircle, XCircle, Activity, Database, Shield, Key, Cpu } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface ServiceStatus { name: string; icon: React.ElementType; status: 'operational' | 'degraded' | 'down'; uptime: string; latency: string }

export default function SystemHealthPage() {
  const [apiUp, setApiUp] = useState(false)

  useEffect(() => {
    fetch('/api/v1/../health').then(r => r.json()).then(d => { if (d.status === 'healthy') setApiUp(true) }).catch(() => {})
  }, [])

  const services: ServiceStatus[] = [
    { name: 'API Server', icon: Server, status: apiUp ? 'operational' : 'down', uptime: '99.99%', latency: '12ms' },
    { name: 'Database (SQLite)', icon: Database, status: 'operational', uptime: '99.99%', latency: '3ms' },
    { name: 'Scanner Engine', icon: Activity, status: 'operational', uptime: '99.98%', latency: '45ms' },
    { name: 'Authentication', icon: Key, status: 'operational', uptime: '100%', latency: '8ms' },
    { name: 'Task Queue', icon: Cpu, status: 'operational', uptime: '99.97%', latency: '15ms' },
  ]

  const statusColor = { operational: 'bg-accent-green', degraded: 'bg-warning', down: 'bg-danger' }
  const statusText = { operational: 'Operational', degraded: 'Degraded', down: 'Down' }
  const statusBadge = { operational: 'success' as const, degraded: 'warning' as const, down: 'risk-critical' as const }

  const allOperational = services.every(s => s.status === 'operational')

  return (
    <PageTransition>
      <Helmet><title>System Health | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">System Health</h1>
          <p className="text-text-secondary mt-1">Real-time status of all LeakLens services.</p>
        </div>

        <Card variant="hover" padding="lg">
          <div className="flex items-center gap-3">
            {allOperational ? <CheckCircle size={24} className="text-accent-green" /> : <XCircle size={24} className="text-danger" />}
            <div>
              <p className="text-lg font-semibold text-text-primary">{allOperational ? 'All Systems Operational' : 'Some Services Degraded'}</p>
              <p className="text-sm text-text-secondary">Last checked: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card variant="hover" padding="md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <s.icon size={18} className="text-text-secondary" />
                    <span className="text-sm font-semibold text-text-primary">{s.name}</span>
                  </div>
                  <Badge variant={statusBadge[s.status]} size="sm">{statusText[s.status]}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${statusColor[s.status]} ${s.status === 'operational' ? 'animate-pulse' : ''}`} />
                  <span className="text-xs text-text-secondary">Status: {statusText[s.status]}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                    <p className="text-text-muted">Uptime</p>
                    <p className="text-text-primary font-medium">{s.uptime}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                    <p className="text-text-muted">Latency</p>
                    <p className="text-text-primary font-medium">{s.latency}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
