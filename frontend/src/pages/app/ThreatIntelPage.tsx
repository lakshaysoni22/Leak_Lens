import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Search, Server, AlertTriangle, CheckCircle, XCircle,
  Globe, Hash, Link2, ExternalLink, Info, MapPin, Wifi, Activity,
  Zap, Database, Radio, Eye, AlertOctagon, ShieldCheck, ShieldAlert,
  Navigation, Building2, Clock, TrendingUp
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import DataSourceBadge from '@/components/shared/DataSourceBadge'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'

/* ───────────────────────── Types ───────────────────────── */
interface ProviderInfo {
  name: string
  configured: boolean
  capabilities: string[]
  setup_url?: string
  description?: string
}

interface PulseInfo {
  name: string
  description?: string
  created?: string
  tags?: string[]
  adversary?: string
  targeted_countries?: string[]
}

interface ThreatResult {
  provider: string
  provider_name?: string
  match: boolean
  is_context?: boolean
  // URLhaus fields
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
  file_size?: number
  signature?: string
  firstseen?: string
  lastseen?: string
  // OTX fields
  pulse_count?: number
  reputation?: number
  pulses?: PulseInfo[]
  country_code?: string
  country_name?: string
  asn?: string | number
  city?: string
  alexa_rank?: string
  whois_info?: string
  // IPinfo / ip-api context fields
  hostname?: string
  region?: string
  country?: string
  latitude?: string
  longitude?: string
  org?: string
  postal?: string
  timezone?: string
  isp?: string
  as_number?: string
  as_name?: string
  reverse_dns?: string
  is_proxy?: boolean
  is_mobile?: boolean
  is_hosting?: boolean
  note?: string
  // DNSBL fields
  total_checked?: number
  listed_count?: number
  listings?: { blocklist: string; zone: string; listed: boolean }[]
  blocklists_checked?: string[]
  // AbuseIPDB fields
  abuse_confidence_score?: number
  total_reports?: number
  num_distinct_users?: number
  last_reported_at?: string
  is_whitelisted?: boolean
  is_tor?: boolean
  usage_type?: string
  domain?: string
  // VirusTotal fields
  malicious_detections?: number
  suspicious_detections?: number
  harmless?: number
  undetected?: number
  total_engines?: number
  network?: string
  as_owner?: string
  registrar?: string
  creation_date?: number
  categories?: Record<string, string>
  file_name?: string
  sha256?: string
  md5?: string
  first_submission?: number
  last_analysis?: number
  popular_threat_name?: string
}

interface RiskScore {
  score: number
  level: 'critical' | 'high' | 'medium' | 'low' | 'clean'
  factors: string[]
}

interface GeoLocation {
  city?: string
  region?: string
  country?: string
  country_code?: string
  latitude?: string
  longitude?: string
  timezone?: string
  postal?: string
}

interface NetworkInfo {
  hostname?: string
  org?: string
  isp?: string
  as_number?: string
  as_name?: string
  reverse_dns?: string
  is_proxy?: boolean
  is_mobile?: boolean
  is_hosting?: boolean
}

interface LookupResponse {
  ioc_type: string
  ioc_value: string
  risk_score: RiskScore
  results: ThreatResult[]
  threat_results: ThreatResult[]
  context_results: ThreatResult[]
  geolocation?: GeoLocation | null
  network_info?: NetworkInfo | null
  summary: string
  data_source: string
  queried_providers: string[]
  failed_providers: string[]
  total_providers_queried: number
  provider_status?: Record<string, ProviderInfo>
  queried_at: string
}

const iocTypes = [
  { value: 'ip', label: 'IP Address' },
  { value: 'domain', label: 'Domain' },
  { value: 'url', label: 'URL' },
  { value: 'hash', label: 'File Hash' },
]

const iocPlaceholders: Record<string, string> = {
  ip: '8.8.8.8',
  domain: 'example.com',
  url: 'https://suspicious-site.com/payload',
  hash: 'e3b0c44298fc1c149afbf4c8996fb924...',
}

