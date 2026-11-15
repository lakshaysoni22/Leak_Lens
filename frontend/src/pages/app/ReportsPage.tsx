import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Filter } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import RiskBadge from '@/components/shared/RiskBadge'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import api from '@/lib/api'
import { formatDate, formatScore } from '@/lib/utils'
import type { AssessmentListItem, RiskLevel } from '@/types'

export default function ReportsPage() {
  const [items, setItems] = useState<AssessmentListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/scans/history', { params: { page: 1, per_page: 50 } })
      .then(r => setItems(r.data?.items ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const downloadJSON = async (item: AssessmentListItem) => {
    try {
      const res = await api.get(`/scans/${item.id}`)
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `leaklens-report-${item.scan_type}-${item.id.slice(0, 8)}.json`
      a.click(); URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch { toast.error('Failed to download report') }
  }

  return (
    <PageTransition>
      <Helmet><title>Reports | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Security Reports</h1>
          <p className="text-text-secondary mt-1">Download and review your security assessment reports.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" height={140} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={FileText} title="No reports yet" description="Reports are generated from your scan results. Run a scan first." actionLabel="Run a Scan" onAction={() => window.location.href = '/app/email-scanner'} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card variant="hover" padding="md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-accent-cyan" />
                      <Badge variant="info">{item.scan_type.toUpperCase()}</Badge>
                    </div>
                    <RiskBadge level={item.risk_level as RiskLevel} />
                  </div>
                  <p className="text-sm text-text-primary font-mono mb-1">{item.identifier_hint ?? 'N/A'}</p>
                  <p className="text-xs text-text-secondary mb-3">Score: {formatScore(item.risk_score)} · {formatDate(item.created_at)}</p>
                  <p className="text-xs text-text-secondary mb-4 line-clamp-2">{item.summary}</p>
                  <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={() => downloadJSON(item)}>Download JSON</Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
