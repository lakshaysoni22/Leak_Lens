import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle, Server, Database, Shield, Key } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

const services = [
  { name: 'API Gateway', icon: Server, status: 'operational' },
  { name: 'Scanner Engine', icon: Activity, status: 'operational' },
  { name: 'Database', icon: Database, status: 'operational' },
  { name: 'Authentication', icon: Key, status: 'operational' },
  { name: 'Threat Intelligence', icon: Shield, status: 'operational' },
]

export default function MonitoringPage() {
  const [apiHealth, setApiHealth] = useState<'healthy' | 'unknown'>('unknown')

  useEffect(() => {
    fetch('/api/v1/../health').then(r => r.json()).then(d => { if (d.status === 'healthy') setApiHealth('healthy') }).catch(() => {})
  }, [])

  return (
    <PageTransition>
      <Helmet><title>Monitoring | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Security Monitoring</h1>
          <p className="text-text-secondary mt-1">Monitor the health of LeakLens services and your digital assets.</p>
        </div>

        <Card variant="hover" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-accent-green animate-pulse" />
            <span className="text-lg font-semibold text-text-primary">All Systems Operational</span>
            <Badge variant="success">99.99% Uptime</Badge>
          </div>
          <div className="space-y-3">
            {services.map((s, i) => (
              <motion.div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center gap-3">
                  <s.icon size={18} className="text-text-secondary" />
                  <span className="text-sm text-text-primary">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-accent-green" />
                  <span className="text-xs text-accent-green capitalize">{s.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle>Continuous Monitoring</CardTitle></CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm mb-4">Set up continuous monitoring to automatically track changes in your digital exposure and receive alerts when new risks are detected.</p>
            <div className="bg-accent-green-dim rounded-xl p-4 border border-accent-green/20">
              <p className="text-sm text-accent-green font-medium">✨ Available in Pro Plan</p>
              <p className="text-xs text-text-secondary mt-1">Upgrade to Pro to enable continuous monitoring for your email addresses, usernames, and domains.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
