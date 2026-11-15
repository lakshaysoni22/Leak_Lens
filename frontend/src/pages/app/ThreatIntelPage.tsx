import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, Server, AlertTriangle, CheckCircle, XCircle, Globe, Hash, Link2, ExternalLink, Info } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'

interface ProviderInfo {
  name: string
  configured: boolean
  capabilities: string[]
  setup_url?: string
}

interface ThreatResult {
  provider: string
  match: boolean
  threat_type?: string
  status?: string
  date_added?: string
  tags?: string[]
  reference?: string
  url_count?: number
  urls_online?: number
  blacklists?: Record<string, string>
  recent_urls?: { url: string; status: string; threat: string; date_added: string; tags: string[] }[]
  file_type?: string
  signature?: string
  firstseen?: string
  lastseen?: string
}

interface LookupResponse {
  ioc_type: string
  ioc_value: string
  results: ThreatResult[]
  summary: string
  data_notice: string
  queried_providers?: string[]
  provider_status?: Record<string, ProviderInfo>
  queried_at: string
}

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
  const [providers, setProviders] = useState<Record<string, ProviderInfo>>({})
  const [providersLoaded, setProvidersLoaded] = useState(false)
  const [result, setResult] = useState<LookupResponse | null>(null)

  useEffect(() => {
    api.get('/threat-intel/providers')
      .then(res => {
        setProviders(res.data?.providers ?? {})
        setProvidersLoaded(true)
      })
      .catch(() => setProvidersLoaded(true))
  }, [])

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

  const providerList = Object.entries(providers).map(([key, p]) => ({ key, ...p }))

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
                <input className="input-field" placeholder={iocType === 'ip' ? '8.8.8.8' : iocType === 'domain' ? 'example.com' : iocType === 'url' ? 'https://suspicious.com/payload' : 'sha256hash...'} value={iocValue} onChange={e => setIocValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLookup()} />
              </div>
              <div className="flex items-end">
                <Button loading={loading} onClick={handleLookup} leftIcon={<Search size={16} />}>Lookup</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary Banner */}
            <Card variant="hover" padding="md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {iocIcons[result.ioc_type]}
                  <div>
                    <p className="text-sm text-text-secondary">Queried: <span className="font-mono text-text-primary">{result.ioc_value}</span></p>
                    <p className="text-xs text-text-secondary mt-0.5">Type: {iocTypes.find(t => t.value === result.ioc_type)?.label} · {new Date(result.queried_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.queried_providers?.map(p => (
                    <Badge key={p} variant="info">{p}</Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Summary */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <p className="text-sm text-text-primary whitespace-pre-wrap">{result.summary}</p>
              {result.data_notice && <p className="text-xs text-text-secondary mt-2 flex items-center gap-1"><Info size={12} /> {result.data_notice}</p>}
            </div>

            {/* Detailed Results */}
            {result.results.map((r, idx) => (
              <Card key={idx} variant="hover" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server size={18} className="text-accent-purple" />
                    {r.provider.toUpperCase()} Results
                    {r.match ? (
                      <Badge variant="danger">⚠ Threat Found</Badge>
                    ) : (
                      <Badge variant="success">✓ Clean</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Key details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {r.threat_type && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Threat Type</p>
                          <p className="text-sm font-medium text-warning">{r.threat_type}</p>
                        </div>
                      )}
                      {r.status && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Status</p>
                          <Badge variant={r.status === 'online' ? 'danger' : r.status === 'offline' ? 'success' : 'default'}>{r.status}</Badge>
                        </div>
                      )}
                      {r.url_count !== undefined && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Total URLs</p>
                          <p className="text-sm font-bold text-text-primary">{r.url_count}</p>
                        </div>
                      )}
                      {r.urls_online !== undefined && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">URLs Online</p>
                          <p className={`text-sm font-bold ${r.urls_online > 0 ? 'text-danger' : 'text-accent-green'}`}>{r.urls_online}</p>
                        </div>
                      )}
                      {r.date_added && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Date Added</p>
                          <p className="text-sm text-text-primary">{r.date_added}</p>
                        </div>
                      )}
                      {r.file_type && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">File Type</p>
                          <p className="text-sm text-text-primary">{r.file_type}</p>
                        </div>
                      )}
                      {r.signature && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Signature</p>
                          <p className="text-sm font-medium text-warning">{r.signature}</p>
                        </div>
                      )}
                      {r.firstseen && (
                        <div>
                          <p className="text-xs text-text-secondary mb-1">First Seen</p>
                          <p className="text-sm text-text-primary">{r.firstseen}</p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {r.tags && r.tags.length > 0 && (
                      <div>
                        <p className="text-xs text-text-secondary mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.tags.map((tag, i) => (
                            <Badge key={i} variant="warning">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blacklists */}
                    {r.blacklists && Object.keys(r.blacklists).length > 0 && (
                      <div>
                        <p className="text-xs text-text-secondary mb-2">Blacklist Status</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(r.blacklists).map(([list, status]) => (
                            <div key={list} className="flex items-center gap-1.5">
                              {status === 'listed' ? <XCircle size={14} className="text-danger" /> : <CheckCircle size={14} className="text-accent-green" />}
                              <span className="text-sm text-text-primary">{list}: <span className={status === 'listed' ? 'text-danger font-semibold' : 'text-accent-green'}>{status}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent URLs */}
                    {r.recent_urls && r.recent_urls.length > 0 && (
                      <div>
                        <p className="text-xs text-text-secondary mb-2">Recent Malicious URLs ({r.recent_urls.length})</p>
                        <div className="space-y-2">
                          {r.recent_urls.map((u, i) => (
                            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                              <p className="text-xs font-mono text-text-primary break-all">{u.url}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <Badge variant={u.status === 'online' ? 'danger' : 'default'}>{u.status}</Badge>
                                {u.threat && <span className="text-xs text-warning">{u.threat}</span>}
                                {u.date_added && <span className="text-xs text-text-secondary">{u.date_added}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reference link */}
                    {r.reference && (
                      <a href={r.reference} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent-cyan hover:underline">
                        View Full Report <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {result.results.length === 0 && (
              <Card variant="hover" padding="lg">
                <div className="text-center py-6">
                  <CheckCircle size={40} className="text-accent-green mx-auto mb-3" />
                  <p className="text-text-primary font-semibold">No Threats Found</p>
                  <p className="text-sm text-text-secondary mt-1">This indicator was not found in any queried threat databases.</p>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Providers */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Intelligence Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(providerList.length > 0 ? providerList : [
              { key: 'urlhaus', name: 'URLhaus (Abuse.ch)', configured: true, capabilities: ['malware_urls', 'phishing_urls'], setup_url: 'https://urlhaus-api.abuse.ch/' },
              { key: 'virustotal', name: 'VirusTotal', configured: false, capabilities: ['url_scan', 'file_hash', 'domain_reputation'], setup_url: 'https://www.virustotal.com/gui/join-us' },
              { key: 'abuseipdb', name: 'AbuseIPDB', configured: false, capabilities: ['ip_reputation', 'abuse_reports'], setup_url: 'https://www.abuseipdb.com/api' },
            ]).map((p, i) => (
              <motion.div key={p.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card variant="hover" padding="md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server size={18} className="text-accent-purple" />
                      <span className="font-semibold text-text-primary">{p.name}</span>
                    </div>
                    <Badge variant={p.configured ? 'success' : 'warning'}>{p.configured ? 'Active' : 'Not Configured'}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.capabilities?.map(cap => (
                      <span key={cap} className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-text-secondary">{cap.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                  {!p.configured && p.setup_url && (
                    <a href={p.setup_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-cyan hover:underline flex items-center gap-1 mt-2">
                      Get API Key <ExternalLink size={10} />
                    </a>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {!result && !loading && (
          <EmptyState icon={Shield} title="No results yet" description="Enter an indicator of compromise above to search threat intelligence databases." />
        )}
      </div>
    </PageTransition>
  )
}
