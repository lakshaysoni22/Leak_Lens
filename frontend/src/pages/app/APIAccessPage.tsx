import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Plus, Trash2, Copy, CheckCircle, Clock, Shield, AlertTriangle, Eye, EyeOff, RefreshCw } from 'lucide-react'
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

interface APIKeyItem {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  rate_limit: number
  permissions: Record<string, boolean>
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export default function APIAccessPage() {
  const [keys, setKeys] = useState<APIKeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchKeys = useCallback(async () => {
    try {
      const res = await api.get('/api-keys')
      setKeys(res.data.keys ?? [])
    } catch { toast.error('Failed to load API keys') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  const createKey = async () => {
    if (!newKeyName.trim()) { toast.error('Key name is required'); return }
    setCreating(true)
    try {
      const res = await api.post('/api-keys', { name: newKeyName.trim() })
      setCreatedKey(res.data.key.api_key)
      setNewKeyName('')
      fetchKeys()
      toast.success('API key created!')
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to create key') }
    finally { setCreating(false) }
  }

  const revokeKey = async (id: string) => {
    try {
      await api.delete(`/api-keys/${id}`)
      setKeys(k => k.filter(x => x.id !== id))
      toast.success('API key revoked')
    } catch { toast.error('Failed to revoke key') }
  }

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey)
      setCopied(true)
      toast.success('API key copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return (
    <PageTransition>
      <Helmet><title>API Access | LeakLens</title></Helmet>
      <div className="space-y-4"><Skeleton className="h-8 w-48" />{[1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
    </PageTransition>
  )

  return (
    <PageTransition>
      <Helmet><title>API Access | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">API Access</h1>
            <p className="text-text-secondary mt-1">Manage API keys to integrate LeakLens with your security tools and workflows.</p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => { setShowCreate(true); setCreatedKey(null) }}>Generate Key</Button>
        </div>

        {/* Active Keys */}
        {keys.length === 0 ? (
          <EmptyState icon={Key} title="No API keys" description="Generate an API key to access the LeakLens API from your applications and security tools.">
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreate(true)} className="mt-4">Generate Your First Key</Button>
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {keys.map((k, i) => (
              <motion.div key={k.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card variant="hover" padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.is_active ? 'bg-accent-green/10 text-accent-green' : 'bg-danger/10 text-danger'}`}>
                        <Key size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-text-primary">{k.name}</h3>
                          <Badge variant={k.is_active ? 'success' : 'danger'}>{k.is_active ? 'Active' : 'Revoked'}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <code className="bg-white/5 px-2 py-0.5 rounded font-mono">{k.key_prefix}••••••••</code>
                          <span className="flex items-center gap-1"><Shield size={10} />{k.rate_limit} req/min</span>
                          <span className="flex items-center gap-1"><Clock size={10} />Created {new Date(k.created_at).toLocaleDateString()}</span>
                          {k.last_used_at && <span>Last used: {new Date(k.last_used_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    {k.is_active && (
                      <Button variant="ghost" size="sm" onClick={() => revokeKey(k.id)} className="text-danger hover:text-danger">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* API Documentation */}
        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle>Quick Start</CardTitle></CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm mb-4">Use your API key to make authenticated requests to the LeakLens API.</p>
            <div className="bg-[#0D1220] rounded-xl p-4 border border-white/10 font-mono text-sm">
              <div className="text-text-muted mb-1"># Email exposure scan</div>
              <div className="text-accent-green">curl</div> <span className="text-text-secondary">-X POST {window.location.origin}/api/v1/scans/email \</span>
              <div className="ml-4 text-text-secondary">-H <span className="text-accent-cyan">"Authorization: Bearer YOUR_API_KEY"</span> \</div>
              <div className="ml-4 text-text-secondary">-H <span className="text-accent-cyan">"Content-Type: application/json"</span> \</div>
              <div className="ml-4 text-text-secondary">-d <span className="text-accent-cyan">'{`{"email": "check@example.com"}`}'</span></div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Email Scan', method: 'POST', path: '/api/v1/scans/email' },
                { label: 'Username Scan', method: 'POST', path: '/api/v1/scans/username' },
                { label: 'Domain Scan', method: 'POST', path: '/api/v1/domain/scan' },
                { label: 'Phishing Check', method: 'POST', path: '/api/v1/phishing/analyze' },
              ].map(ep => (
                <div key={ep.path} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-xs font-semibold text-text-primary mb-1">{ep.label}</div>
                  <code className="text-[10px] text-text-muted"><span className="text-accent-green">{ep.method}</span> {ep.path}</code>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <a href="/api/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-accent-cyan hover:underline">
                View Full API Documentation →
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle>Rate Limits</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { plan: 'Free', limit: '100 req/min', scans: '5/month' },
                { plan: 'Pro', limit: '500 req/min', scans: '50/month' },
                { plan: 'Business', limit: 'Unlimited', scans: 'Unlimited' },
              ].map(r => (
                <div key={r.plan} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <div className="text-sm font-semibold text-text-primary mb-2">{r.plan}</div>
                  <div className="text-lg font-bold text-accent-cyan">{r.limit}</div>
                  <div className="text-xs text-text-muted mt-1">{r.scans} scans</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Key Modal */}
        <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setCreatedKey(null) }} title={createdKey ? 'API Key Created' : 'Generate API Key'}>
          {createdKey ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-accent-green/10 border border-accent-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-accent-green" />
                  <span className="text-sm font-semibold text-accent-green">Copy your API key now</span>
                </div>
                <p className="text-xs text-text-secondary">This key will only be shown once. Store it securely.</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#0D1220] p-3 rounded-lg font-mono text-sm text-accent-cyan border border-white/10 break-all">{createdKey}</code>
                <Button variant="primary" size="sm" onClick={copyKey} leftIcon={copied ? <CheckCircle size={14} /> : <Copy size={14} />}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Button variant="ghost" onClick={() => { setShowCreate(false); setCreatedKey(null) }} fullWidth>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input label="Key Name" placeholder="e.g., Production Server, CI/CD Pipeline" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowCreate(false)} fullWidth>Cancel</Button>
                <Button variant="primary" onClick={createKey} loading={creating} fullWidth>Generate Key</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  )
}
