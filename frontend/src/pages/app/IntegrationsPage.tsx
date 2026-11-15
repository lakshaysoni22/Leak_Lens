import { motion } from 'framer-motion'
import { Plug, Shield, Globe, Bell, Code, Webhook, AlertTriangle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const integrations = [
  { name: 'VirusTotal', desc: 'Comprehensive threat intelligence and malware scanning.', icon: Shield, status: 'not_configured' as const, color: 'text-accent-green' },
  { name: 'AbuseIPDB', desc: 'IP address abuse reports and reputation scoring.', icon: Globe, status: 'not_configured' as const, color: 'text-accent-cyan' },
  { name: 'Slack Notifications', desc: 'Get real-time security alerts in your Slack workspace.', icon: Bell, status: 'coming_soon' as const, color: 'text-accent-purple' },
  { name: 'Webhook', desc: 'Send scan results to your custom webhook endpoints.', icon: Webhook, status: 'coming_soon' as const, color: 'text-warning' },
  { name: 'SIEM Export', desc: 'Export security events to your SIEM platform.', icon: Code, status: 'coming_soon' as const, color: 'text-danger' },
  { name: 'API Integration', desc: 'Access LeakLens programmatically via REST API.', icon: Code, status: 'not_configured' as const, color: 'text-accent-cyan' },
]

const statusBadge = { configured: { v: 'success' as const, t: 'Active' }, not_configured: { v: 'warning' as const, t: 'Not Configured' }, coming_soon: { v: 'default' as const, t: 'Coming Soon' } }

export default function IntegrationsPage() {
  return (
    <PageTransition>
      <Helmet><title>Integrations | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Integrations</h1>
          <p className="text-text-secondary mt-1">Connect LeakLens with your security stack.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((itg, i) => (
            <motion.div key={itg.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card variant="hover" padding="md" className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-white/[0.04] ${itg.color}`}><itg.icon size={20} /></div>
                  <Badge variant={statusBadge[itg.status].v}>{statusBadge[itg.status].t}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{itg.name}</h3>
                <p className="text-xs text-text-secondary mb-3">{itg.desc}</p>
                {itg.status === 'not_configured' && <p className="text-xs text-warning flex items-center gap-1"><AlertTriangle size={12} />Configure API key in .env</p>}
                {itg.status === 'coming_soon' && <p className="text-xs text-text-muted">Available in a future update</p>}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
