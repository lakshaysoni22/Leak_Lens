import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Trash2, Shield, AlertTriangle, Info, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import api from '@/lib/api'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'alert' | 'critical' | 'success'
  category: string
  is_read: boolean
  action_url: string | null
  created_at: string
}

const typeIcons: Record<string, typeof Info> = { info: Info, warning: AlertTriangle, alert: AlertTriangle, critical: Shield, success: Shield }
const typeColors: Record<string, string> = { info: 'text-accent-cyan', warning: 'text-warning', alert: 'text-warning', critical: 'text-danger', success: 'text-accent-green' }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications ?? [])
      setUnreadCount(res.data.unread_count ?? 0)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const refresh = () => { setRefreshing(true); fetchNotifications() }

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch { toast.error('Failed to mark as read') }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed to mark all as read') }
  }

  const remove = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(ns => ns.filter(n => n.id !== id))
      toast.success('Notification deleted')
    } catch { toast.error('Failed to delete notification') }
  }

  if (loading) {
    return (
      <PageTransition>
        <Helmet><title>Notifications | LeakLens</title></Helmet>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Helmet><title>Notifications | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
            <p className="text-text-secondary mt-1">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />} onClick={refresh}>Refresh</Button>
            {unreadCount > 0 && <Button variant="ghost" size="sm" leftIcon={<CheckCheck size={14} />} onClick={markAllRead}>Mark all read</Button>}
          </div>
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You'll receive notifications about security alerts, scan results, and monitoring activity here. Run a scan to get started!" />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map(n => {
                const Icon = typeIcons[n.type] || Info
                const color = typeColors[n.type] || 'text-accent-cyan'
                return (
                  <motion.div key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}>
                    <Card variant="hover" padding="md" className={!n.is_read ? 'border-l-2 border-l-accent-green' : ''}>
                      <div className="flex items-start gap-3">
                        <Icon size={20} className={color} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-text-primary">{n.title}</h3>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-accent-green flex-shrink-0" />}
                            <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-white/5 uppercase">{n.category}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{n.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs text-text-muted">{new Date(n.created_at).toLocaleString()}</p>
                            {n.action_url && (
                              <a href={n.action_url} className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
                                View details <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!n.is_read && (
                            <button onClick={() => markRead(n.id)} className="text-text-muted hover:text-accent-green transition-colors p-1" title="Mark as read">
                              <Check size={14} />
                            </button>
                          )}
                          <button onClick={() => remove(n.id)} className="text-text-muted hover:text-danger transition-colors p-1" title="Delete">
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
      </div>
    </PageTransition>
  )
}
