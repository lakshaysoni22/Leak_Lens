import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, Trash2, FileText, Shield, AlertTriangle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

export default function PrivacyCenterPage() {
  const [deleteModal, setDeleteModal] = useState(false)

  const dataTypes = [
    { type: 'Account Information', desc: 'Name, email, username used for authentication', icon: Shield },
    { type: 'Scan Queries', desc: 'Email addresses and usernames you scan (hashed, not stored in plaintext)', icon: Eye },
    { type: 'Assessment Results', desc: 'Risk scores, exposure records, and recommendations', icon: FileText },
    { type: 'Session Data', desc: 'Login history, device information for security', icon: Shield },
  ]

  const rights = [
    { title: 'Right to Access', desc: 'Request a copy of all personal data we hold about you.' },
    { title: 'Right to Deletion', desc: 'Request complete deletion of your account and associated data.' },
    { title: 'Right to Portability', desc: 'Download your data in a machine-readable format.' },
    { title: 'Right to Rectification', desc: 'Request corrections to inaccurate personal data.' },
    { title: 'Right to Restriction', desc: 'Request limitation of processing of your personal data.' },
  ]

  return (
    <PageTransition>
      <Helmet><title>Privacy Center | LeakLens</title></Helmet>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Privacy Center</h1>
          <p className="text-text-secondary mt-1">Control how your data is collected, used, and stored.</p>
        </div>

        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Eye size={18} className="text-accent-cyan" /> Data We Collect</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataTypes.map((d, i) => (
                <motion.div key={d.type} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <d.icon size={16} className="text-accent-green mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{d.type}</p>
                    <p className="text-xs text-text-secondary">{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle>Your Rights</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rights.map((r, i) => (
                <div key={r.title} className="flex items-start gap-2">
                  <span className="text-accent-green text-sm mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{r.title}</p>
                    <p className="text-xs text-text-secondary">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Download size={18} className="text-accent-purple" /> Download Your Data</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-3">Request a complete export of your personal data in JSON format.</p>
            <Button variant="secondary" leftIcon={<Download size={16} />} onClick={() => toast('Data export feature coming soon')}>Request Data Export</Button>
          </CardContent>
        </Card>

        <Card variant="hover" padding="lg" className="border-danger/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-danger"><AlertTriangle size={18} /> Delete Account</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={() => setDeleteModal(true)}>Delete My Account</Button>
          </CardContent>
        </Card>

        <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account" size="sm">
          <div className="text-center">
            <AlertTriangle size={48} className="text-danger mx-auto mb-4" />
            <p className="text-sm text-text-secondary mb-4">This will permanently delete your account, all scan history, and personal data. This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { setDeleteModal(false); toast('Account deletion request submitted') }}>Yes, Delete Everything</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  )
}
