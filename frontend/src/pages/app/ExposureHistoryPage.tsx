import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ChevronLeft, ChevronRight, Filter, X, FileText, AlertTriangle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import RiskBadge from '@/components/shared/RiskBadge'
import DataSourceBadge from '@/components/shared/DataSourceBadge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import api from '@/lib/api'
import { formatDateTime, formatScore } from '@/lib/utils'
import type { AssessmentListItem, DataSource, RiskLevel, ScanType } from '@/types'

interface AssessmentDetail {
  id: string
  scan_type: string
  identifier_hint: string
  risk_score: number
  risk_level: string
  exposure_count: number
  data_source: string
  data_notice: string
  summary: string
  recommendations: string[]
  raw_result: Record<string, unknown>
  created_at: string
}

const fallbackHistory: AssessmentListItem[] = [
  {
    id: 'scan-01',
    scan_type: 'email',
    identifier_hint: 'lakshaysoni@gmail.com',
    risk_score: 78,
    risk_level: 'high',
    exposure_count: 3,
    data_source: 'synthetic',
    summary: 'Found 3 data breach exposures associated with credential leaks from 2021-2024.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'scan-02',
    scan_type: 'domain',
    identifier_hint: 'auth-gateway.io',
    risk_score: 62,
    risk_level: 'high',
    exposure_count: 1,
    data_source: 'synthetic',
    summary: 'Missing DMARC enforcement and weak SPF record detected.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'scan-03',
    scan_type: 'username',
    identifier_hint: 'lakshaysoni22',
    risk_score: 25,
    risk_level: 'low',
    exposure_count: 0,
    data_source: 'synthetic',
    summary: 'Username tracked across 8 developer platforms. Zero compromised passwords detected.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'scan-04',
    scan_type: 'phishing',
    identifier_hint: 'https://paypa1-security-verify.net',
    risk_score: 95,
    risk_level: 'critical',
    exposure_count: 5,
    data_source: 'synthetic',
    summary: 'Known homoglyph domain impersonating PayPal login infrastructure.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'scan-05',
    scan_type: 'email',
    identifier_hint: 'security-team@enterprise.corp',
    risk_score: 45,
    risk_level: 'medium',
    exposure_count: 2,
    data_source: 'synthetic',
    summary: '2 historical marketing vendor leaks detected. No active password hashes.',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'scan-06',
    scan_type: 'domain',
    identifier_hint: 'api.defense-ops.com',
    risk_score: 18,
    risk_level: 'low',
    exposure_count: 0,
    data_source: 'synthetic',
    summary: 'TLS 1.3 enforced, HSTS preload enabled, strict CSP headers active.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'scan-07',
    scan_type: 'phishing',
    identifier_hint: 'https://secure-login-microsofft.com',
    risk_score: 88,
    risk_level: 'critical',
    exposure_count: 4,
    data_source: 'synthetic',
    summary: 'Typosquatting domain targeting Microsoft 365 enterprise SSO users.',
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'scan-08',
    scan_type: 'username',
    identifier_hint: 'admin_root',
    risk_score: 85,
    risk_level: 'critical',
    exposure_count: 12,
    data_source: 'synthetic',
    summary: 'High-value default username detected in multiple dark web brute-force combo lists.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export default function ExposureHistoryPage() {
  const [items, setItems] = useState<AssessmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [scanType, setScanType] = useState('all')
  const [selectedItem, setSelectedItem] = useState<AssessmentDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchHistory = async (p: number, type: string) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: p, per_page: 15 }
      if (type !== 'all') params.scan_type = type
      const res = await api.get('/scans/history', { params })
      const data = res.data
      const list = data.items ?? data ?? []
      if (Array.isArray(list) && list.length > 0) {
        setItems(list)
        setTotalPages(data.total_pages ?? 1)
        setTotal(data.total ?? list.length)
      } else {
        const filtered = type === 'all' ? fallbackHistory : fallbackHistory.filter(i => i.scan_type === type)
        setItems(filtered)
        setTotalPages(1)
        setTotal(filtered.length)
      }
    } catch {
      const filtered = type === 'all' ? fallbackHistory : fallbackHistory.filter(i => i.scan_type === type)
      setItems(filtered)
      setTotalPages(1)
      setTotal(filtered.length)
    }
    setLoading(false)
  }

  useEffect(() => { fetchHistory(page, scanType) }, [page, scanType])

  const openDetail = async (item: AssessmentListItem) => {
    setShowDetailModal(true)
    setDetailLoading(true)
    try {
      const res = await api.get(`/scans/${item.id}`)
      setSelectedItem(res.data)
    } catch {
      // Fallback detail representation from the clicked item
      setSelectedItem({
        id: item.id,
        scan_type: item.scan_type,
        identifier_hint: item.identifier_hint,
        risk_score: item.risk_score,
        risk_level: item.risk_level,
        exposure_count: item.exposure_count,
        data_source: item.data_source,
        data_notice: 'Synthetic cybersecurity intelligence dataset',
        summary: item.summary,
        recommendations: [
          'Rotate credentials across all affected accounts immediately',
          'Enable FIDO2 / WebAuthn hardware-based multi-factor authentication',
          'Audit domain DNS and enforce strict DMARC, DKIM, and SPF protocols',
          'Monitor dark web paste sites for recurring identifier disclosures',
        ],
        raw_result: {
          target: item.identifier_hint,
          scan_type: item.scan_type,
          timestamp: item.created_at,
          threat_indicators: {
            breach_database_matches: item.exposure_count,
            severity_index: item.risk_score,
            threat_actor_attribution: 'Global OSINT / Threat intel repository match',
          },
          status: 'verified',
        },
        created_at: item.created_at,
      })
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <PageTransition>
      <Helmet><title>Exposure History | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Exposure History</h1>
            <p className="text-text-secondary mt-1">View all your past security assessments. {total > 0 && <span className="text-text-primary font-medium">{total} total</span>}</p>
          </div>
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-text-secondary" />
            <Select label="" options={[
              { value: 'all', label: 'All Types' },
              { value: 'email', label: 'Email' },
              { value: 'username', label: 'Username' },
              { value: 'domain', label: 'Domain' },
              { value: 'phishing', label: 'Phishing' },
            ]} value={scanType} onChange={e => { setScanType(e.target.value); setPage(1) }} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rect" height={64} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={History} title="No scan history" description="Your assessment history will appear here after running scans." actionLabel="Run First Scan" onAction={() => window.location.href = '/app/email-scanner'} />
        ) : (
          <>
            <Card variant="default" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Date', 'Type', 'Identifier', 'Risk Score', 'Risk Level', 'Data Source'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <motion.tr
                        key={item.id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-pointer"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        onClick={() => openDetail(item)}
                      >
                        <td className="px-4 py-3 text-sm text-text-secondary">{formatDateTime(item.created_at)}</td>
                        <td className="px-4 py-3"><Badge variant="info">{(item.scan_type as ScanType).toUpperCase()}</Badge></td>
                        <td className="px-4 py-3 text-sm text-text-primary font-mono">{item.identifier_hint ?? '—'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-text-primary">{formatScore(item.risk_score)}</td>
                        <td className="px-4 py-3"><RiskBadge level={item.risk_level as RiskLevel} /></td>
                        <td className="px-4 py-3"><DataSourceBadge dataSource={item.data_source as DataSource} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">Page {page} of {totalPages} · {total} results</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} leftIcon={<ChevronLeft size={14} />}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} rightIcon={<ChevronRight size={14} />}>Next</Button>
              </div>
            </div>
          </>
        )}

        {/* Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedItem(null) }} title="Assessment Details" size="lg">
          {detailLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton variant="rect" height={20} />
              <Skeleton variant="rect" height={20} />
              <Skeleton variant="rect" height={80} />
            </div>
          ) : selectedItem ? (
            <div className="space-y-5">
              {/* Header info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="info">{selectedItem.scan_type.toUpperCase()}</Badge>
                    <RiskBadge level={selectedItem.risk_level as RiskLevel} />
                  </div>
                  <p className="font-mono text-text-primary text-lg">{selectedItem.identifier_hint}</p>
                  <p className="text-xs text-text-secondary mt-1">{formatDateTime(selectedItem.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Risk Score</p>
                  <p className="text-3xl font-bold text-text-primary">{formatScore(selectedItem.risk_score)}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p className="text-sm text-text-primary">{selectedItem.summary}</p>
              </div>

              {/* Data Notice */}
              {selectedItem.data_notice && (
                <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                  <p className="text-xs text-accent-cyan flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {selectedItem.data_notice}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {selectedItem.recommendations && selectedItem.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Recommendations</h3>
                  <ul className="space-y-1.5">
                    {selectedItem.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-accent-green mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Raw Result (collapsible) */}
              {selectedItem.raw_result && Object.keys(selectedItem.raw_result).length > 0 && (
                <details className="group">
                  <summary className="text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-cyan transition-colors">
                    Raw Scan Data ▸
                  </summary>
                  <div className="mt-2 p-3 rounded-lg bg-bg-primary overflow-auto max-h-64">
                    <pre className="text-xs text-text-secondary whitespace-pre-wrap">{JSON.stringify(selectedItem.raw_result, null, 2)}</pre>
                  </div>
                </details>
              )}
            </div>
          ) : null}
        </Modal>
      </div>
    </PageTransition>
  )
}
