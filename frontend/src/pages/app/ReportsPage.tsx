import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, FileJson, FileSpreadsheet, Filter } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import RiskBadge from '@/components/shared/RiskBadge'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import api from '@/lib/api'
import { formatDate, formatScore } from '@/lib/utils'
import type { AssessmentListItem, RiskLevel } from '@/types'

export default function ReportsPage() {
  const [items, setItems] = useState<AssessmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [scanType, setScanType] = useState('all')

  const fetchReports = async (type: string) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: 1, per_page: 100 }
      if (type !== 'all') params.scan_type = type
      const res = await api.get('/scans/history', { params })
      setItems(res.data?.items ?? res.data ?? [])
    } catch { setItems([]) }
    setLoading(false)
  }

  useEffect(() => { fetchReports(scanType) }, [scanType])

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

  const downloadCSV = () => {
    if (items.length === 0) { toast.error('No data to export'); return }
    const headers = ['Date', 'Type', 'Identifier', 'Risk Score', 'Risk Level', 'Exposures', 'Data Source', 'Summary']
    const rows = items.map(item => [
      item.created_at,
      item.scan_type,
      item.identifier_hint ?? '',
      String(item.risk_score),
      item.risk_level,
      String(item.exposure_count ?? 0),
      item.data_source ?? 'synthetic',
      (item.summary ?? '').replace(/,/g, ';').replace(/\n/g, ' '),
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `leaklens-reports-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success(`Exported ${items.length} reports as CSV`)
  }

  const downloadAllJSON = async () => {
    if (items.length === 0) { toast.error('No data to export'); return }
    const allDetails = []
    for (const item of items) {
      try {
        const res = await api.get(`/scans/${item.id}`)
        allDetails.push(res.data)
      } catch {
        allDetails.push({ id: item.id, error: 'Failed to fetch details' })
      }
    }
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), total_reports: allDetails.length, reports: allDetails }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `leaklens-full-export-${new Date().toISOString().split('T')[0]}.json`
    a.click(); URL.revokeObjectURL(url)
    toast.success(`Exported ${allDetails.length} full reports`)
  }

  return (
    <PageTransition>
      <Helmet><title>Reports | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Security Reports</h1>
            <p className="text-text-secondary mt-1">Download and review your security assessment reports.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select label="" options={[
              { value: 'all', label: 'All Types' },
              { value: 'email', label: 'Email' },
              { value: 'username', label: 'Username' },
              { value: 'domain', label: 'Domain' },
              { value: 'phishing', label: 'Phishing' },
            ]} value={scanType} onChange={e => setScanType(e.target.value)} />
            <Button variant="secondary" size="sm" leftIcon={<FileSpreadsheet size={14} />} onClick={downloadCSV} disabled={items.length === 0}>
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<FileJson size={14} />} onClick={downloadAllJSON} disabled={items.length === 0}>
              Export All JSON
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" height={140} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={FileText} title="No reports yet" description="Reports are generated from your scan results. Run a scan first." actionLabel="Run a Scan" onAction={() => window.location.href = '/app/email-scanner'} />
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card variant="stat" padding="md">
                <p className="text-sm text-text-secondary">Total Reports</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{items.length}</p>
              </Card>
              <Card variant="stat" padding="md">
                <p className="text-sm text-text-secondary">High/Critical</p>
                <p className="text-2xl font-bold text-danger mt-1">{items.filter(i => ['high', 'critical'].includes(i.risk_level)).length}</p>
              </Card>
              <Card variant="stat" padding="md">
                <p className="text-sm text-text-secondary">Scan Types</p>
                <p className="text-2xl font-bold text-accent-cyan mt-1">{new Set(items.map(i => i.scan_type)).size}</p>
              </Card>
              <Card variant="stat" padding="md">
                <p className="text-sm text-text-secondary">Avg Risk Score</p>
                <p className="text-2xl font-bold text-warning mt-1">{items.length > 0 ? (items.reduce((s, i) => s + i.risk_score, 0) / items.length).toFixed(1) : '0'}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
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
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={() => downloadJSON(item)}>JSON</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
