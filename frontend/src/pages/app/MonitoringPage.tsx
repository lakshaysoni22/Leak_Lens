import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Plus, Trash2, Play, Pause, RefreshCw, Mail, Globe, Hash, Search, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import api from '@/lib/api'

interface MonitorJob {
  id: string
  job_type: string
  target: string
  frequency: string
  is_active: boolean
  last_run: string | null
  next_run: string | null
  alert_threshold: string
  run_count: number
  results: { last_risk_level?: string; last_exposure_count?: number } | null
  created_at: string
}

const typeIcons: Record<string, typeof Mail> = { email: Mail, domain: Globe, keyword: Hash, username: Search }
const freqLabels: Record<string, string> = { hourly: 'Every Hour', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

export default function MonitoringPage() {
  const [jobs, setJobs] = useState<MonitorJob[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newTarget, setNewTarget] = useState('')
  const [newType, setNewType] = useState('email')
  const [newFreq, setNewFreq] = useState('daily')
  const [creating, setCreating] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get('/monitoring')
      setJobs(res.data.jobs ?? [])
    } catch { toast.error('Failed to load monitors') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const createJob = async () => {
    if (!newTarget.trim()) { toast.error('Target is required'); return }
    setCreating(true)
    try {
      await api.post('/monitoring', { job_type: newType, target: newTarget.trim(), frequency: newFreq })
      toast.success('Monitor created!')
      setShowModal(false)
      setNewTarget('')
      fetchJobs()
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to create monitor') }
    finally { setCreating(false) }
  }

  const deleteJob = async (id: string) => {
    try {
      await api.delete(`/monitoring/${id}`)
      setJobs(j => j.filter(x => x.id !== id))
      toast.success('Monitor deleted')
    } catch { toast.error('Failed to delete monitor') }
  }

  const toggleJob = async (id: string, active: boolean) => {
    try {
      await api.patch(`/monitoring/${id}`, { is_active: !active })
      setJobs(j => j.map(x => x.id === id ? { ...x, is_active: !active } : x))
      toast.success(active ? 'Monitor paused' : 'Monitor resumed')
    } catch { toast.error('Failed to update monitor') }
  }

  const runNow = async (id: string) => {
    setRunningId(id)
    try {
      const res = await api.post(`/monitoring/${id}/run`)
      toast.success(`Scan complete — ${res.data.result?.risk_level?.toUpperCase() || 'done'}`)
      fetchJobs()
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Scan failed') }
    finally { setRunningId(null) }
  }

  if (loading) return (
    <PageTransition>
      <Helmet><title>Monitoring | LeakLens</title></Helmet>
      <div className="space-y-4"><Skeleton className="h-8 w-48" />{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
    </PageTransition>
  )

  return (
    <PageTransition>
      <Helmet><title>Monitoring | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Security Monitoring</h1>
            <p className="text-text-secondary mt-1">Track changes in your digital exposure with continuous monitoring.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => { setLoading(true); fetchJobs() }}>Refresh</Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowModal(true)}>Add Monitor</Button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <EmptyState icon={Activity} title="No monitors configured" description="Add your first monitor to automatically track exposure changes for emails, domains, or keywords.">
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowModal(true)} className="mt-4">Add Your First Monitor</Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {jobs.map((job, i) => {
                const Icon = typeIcons[job.job_type] || Search
                const isRunning = runningId === job.id
                return (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.05 }}>
                    <Card variant="hover" padding="md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${job.is_active ? 'bg-accent-green/10 text-accent-green' : 'bg-white/5 text-text-muted'}`}>
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-text-primary truncate">{job.target}</h3>
                              <Badge variant={job.is_active ? 'success' : 'default'}>{job.is_active ? 'Active' : 'Paused'}</Badge>
                              <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-white/5 uppercase">{job.job_type}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-text-muted">
                              <span className="flex items-center gap-1"><Clock size={10} />{freqLabels[job.frequency] || job.frequency}</span>
                              <span>{job.run_count} scan{job.run_count !== 1 ? 's' : ''} completed</span>
                              {job.last_run && <span>Last: {new Date(job.last_run).toLocaleDateString()}</span>}
                              {job.results?.last_risk_level && (
                                <span className="flex items-center gap-1">
                                  {job.results.last_risk_level === 'low' ? <CheckCircle size={10} className="text-accent-green" /> : <AlertTriangle size={10} className="text-warning" />}
                                  {job.results.last_risk_level.toUpperCase()} ({job.results.last_exposure_count ?? 0} exposures)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => runNow(job.id)} loading={isRunning} leftIcon={<Play size={12} />} className="text-xs">Run Now</Button>
                          <button onClick={() => toggleJob(job.id, job.is_active)} className="text-text-muted hover:text-accent-cyan transition-colors p-1.5" title={job.is_active ? 'Pause' : 'Resume'}>
                            {job.is_active ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button onClick={() => deleteJob(job.id)} className="text-text-muted hover:text-danger transition-colors p-1.5" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Add Monitor Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Monitor">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Monitor Type</label>
              <div className="grid grid-cols-4 gap-2">
                {(['email', 'domain', 'username', 'keyword'] as const).map(t => {
                  const I = typeIcons[t] || Search
                  return (
                    <button key={t} onClick={() => setNewType(t)}
                      className={`p-3 rounded-xl text-center text-xs font-medium border transition-all ${newType === t ? 'border-accent-green bg-accent-green/10 text-accent-green' : 'border-white/10 bg-white/[0.02] text-text-secondary hover:bg-white/[0.05]'}`}>
                      <I size={16} className="mx-auto mb-1" />{t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  )
                })}
              </div>
            </div>
            <Input label="Target" placeholder={newType === 'email' ? 'user@example.com' : newType === 'domain' ? 'example.com' : 'Enter target...'} value={newTarget} onChange={e => setNewTarget(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Frequency</label>
              <div className="grid grid-cols-4 gap-2">
                {(['hourly', 'daily', 'weekly', 'monthly'] as const).map(f => (
                  <button key={f} onClick={() => setNewFreq(f)}
                    className={`p-2 rounded-lg text-xs font-medium border transition-all ${newFreq === f ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-white/10 bg-white/[0.02] text-text-secondary hover:bg-white/[0.05]'}`}>
                    {freqLabels[f]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)} fullWidth>Cancel</Button>
              <Button variant="primary" onClick={createJob} loading={creating} fullWidth>Create Monitor</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  )
}
