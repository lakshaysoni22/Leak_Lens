import { motion } from 'framer-motion'
import { FileText, Lock, Info } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default function AuditLogsPage() {
  const placeholderLogs = [
    { timestamp: '2024-01-15 14:32:01', user: 'admin@leaklens.io', action: 'User login', details: 'Successful authentication', ip: '192.168.1.1' },
    { timestamp: '2024-01-15 14:30:45', user: 'admin@leaklens.io', action: 'Settings updated', details: 'Changed security policy', ip: '192.168.1.1' },
    { timestamp: '2024-01-15 14:28:12', user: 'analyst@leaklens.io', action: 'Scan initiated', details: 'Email scan - test@example.com', ip: '192.168.1.2' },
    { timestamp: '2024-01-15 14:25:00', user: 'user@leaklens.io', action: 'User login', details: 'Successful authentication', ip: '10.0.0.1' },
    { timestamp: '2024-01-15 14:20:33', user: 'admin@leaklens.io', action: 'User created', details: 'New user registration', ip: '192.168.1.1' },
  ]

  return (
    <PageTransition>
      <Helmet><title>Audit Logs | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
          <p className="text-text-secondary mt-1">Track all system activities and user actions.</p>
        </div>

        <div className="bg-accent-purple-dim rounded-xl p-4 border border-accent-purple/20 flex items-center gap-2">
          <Info size={16} className="text-accent-purple" />
          <p className="text-sm text-accent-purple">Full audit logging is available in the Enterprise plan. Showing sample data.</p>
        </div>

        <Card variant="default" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Timestamp', 'User', 'Action', 'Details', 'IP Address'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {placeholderLogs.map((log, i) => (
                  <motion.tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td className="px-4 py-3 text-sm text-text-secondary font-mono">{log.timestamp}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{log.user}</td>
                    <td className="px-4 py-3"><Badge variant="info" size="sm">{log.action}</Badge></td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{log.details}</td>
                    <td className="px-4 py-3 text-sm text-text-muted font-mono">{log.ip}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
