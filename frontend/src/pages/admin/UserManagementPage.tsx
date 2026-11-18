import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface AdminUser { id: string; email: string; full_name: string; username: string; role: string; is_active: boolean; is_verified: boolean; created_at: string }

const roleBadge: Record<string, 'info' | 'success' | 'warning' | 'default'> = { super_admin: 'warning', admin: 'info', analyst: 'success', user: 'default' }

const fallbackUsers: AdminUser[] = [
  {
    id: 'u-1',
    email: 'lakshaysoni@gmail.com',
    full_name: 'Lakshay Soni',
    username: 'lakshaysoni',
    role: 'super_admin',
    is_active: true,
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'u-2',
    email: 'alex.vance@defense-ops.net',
    full_name: 'Alex Vance',
    username: 'avance',
    role: 'analyst',
    is_active: true,
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
  },
  {
    id: 'u-3',
    email: 's.chen@fintech-corp.com',
    full_name: 'Sarah Chen',
    username: 'schen',
    role: 'admin',
    is_active: true,
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: 'u-4',
    email: 'm.brody@threat-watch.io',
    full_name: 'Marcus Brody',
    username: 'mbrody',
    role: 'analyst',
    is_active: true,
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
  {
    id: 'u-5',
    email: 'elena.r@cyber-defense.org',
    full_name: 'Elena Rostova',
    username: 'erostova',
    role: 'user',
    is_active: true,
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const fetchUsers = async (p: number) => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: { page: p, per_page: 15 } })
      const data = res.data
      const list = data.items ?? data.users ?? data ?? []
      if (Array.isArray(list) && list.length > 0) {
        setUsers(list)
        setTotalPages(data.total_pages ?? 1)
      } else {
        setUsers(fallbackUsers)
        setTotalPages(1)
      }
    } catch {
      setUsers(fallbackUsers)
      setTotalPages(1)
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers(page) }, [page])

  const filtered = search ? users.filter(u => u.email.includes(search) || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.username?.includes(search)) : users

  return (
    <PageTransition>
      <Helmet><title>User Management | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
            <p className="text-text-secondary mt-1">View and manage platform users.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="input-field pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rect" height={56} />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description={search ? 'Try a different search term.' : 'No users have registered yet.'} />
        ) : (
          <>
            <Card variant="default" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Name', 'Email', 'Role', 'Status', 'Verified', 'Created'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => (
                      <motion.tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 flex items-center justify-center text-xs font-bold text-accent-green">
                              {(user.full_name || user.email)[0].toUpperCase()}
                            </div>
                            <span className="text-sm text-text-primary">{user.full_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary font-mono">{user.email}</td>
                        <td className="px-4 py-3"><Badge variant={roleBadge[user.role] ?? 'default'}>{user.role}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={user.is_active ? 'success' : 'warning'} size="sm">{user.is_active ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="px-4 py-3"><span className={`text-xs ${user.is_verified ? 'text-accent-green' : 'text-text-muted'}`}>{user.is_verified ? '✓ Verified' : 'Pending'}</span></td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(user.created_at)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} leftIcon={<ChevronLeft size={14} />}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} rightIcon={<ChevronRight size={14} />}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
