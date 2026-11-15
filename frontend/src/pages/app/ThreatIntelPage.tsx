import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, Server, AlertTriangle, CheckCircle, XCircle, Globe, Hash, Link2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'

interface Provider { name: string; configured: boolean; description: string }

const iocTypes = [
  { value: 'ip', label: 'IP Address' },
  { value: 'domain', label: 'Domain' },
  { value: 'url', label: 'URL' },
  { value: 'hash', label: 'File Hash' },
]

const iocIcons: Record<string, React.ReactNode> = {
  ip: <Server size={16} />, domain: <Globe size={16} />,
  url: <Link2 size={16} />, hash: <Hash size={16} />,
}

export default function ThreatIntelPage() {
  const [iocType, setIocType] = useState('ip')
  const [iocValue, setIocValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [providersLoaded, setProvidersLoaded] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const loadProviders = async () => {
    if (providersLoaded) return
    try {
      const res = await api.get('/threat-intel/providers')
      setProviders(res.data?.providers ?? res.data ?? [])
      setProvidersLoaded(true)
    } catch { setProviders([]); setProvidersLoaded(true) }
  }

  useState(() => { loadProviders() })

  const handleLookup = async () => {
    if (!iocValue.trim()) { toast.error('Enter a value to look up'); return }
    setLoading(true); setResult(null)
    try {
      const res = await api.post('/threat-intel/lookup', { ioc_type: iocType, ioc_value: iocValue.trim() })
      setResult(res.data)
      toast.success('Lookup complete')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Lookup failed'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <PageTransition>
      <Helmet><title>Threat Intelligence | LeakLens</title></Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Threat Intelligence</h1>
          <p className="text-text-secondary mt-1">Look up indicators of compromise across multiple intelligence sources.</p>
        </div>

        {/* IOC Lookup */}
        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield size={20} className="text-accent-cyan" /> IOC Lookup</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select label="IOC Type" options={iocTypes} value={iocType} onChange={e => setIocType(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Value</label>
                <input className="input-field" placeholder={iocType === 'ip' ? '192.168.1.1' : iocType === 'domain' ? 'example.com' : iocType === 'url' ? 'https://suspicious.com' : 'sha256hash...'} value={iocValue} onChange={e => setIocValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLookup()} />
              </div>
              <div className="flex items-end">
                <Button loading={loading} onClick={handleLookup} leftIcon={<Search size={16} />}>Lookup</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Providers */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Intelligence Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(providers.length > 0 ? providers : [
              { name: 'VirusTotal', configured: false, description: 'Comprehensive threat intelligence from VirusTotal API' },
              { name: 'AbuseIPDB', configured: false, description: 'IP address abuse reports and threat scoring' },
              { name: 'AlienVault OTX', configured: false, description: 'Open Threat Exchange pulse data' },
            ]).map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card variant="hover" padding="md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server size={18} className="text-accent-purple" />
                      <span className="font-semibold text-text-primary">{p.name}</span>
                    </div>
                    <Badge variant={p.configured ? 'success' : 'warning'}>{p.configured ? 'Active' : 'Not Configured'}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary">{p.description}</p>
                  {!p.configured && <p className="text-xs text-warning mt-2 flex items-center gap-1"><AlertTriangle size={12} /> Configure API key in .env</p>}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="hover" padding="lg">
              <CardHeader><CardTitle className="flex items-center gap-2">{iocIcons[iocType]} Lookup Results</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-bg-primary rounded-xl p-4 overflow-auto">
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!result && !loading && (
          <EmptyState icon={Shield} title="No results yet" description="Enter an indicator of compromise above to search threat intelligence databases." />
        )}
      </div>
    </PageTransition>
  )
}
