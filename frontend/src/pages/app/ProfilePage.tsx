import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCircle, Mail, Calendar, Shield, Save } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/user/profile', { full_name: fullName, bio })
      updateUser({ full_name: fullName })
      toast.success('Profile updated')
    } catch { toast.error('Failed to update profile') }
    setSaving(false)
  }

  const initials = (user?.full_name ?? user?.email ?? 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <PageTransition>
      <Helmet><title>Profile | LeakLens</title></Helmet>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="text-text-secondary mt-1">Manage your personal information.</p>
        </div>

        <Card variant="hover" padding="lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 border-2 border-accent-green/30 flex items-center justify-center text-2xl font-bold text-accent-green">{initials}</div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{user?.full_name ?? 'User'}</h2>
              <p className="text-sm text-text-secondary flex items-center gap-1"><Mail size={14} />{user?.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="info">{user?.role ?? 'user'}</Badge>
                {user?.is_verified && <Badge variant="success">Verified</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} icon={<UserCircle size={16} />} />
            <Input label="Email" value={user?.email ?? ''} disabled icon={<Mail size={16} />} />
            <Input label="Username" value={user?.username ?? ''} disabled icon={<Shield size={16} />} />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
              <textarea className="input-field resize-none h-24" placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <Button loading={saving} onClick={handleSave} leftIcon={<Save size={16} />}>Save Changes</Button>
          </div>
        </Card>

        <Card variant="hover" padding="lg">
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-secondary">Member Since</span><p className="text-text-primary font-medium">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p></div>
              <div><span className="text-text-secondary">Account Status</span><p className="text-accent-green font-medium">Active</p></div>
              <div><span className="text-text-secondary">Role</span><p className="text-text-primary font-medium capitalize">{user?.role ?? 'user'}</p></div>
              <div><span className="text-text-secondary">2FA</span><p className={user?.mfa_enabled ? 'text-accent-green font-medium' : 'text-warning font-medium'}>{user?.mfa_enabled ? 'Enabled' : 'Disabled'}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
