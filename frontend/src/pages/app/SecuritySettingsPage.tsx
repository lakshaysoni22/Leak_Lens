import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Shield, Monitor, Trash2, Key, Smartphone } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

export default function SecuritySettingsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPwd, setChangingPwd] = useState(false)
  const [sessions, setSessions] = useState<Array<{ id: string; device: string; last_active: string; current: boolean }>>([])
  const [disableModal, setDisableModal] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [disabling, setDisabling] = useState(false)

  useEffect(() => {
    api.get('/user/sessions').then(r => setSessions(r.data?.sessions ?? r.data ?? [])).catch(() => {
      setSessions([{ id: '1', device: 'Current Browser', last_active: new Date().toISOString(), current: true }])
    })
  }, [])

  const strength = [newPassword.length >= 8, /[A-Z]/.test(newPassword), /[a-z]/.test(newPassword), /\d/.test(newPassword)].filter(Boolean).length
  const strengthColors = ['bg-danger', 'bg-warning', 'bg-[#FFE066]', 'bg-accent-green']

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (strength < 3) { toast.error('Password is too weak'); return }
    setChangingPwd(true)
    try {
      await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
      toast.success('Password changed successfully')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (e: unknown) { toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to change password') }
    setChangingPwd(false)
  }

  const handleDisableMFA = async () => {
    setDisabling(true)
    try {
      await api.post('/auth/mfa/disable', { code: disableCode })
      toast.success('2FA disabled')
      setDisableModal(false)
    } catch { toast.error('Invalid code') }
    setDisabling(false)
  }

  const revokeSession = async (id: string) => {
    try { await api.delete(`/user/sessions/${id}`); setSessions(s => s.filter(x => x.id !== id)); toast.success('Session revoked') } catch { toast.error('Failed to revoke session') }
  }

  return (
    <PageTransition>
      <Helmet><title>Security Settings | LeakLens</title></Helmet>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Security Settings</h1>
          <p className="text-text-secondary mt-1">Manage your account security.</p>
        </div>

        {/* Change Password */}
        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Key size={18} className="text-accent-green" /> Change Password</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <div>
                <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-white/10'}`} />)}</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className={newPassword.length >= 8 ? 'text-accent-green' : 'text-text-muted'}>✓ 8+ characters</span>
                      <span className={/[A-Z]/.test(newPassword) ? 'text-accent-green' : 'text-text-muted'}>✓ Uppercase</span>
                      <span className={/[a-z]/.test(newPassword) ? 'text-accent-green' : 'text-text-muted'}>✓ Lowercase</span>
                      <span className={/\d/.test(newPassword) ? 'text-accent-green' : 'text-text-muted'}>✓ Number</span>
                    </div>
                  </div>
                )}
              </div>
              <Input label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} error={confirmPassword && confirmPassword !== newPassword ? 'Passwords do not match' : undefined} />
              <Button loading={changingPwd} onClick={handleChangePassword} leftIcon={<Lock size={16} />}>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone size={18} className="text-accent-cyan" /> Two-Factor Authentication</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary">Status: <Badge variant={user?.mfa_enabled ? 'success' : 'warning'}>{user?.mfa_enabled ? 'Enabled' : 'Disabled'}</Badge></p>
                <p className="text-xs text-text-secondary mt-1">{user?.mfa_enabled ? 'Your account is protected with 2FA.' : 'Add an extra layer of security to your account.'}</p>
              </div>
              {user?.mfa_enabled ? (
                <Button variant="danger" size="sm" onClick={() => setDisableModal(true)}>Disable 2FA</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/mfa-setup')}>Enable 2FA</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Monitor size={18} className="text-accent-purple" /> Active Sessions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                  <div className="flex items-center gap-3">
                    <Monitor size={16} className="text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-primary">{s.device} {s.current && <Badge variant="success" size="sm">Current</Badge>}</p>
                      <p className="text-xs text-text-secondary">Last active: {new Date(s.last_active).toLocaleString()}</p>
                    </div>
                  </div>
                  {!s.current && <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)} leftIcon={<Trash2 size={12} />}>Revoke</Button>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Modal isOpen={disableModal} onClose={() => setDisableModal(false)} title="Disable Two-Factor Authentication" size="sm">
          <p className="text-sm text-text-secondary mb-4">Enter your 2FA code to disable two-factor authentication.</p>
          <Input label="2FA Code" value={disableCode} onChange={e => setDisableCode(e.target.value)} placeholder="000000" />
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setDisableModal(false)}>Cancel</Button>
            <Button variant="danger" loading={disabling} onClick={handleDisableMFA}>Disable 2FA</Button>
          </div>
        </Modal>
      </div>
    </PageTransition>
  )
}
