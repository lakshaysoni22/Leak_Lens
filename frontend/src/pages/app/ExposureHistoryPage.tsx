import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import RiskBadge from '@/components/shared/RiskBadge'
import DataSourceBadge from '@/components/shared/DataSourceBadge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'
import { formatDateTime, formatScore } from '@/lib/utils'
import type { AssessmentListItem, DataSource, RiskLevel, ScanType } from '@/types'

export default function ExposureHistoryPage() {
  const [items, setItems] = useState<AssessmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [scanType, setScanType] = useState('all')

  const fetchHistory = async (p: number, type: string) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: p, per_page: 15 }
      if (type !== 'all') params.scan_type = type
      const res = await api.get('/scans/history', { params })
      const data = res.data
      setItems(data.items ?? data ?? [])
      setTotalPages(data.total_pages ?? 1)
    } catch { setItems([]) }
    setLoading(false)
  }

  useEffect(() => { fetchHistory(page, scanType) }, [page, scanType])

  return (
    <PageTransition>
      <Helmet><title>Exposure History | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Exposure History</h1>
            <p className="text-text-secondary mt-1">View all your past security assessments.</p>
          </div>
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-text-secondary" />
            <Select label="" options={[{ value: 'all', label: 'All Types' }, { value: 'email', label: 'Email' }, { value: 'username', label: 'Username' }, { value: 'domain', label: 'Domain' }]} value={scanType} onChange={e => { setScanType(e.target.value); setPage(1) }} />
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
                      <motion.tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
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
              <p className="text-sm text-text-secondary">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} leftIcon={<ChevronLeft size={14} />}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} rightIcon={<ChevronRight size={14} />}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
