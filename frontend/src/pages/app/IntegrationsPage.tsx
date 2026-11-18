import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plug, Shield, Search, Globe, AlertTriangle, Radio, Brain, Mail, CreditCard, CheckCircle, XCircle, Loader2, ExternalLink, Zap } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import api from '@/lib/api'

interface Integration {
  id: string
  name: string
  category: string
  description: string
  capabilities: string[]
  setup_url: string | null
  icon: string
  status: 'connected' | 'not_configured'
  configured: boolean
  always_available: boolean
}

const iconMap: Record<string, typeof Shield> = {
  shield: Shield, search: Search, globe: Globe, 'alert-triangle': AlertTriangle,
  radio: Radio, brain: Brain, mail: Mail, 'credit-card': CreditCard, plug: Plug,
}

const categoryColors: Record<string, string> = {
  'Threat Intelligence': 'text-accent-cyan',
  'AI & Analysis': 'text-purple-400',
  'Notifications': 'text-warning',
  'Billing': 'text-accent-green',
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [configuredCount, setConfiguredCount] = useState(0)

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await api.get('/integrations')
      setIntegrations(res.data.integrations ?? [])
      setConfiguredCount(res.data.configured_count ?? 0)
    } catch { toast.error('Failed to load integrations') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchIntegrations() }, [fetchIntegrations])

  const testConnection = async (id: string) => {
    setTestingId(id)
    try {
      const res = await api.post(`/integrations/${id}/test`)
      if (res.data.success) {
        toast.success(`${res.data.message}${res.data.response_time_ms ? ` (${res.data.response_time_ms}ms)` : ''}`)
      } else {
        toast.error(res.data.message || 'Connection test failed')
      }
    } catch { toast.error('Connection test failed') }
    finally { setTestingId(null) }
  }

  // Group by category
  const grouped = integrations.reduce<Record<string, Integration[]>>((acc, i) => {
    (acc[i.category] ??= []).push(i)
    return acc
  }, {})

  if (loading) return (
    <PageTransition>
      <Helmet><title>Integrations | LeakLens</title></Helmet>
      <div className="space-y-4"><Skeleton className="h-8 w-48" />{[1,2,3,4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
    </PageTransition>
  )

  return (
    <PageTransition>
      <Helmet><title>Integrations | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Integrations</h1>
          <p className="text-text-secondary mt-1">{configuredCount} of {integrations.length} integrations configured. Connect external services to enhance LeakLens capabilities.</p>
        </div>

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${categoryColors[category] || 'text-text-secondary'}`}>{category}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((integ, i) => {
                const Icon = iconMap[integ.icon] || Plug
                const isTesting = testingId === integ.id
                return (
                  <motion.div key={integ.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card variant="hover" padding="md" className="h-full">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${integ.configured ? 'bg-accent-green/10 text-accent-green' : 'bg-white/5 text-text-muted'}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-text-primary">{integ.name}</h3>
                            {integ.configured ? (
                              <Badge variant="success"><CheckCircle size={10} className="mr-1" />Connected</Badge>
                            ) : (
                              <Badge variant="default"><XCircle size={10} className="mr-1" />Not Configured</Badge>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mb-2 line-clamp-2">{integ.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {integ.capabilities.slice(0, 3).map(c => (
                              <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-muted">{c.replace(/_/g, ' ')}</span>
                            ))}
                            {integ.capabilities.length > 3 && <span className="text-[10px] text-text-muted">+{integ.capabilities.length - 3} more</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {integ.configured ? (
                              <Button variant="ghost" size="sm" onClick={() => testConnection(integ.id)} loading={isTesting} leftIcon={<Zap size={12} />} className="text-xs">Test Connection</Button>
                            ) : integ.setup_url ? (
                              <a href={integ.setup_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={12} />} className="text-xs">Get API Key</Button>
                              </a>
                            ) : (
                              <span className="text-xs text-text-muted">Configure in .env file</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  )
}
