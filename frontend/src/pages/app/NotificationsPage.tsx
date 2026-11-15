import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Trash2, Shield, AlertTriangle, Info } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

interface Notification { id: string; title: string; message: string; type: 'info' | 'warning' | 'success'; read: boolean; created_at: string }

const sampleNotifications: Notification[] = [
  { id: '1', title: 'Welcome to LeakLens', message: 'Your account has been created successfully. Start by running your first email exposure scan.', type: 'success', read: false, created_at: new Date().toISOString() },
  { id: '2', title: 'Security Tip', message: 'Enable two-factor authentication to add an extra layer of security to your account.', type: 'info', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', title: 'New Feature Available', message: 'Domain security scanning is now available. Check your domain\'s SSL configuration and DNS setup.', type: 'info', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
]

const typeIcons = { info: Info, warning: AlertTriangle, success: Shield }
const typeColors = { info: 'text-accent-cyan', warning: 'text-warning', success: 'text-accent-green' }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })))
  const remove = (id: string) => setNotifications(ns => ns.filter(n => n.id !== id))
  const unread = notifications.filter(n => !n.read).length

  return (
    <PageTransition>
      <Helmet><title>Notifications | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
            <p className="text-text-secondary mt-1">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
          </div>
          {unread > 0 && <Button variant="ghost" size="sm" leftIcon={<CheckCheck size={14} />} onClick={markAllRead}>Mark all as read</Button>}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You'll receive notifications about security alerts, scan results, and account activity here." />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map(n => {
                const Icon = typeIcons[n.type]
                return (
                  <motion.div key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}>
                    <Card variant="hover" padding="md" className={!n.read ? 'border-l-2 border-l-accent-green' : ''}>
                      <div className="flex items-start gap-3">
                        <Icon size={20} className={typeColors[n.type]} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-text-primary">{n.title}</h3>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-accent-green" />}
                          </div>
                          <p className="text-sm text-text-secondary">{n.message}</p>
                          <p className="text-xs text-text-muted mt-2">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                        <button onClick={() => remove(n.id)} className="text-text-muted hover:text-danger transition-colors p-1"><Trash2 size={14} /></button>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
