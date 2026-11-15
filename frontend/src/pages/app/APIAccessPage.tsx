import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Copy, Key, Lock, Zap, CheckCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function APIAccessPage() {
  const [copied, setCopied] = useState(false)
  const apiKeyPlaceholder = 'll_sk_••••••••••••••••••••••••••••••'

  const copyExample = () => {
    navigator.clipboard.writeText(`curl -H "Authorization: Bearer YOUR_API_KEY" \\\n  https://api.leaklens.io/v1/scans/email \\\n  -d '{"email": "user@example.com"}'`)
    setCopied(true); toast.success('Copied to clipboard'); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageTransition>
      <Helmet><title>API Access | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">API Access</h1>
          <p className="text-text-secondary mt-1">Integrate LeakLens into your applications with our REST API.</p>
        </div>

        <div className="bg-accent-cyan-dim rounded-xl p-4 border border-accent-cyan/20">
          <p className="text-sm text-accent-cyan font-medium flex items-center gap-2"><Lock size={16} /> API Access requires Pro plan or above</p>
          <p className="text-xs text-text-secondary mt-1">Upgrade your subscription to generate API keys and access the API.</p>
        </div>

        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Key size={18} className="text-accent-green" /> API Key</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <code className="text-sm text-text-secondary flex-1 font-mono">{apiKeyPlaceholder}</code>
              <Button variant="ghost" size="sm" leftIcon={<Copy size={14} />} onClick={() => toast('Upgrade to Pro to generate API keys')}>Copy</Button>
            </div>
            <p className="text-xs text-text-secondary mt-2">Your API key grants full access to your account. Keep it secret.</p>
          </CardContent>
        </Card>

        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-accent-cyan" /> Rate Limits</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[{ plan: 'Pro', limit: '100 req/min', scans: '100/month' }, { plan: 'Business', limit: '500 req/min', scans: 'Unlimited' }, { plan: 'Enterprise', limit: 'Custom', scans: 'Custom' }].map(r => (
                <div key={r.plan} className="p-3 bg-white/[0.03] rounded-xl text-center">
                  <p className="text-xs text-text-secondary mb-1">{r.plan}</p>
                  <p className="text-sm font-semibold text-text-primary">{r.limit}</p>
                  <p className="text-xs text-text-muted">{r.scans} scans</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="hover" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Code size={18} className="text-accent-purple" /> Quick Start</CardTitle>
              <Button variant="ghost" size="sm" leftIcon={copied ? <CheckCircle size={14} /> : <Copy size={14} />} onClick={copyExample}>{copied ? 'Copied!' : 'Copy'}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-bg-primary p-4 rounded-xl text-sm text-accent-green font-mono overflow-x-auto whitespace-pre">{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.leaklens.io/v1/scans/email \\
  -d '{"email": "user@example.com"}'`}</pre>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