const SCAN_STAGES = [
  { label: 'Initializing query...', duration: 400 },
  { label: 'Querying URLhaus...', duration: 600 },
  { label: 'Querying AlienVault OTX...', duration: 500 },
  { label: 'Checking DNSBL blocklists...', duration: 500 },
  { label: 'Fetching geolocation data...', duration: 400 },
  { label: 'Calculating risk score...', duration: 300 },
  { label: 'Compiling intelligence report...', duration: 300 },
]

/* ───────────────────────── Risk Score Gauge ───────────────────────── */
function RiskScoreGauge({ risk }: { risk: RiskScore }) {
  const colorMap: Record<string, { ring: string; text: string; bg: string; label: string }> = {
    critical: { ring: 'text-red-500', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'CRITICAL' },
    high: { ring: 'text-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'HIGH RISK' },
    medium: { ring: 'text-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'MEDIUM' },
    low: { ring: 'text-blue-400', text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', label: 'LOW RISK' },
    clean: { ring: 'text-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'CLEAN' },
  }
  const c = colorMap[risk.level] || colorMap.clean
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (risk.score / 100) * circumference

  return (
    <div className={`flex items-center gap-6 p-5 rounded-xl border ${c.bg}`}>
      {/* SVG Ring */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.06]" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
            className={c.ring}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${c.text}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            {risk.score}
          </motion.span>
          <span className="text-[10px] text-text-secondary">/100</span>
        </div>
      </div>
      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {risk.level === 'clean' ? <ShieldCheck size={18} className={c.text} /> : <ShieldAlert size={18} className={c.text} />}
          <span className={`text-sm font-bold uppercase tracking-wider ${c.text}`}>{c.label}</span>
        </div>
        {risk.factors.length > 0 ? (
          <ul className="space-y-1">
            {risk.factors.map((f, i) => (
              <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                <AlertTriangle size={10} className={`${c.text} mt-0.5 flex-shrink-0`} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-secondary">No threat indicators detected across all queried providers.</p>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── Geolocation Card ───────────────────────── */
function GeoLocationCard({ geo, network }: { geo: GeoLocation; network?: NetworkInfo | null }) {
  return (
    <Card variant="hover" padding="md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin size={18} className="text-accent-cyan" /> Geolocation & Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {geo.city && (
            <div>
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><Navigation size={10} /> City</p>
              <p className="text-sm font-medium text-text-primary">{geo.city}</p>
            </div>
          )}
          {geo.region && (
            <div>
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><MapPin size={10} /> Region</p>
              <p className="text-sm font-medium text-text-primary">{geo.region}</p>
            </div>
          )}
          {(geo.country || geo.country_code) && (
            <div>
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><Globe size={10} /> Country</p>
              <p className="text-sm font-medium text-text-primary">{geo.country || geo.country_code}</p>
            </div>
          )}
          {geo.timezone && (
            <div>
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><Clock size={10} /> Timezone</p>
              <p className="text-sm font-medium text-text-primary">{geo.timezone}</p>
            </div>
          )}
          {geo.latitude && geo.longitude && (
            <div>
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><MapPin size={10} /> Coordinates</p>
              <p className="text-sm font-mono text-text-primary">{geo.latitude}, {geo.longitude}</p>
            </div>
          )}
          {geo.postal && (
            <div>
              <p className="text-xs text-text-secondary mb-1">Postal</p>
              <p className="text-sm font-medium text-text-primary">{geo.postal}</p>
            </div>
          )}
        </div>

        {network && (
          <>
            <div className="border-t border-white/[0.06] my-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {network.isp && (
                <div>
                  <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><Building2 size={10} /> ISP</p>
                  <p className="text-sm font-medium text-text-primary">{network.isp}</p>
                </div>
              )}
              {network.org && (
                <div>
                  <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><Building2 size={10} /> Organization</p>
                  <p className="text-sm font-medium text-text-primary">{network.org}</p>
                </div>
              )}
              {network.as_name && (
                <div>
                  <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><Wifi size={10} /> AS Name</p>
                  <p className="text-sm font-medium text-text-primary">{network.as_name}</p>
                </div>
              )}
              {network.as_number && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">AS Number</p>
                  <p className="text-sm font-mono text-text-primary">{network.as_number}</p>
                </div>
              )}
              {network.hostname && (
                <div>
                  <p className="text-xs text-text-secondary mb-1 flex items-center gap-1"><Server size={10} /> Hostname</p>
                  <p className="text-sm font-mono text-text-primary break-all">{network.hostname}</p>
                </div>
              )}
              {network.reverse_dns && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Reverse DNS</p>
                  <p className="text-sm font-mono text-text-primary break-all">{network.reverse_dns}</p>
                </div>
              )}
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {network.is_proxy && (
                <Badge variant="warning">
                  <Eye size={12} className="mr-1" /> Proxy/VPN Detected
                </Badge>
              )}
              {network.is_hosting && (
                <Badge variant="info">
                  <Server size={12} className="mr-1" /> Hosting Provider
                </Badge>
              )}
              {network.is_mobile && (
                <Badge variant="info">
                  <Radio size={12} className="mr-1" /> Mobile Network
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── Provider Result Card ───────────────────────── */
function ProviderResultCard({ result }: { result: ThreatResult }) {
  const providerName = result.provider_name || result.provider.toUpperCase()

  // Don't render context-only results as separate cards (geo/network shown separately)
  if (result.is_context) return null

  const providerIcons: Record<string, React.ReactNode> = {
    urlhaus: <Database size={18} className="text-red-400" />,
    alienvault_otx: <Globe size={18} className="text-purple-400" />,
    dnsbl: <Shield size={18} className="text-yellow-400" />,
    abuseipdb: <AlertOctagon size={18} className="text-orange-400" />,
    virustotal: <Activity size={18} className="text-blue-400" />,
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="hover" padding="lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {providerIcons[result.provider] || <Server size={18} className="text-accent-purple" />}
            {providerName}
            {result.match ? (
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
              {result.threat_type && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Threat Type</p>
                  <p className="text-sm font-medium text-warning">{result.threat_type}</p>
                </div>
              )}
              {result.status && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Status</p>
                  <Badge variant={result.status === 'online' ? 'danger' : result.status === 'offline' ? 'success' : 'default'}>{result.status}</Badge>
                </div>
              )}
              {result.url_count !== undefined && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Total URLs</p>
                  <p className="text-sm font-bold text-text-primary">{result.url_count}</p>
                </div>
              )}
              {result.urls_online !== undefined && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">URLs Online</p>
                  <p className={`text-sm font-bold ${result.urls_online > 0 ? 'text-danger' : 'text-accent-green'}`}>{result.urls_online}</p>
                </div>
              )}
              {result.date_added && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Date Added</p>
                  <p className="text-sm text-text-primary">{result.date_added}</p>
                </div>
              )}
              {result.file_type && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">File Type</p>
                  <p className="text-sm text-text-primary">{result.file_type}</p>
                </div>
              )}
              {result.signature && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Signature</p>
                  <p className="text-sm font-medium text-warning">{result.signature}</p>
                </div>
              )}
              {result.firstseen && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">First Seen</p>
                  <p className="text-sm text-text-primary">{result.firstseen}</p>
                </div>
              )}

              {/* OTX fields */}
              {result.pulse_count !== undefined && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Threat Pulses</p>
                  <p className={`text-sm font-bold ${result.pulse_count > 0 ? 'text-warning' : 'text-accent-green'}`}>{result.pulse_count}</p>
                </div>
              )}
              {result.reputation !== undefined && result.provider === 'alienvault_otx' && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Reputation</p>
                  <p className="text-sm font-bold text-text-primary">{result.reputation}</p>
                </div>
              )}

              {/* DNSBL fields */}
              {result.listed_count !== undefined && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Listed In</p>
                  <p className={`text-sm font-bold ${result.listed_count > 0 ? 'text-danger' : 'text-accent-green'}`}>
                    {result.listed_count}/{result.total_checked} blocklists
                  </p>
                </div>
              )}

              {/* AbuseIPDB fields */}
              {result.abuse_confidence_score !== undefined && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Abuse Confidence</p>
                  <p className={`text-sm font-bold ${result.abuse_confidence_score > 50 ? 'text-danger' : result.abuse_confidence_score > 0 ? 'text-warning' : 'text-accent-green'}`}>
                    {result.abuse_confidence_score}%
                  </p>
                </div>
              )}
              {result.total_reports !== undefined && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Total Reports</p>
                  <p className="text-sm font-bold text-text-primary">{result.total_reports}</p>
                </div>
              )}
              {result.last_reported_at && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Last Reported</p>
                  <p className="text-sm text-text-primary">{new Date(result.last_reported_at).toLocaleDateString()}</p>
                </div>
              )}
              {result.is_tor && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Tor Exit Node</p>
                  <Badge variant="danger">Yes</Badge>
                </div>
              )}

              {/* VirusTotal fields */}
              {result.malicious_detections !== undefined && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Malicious</p>
                  <p className={`text-sm font-bold ${result.malicious_detections > 0 ? 'text-danger' : 'text-accent-green'}`}>
                    {result.malicious_detections}/{result.total_engines} engines
                  </p>
                </div>
              )}
              {result.suspicious_detections !== undefined && result.suspicious_detections > 0 && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Suspicious</p>
                  <p className="text-sm font-bold text-warning">{result.suspicious_detections} engines</p>
                </div>
              )}
              {result.popular_threat_name && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Threat Name</p>
                  <p className="text-sm font-medium text-danger">{result.popular_threat_name}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {result.tags && result.tags.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.tags.map((tag, i) => (
                    <Badge key={i} variant="warning">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* OTX Pulses */}
            {result.pulses && result.pulses.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-2">Threat Pulses ({result.pulses.length})</p>
                <div className="space-y-2">
                  {result.pulses.map((pulse, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <p className="text-sm font-medium text-text-primary">{pulse.name}</p>
                      {pulse.description && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{pulse.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {pulse.created && <span className="text-xs text-text-secondary">{new Date(pulse.created).toLocaleDateString()}</span>}
                        {pulse.adversary && <Badge variant="danger">{pulse.adversary}</Badge>}
                        {pulse.tags?.map((t, j) => <Badge key={j} variant="info">{t}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DNSBL Listings */}
            {result.listings && result.listings.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-2">Blocklist Detections</p>
                <div className="flex flex-wrap gap-2">
                  {result.listings.map((l, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <XCircle size={14} className="text-danger" />
                      <span className="text-sm text-danger font-semibold">{l.blocklist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blacklists (URLhaus) */}
            {result.blacklists && Object.keys(result.blacklists).length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-2">Blacklist Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.blacklists).map(([list, status]) => (
                    <div key={list} className="flex items-center gap-1.5">
                      {status === 'listed' ? <XCircle size={14} className="text-danger" /> : <CheckCircle size={14} className="text-accent-green" />}
                      <span className="text-sm text-text-primary">{list}: <span className={status === 'listed' ? 'text-danger font-semibold' : 'text-accent-green'}>{status}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent URLs (URLhaus) */}
            {result.recent_urls && result.recent_urls.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-2">Recent Malicious URLs ({result.recent_urls.length})</p>
                <div className="space-y-2">
                  {result.recent_urls.map((u, i) => (
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
            {result.reference && (
              <a href={result.reference} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent-cyan hover:underline">
                View Full Report <ExternalLink size={14} />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ───────────────────────── Clean IOC Result ───────────────────────── */
function CleanIOCResult({ result }: { result: LookupResponse }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card variant="hover" padding="lg">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck size={36} className="text-emerald-400" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-emerald-400 mb-2">All Clear — No Threats Detected</h3>
          <p className="text-sm text-text-secondary max-w-lg mx-auto">
            <span className="font-mono text-text-primary">{result.ioc_value}</span> was not found in any
            of the {result.total_providers_queried} intelligence provider(s) queried. No threat indicators,
            blocklist entries, or malicious activity associated with this {iocTypes.find(t => t.value === result.ioc_type)?.label?.toLowerCase() || 'indicator'}.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="success">Score: {result.risk_score.score}/100</Badge>
            <Badge variant="info">{result.total_providers_queried} Providers Queried</Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ThreatIntelPage() {
  const [iocType, setIocType] = useState('ip')
  const [iocValue, setIocValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanStage, setScanStage] = useState(0)
  const [providers, setProviders] = useState<Record<string, ProviderInfo>>({})
  const [providersLoaded, setProvidersLoaded] = useState(false)
  const [result, setResult] = useState<LookupResponse | null>(null)
  const [dataSource, setDataSource] = useState<string>('live_intelligence')

  useEffect(() => {
    api.get('/threat-intel/providers')
      .then(res => {
        setProviders(res.data?.providers ?? {})
        if (res.data?.data_source) setDataSource(res.data.data_source)
        setProvidersLoaded(true)
      })
      .catch(() => setProvidersLoaded(true))
  }, [])

  // Scan stage animation
  useEffect(() => {
    if (!loading) return
    let stage = 0
    setScanStage(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    let cumulative = 0
    for (let i = 0; i < SCAN_STAGES.length; i++) {
      cumulative += SCAN_STAGES[i].duration
      timers.push(setTimeout(() => setScanStage(i + 1), cumulative))
    }
    return () => timers.forEach(clearTimeout)
  }, [loading])

  const handleLookup = async () => {
    if (!iocValue.trim()) { toast.error('Enter a value to look up'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/threat-intel/lookup', { ioc_type: iocType, ioc_value: iocValue.trim() })
      setResult(res.data)
      if (res.data?.data_source) setDataSource(res.data.data_source)
      // Update providers from result if available
      if (res.data?.provider_status) setProviders(res.data.provider_status)

      const riskLevel = res.data?.risk_score?.level
      if (riskLevel === 'critical' || riskLevel === 'high') {
        toast.error(`${riskLevel === 'critical' ? '🔴' : '🟠'} ${riskLevel.toUpperCase()} threat level detected!`)
      } else if (riskLevel === 'clean') {
        toast.success('✅ No threats detected — All clear!')
      } else {
        toast.success('Intelligence lookup complete')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Intelligence lookup failed — all providers unreachable'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const providerList = Object.entries(providers).map(([key, p]) => ({ key, ...p }))
  const activeProviders = providerList.filter(p => p.configured)
  const hasThreats = result ? result.threat_results.some(r => r.match) : false
  const hasThreatResults = result && result.threat_results.length > 0

  return (
    <PageTransition>
      <Helmet><title>Threat Intelligence | LeakLens</title></Helmet>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20">
                <Shield size={24} className="text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Threat Intelligence Engine</h1>
                <p className="text-text-secondary text-sm">Multi-source IOC lookup across {activeProviders.length}+ live intelligence providers</p>
              </div>
            </div>
          </div>
          <DataSourceBadge dataSource={dataSource} />
        </div>

        {/* IOC Lookup */}
        <Card variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} className="text-accent-cyan" /> IOC Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Query IP addresses, domains, URLs, and file hashes against real-time threat intelligence feeds
              and blocklist databases.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select label="IOC TYPE" options={iocTypes} value={iocType} onChange={e => setIocType(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Value</label>
                <input
                  className="input-field"
                  placeholder={iocPlaceholders[iocType] || 'Enter IOC value...'}
                  value={iocValue}
                  onChange={e => setIocValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  disabled={loading}
                />
              </div>
              <div className="flex items-end">
                <Button loading={loading} onClick={handleLookup} leftIcon={<Search size={16} />}>
                  Lookup
                </Button>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-text-secondary mt-3 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent-green" />
              Live intelligence: Queries are sent to real OSINT providers. No data is stored beyond this session.
            </p>
          </CardContent>
        </Card>

        {/* Scanning Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card variant="hover" padding="lg">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-accent-cyan/30 border-t-accent-cyan animate-spin" />
                    <Zap size={16} className="absolute inset-0 m-auto text-accent-cyan" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {SCAN_STAGES[Math.min(scanStage, SCAN_STAGES.length - 1)]?.label}
                    </p>
                    <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min(((scanStage + 1) / SCAN_STAGES.length) * 100, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Stage {Math.min(scanStage + 1, SCAN_STAGES.length)} of {SCAN_STAGES.length}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Summary Banner */}
            <Card variant="hover" padding="md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {result.ioc_type === 'ip' && <Server size={18} className="text-accent-purple" />}
                  {result.ioc_type === 'domain' && <Globe size={18} className="text-accent-purple" />}
                  {result.ioc_type === 'url' && <Link2 size={18} className="text-accent-purple" />}
                  {result.ioc_type === 'hash' && <Hash size={18} className="text-accent-purple" />}
                  <div>
                    <p className="text-sm text-text-secondary">
                      Queried: <span className="font-mono text-text-primary">{result.ioc_value}</span>
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Type: {iocTypes.find(t => t.value === result.ioc_type)?.label} ·{' '}
                      {new Date(result.queried_at).toLocaleString()} ·{' '}
                      {result.total_providers_queried} provider(s) queried
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {result.queried_providers.map(p => (
                    <Badge key={p} variant="info">{p}</Badge>
                  ))}
                  {result.failed_providers.length > 0 && result.failed_providers.map(p => (
                    <Badge key={p} variant="warning">{p} (failed)</Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Risk Score Gauge */}
            <RiskScoreGauge risk={result.risk_score} />

            {/* Geolocation & Network (for IP lookups) */}
            {result.geolocation && (
              <GeoLocationCard geo={result.geolocation} network={result.network_info} />
            )}

            {/* Threat Provider Results */}
            {hasThreatResults && result.threat_results.some(r => r.match) ? (
              result.threat_results.filter(r => !r.is_context).map((r, idx) => (
                <ProviderResultCard key={idx} result={r} />
              ))
            ) : hasThreatResults ? (
              // Show all provider cards even when clean, so user sees each provider confirmed clean
              result.threat_results.filter(r => !r.is_context).map((r, idx) => (
                <ProviderResultCard key={idx} result={r} />
              ))
            ) : (
              <CleanIOCResult result={result} />
            )}

            {/* If NO threat results at all (all failed or only context) and risk is clean */}
            {!hasThreatResults && <CleanIOCResult result={result} />}
          </motion.div>
        )}

        {/* Intelligence Providers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Database size={18} className="text-accent-purple" /> Intelligence Providers
            </h2>
            {providersLoaded && (
              <span className="text-xs text-text-secondary">
                {activeProviders.length} active / {providerList.length} total
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {providerList.map((p, i) => (
              <motion.div key={p.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card variant="hover" padding="md" className="h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Server size={16} className={p.configured ? 'text-accent-green' : 'text-text-secondary'} />
                      <span className="font-semibold text-text-primary text-sm">{p.name}</span>
                    </div>
                    <Badge variant={p.configured ? 'success' : 'warning'} className="text-[10px]">
                      {p.configured ? 'Active' : 'Key Required'}
                    </Badge>
                  </div>
                  {p.description && (
                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.capabilities?.map(cap => (
                      <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-secondary">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  {!p.configured && p.setup_url && (
                    <a href={p.setup_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-cyan hover:underline flex items-center gap-1 mt-1">
                      Get API Key <ExternalLink size={10} />
                    </a>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        {!result && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="hover" padding="md">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Zap size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Multi-Provider Correlation</h3>
                    <p className="text-xs text-text-secondary">
                      Queries URLhaus, AlienVault OTX, DNSBL blocklists, and more in parallel for comprehensive coverage.
                    </p>
                  </div>
                </div>
              </Card>
              <Card variant="hover" padding="md">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <TrendingUp size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Aggregate Risk Scoring</h3>
                    <p className="text-xs text-text-secondary">
                      Calculates a composite 0-100 risk score from all provider signals with factor analysis.
                    </p>
                  </div>
                </div>
              </Card>
              <Card variant="hover" padding="md">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <MapPin size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">IP Enrichment & Geolocation</h3>
                    <p className="text-xs text-text-secondary">
                      Enriches IP lookups with geolocation, ISP data, proxy/VPN detection, and reverse DNS.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <EmptyState icon={Shield} title="No results yet" description="Enter an indicator of compromise above to search live threat intelligence databases." />
          </>
        )}
      </div>
    </PageTransition>
  )
}
