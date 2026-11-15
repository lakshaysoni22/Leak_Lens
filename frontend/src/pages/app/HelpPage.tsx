import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Book, Code, MessageCircle, Mail, ChevronDown, Search, ExternalLink } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'

const quickLinks = [
  { title: 'Getting Started', desc: 'Learn the basics of LeakLens', icon: Book, to: '/docs' },
  { title: 'API Documentation', desc: 'Integrate with our REST API', icon: Code, to: '/app/api-access' },
  { title: 'FAQ', desc: 'Frequently asked questions', icon: HelpCircle, to: '/faq' },
  { title: 'Contact Support', desc: 'Get help from our team', icon: MessageCircle, to: '/contact' },
]

const faqs = [
  { q: 'How do I run my first scan?', a: 'Navigate to the Email Scanner page from the sidebar, enter an email address, and click "Scan". The system will analyze the email for potential data exposures and provide a detailed risk assessment.' },
  { q: 'Is my data stored securely?', a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use zero-knowledge principles where possible, and scan queries are hashed before storage.' },
  { q: 'What does "Synthetic Data" mean?', a: 'Synthetic data results are generated for demonstration purposes and do not represent actual data breaches. They help you understand how LeakLens works without accessing real breach databases.' },
  { q: 'How do I enable Two-Factor Authentication?', a: 'Go to Security Settings from the sidebar, find the Two-Factor Authentication section, and click "Enable 2FA". You\'ll need an authenticator app like Google Authenticator or Authy.' },
  { q: 'Can I upgrade or downgrade my plan?', a: 'Yes, you can change your plan at any time from the Subscription page. Upgrades take effect immediately, and downgrades take effect at the end of your current billing period.' },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <PageTransition>
      <Helmet><title>Help | LeakLens</title></Helmet>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Help & Support</h1>
          <p className="text-text-secondary mt-1">Find answers and get assistance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div key={link.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={link.to}>
                <Card variant="hover" padding="md" className="h-full cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.04]"><link.icon size={20} className="text-accent-green" /></div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1">{link.title} <ExternalLink size={12} className="text-text-muted" /></h3>
                      <p className="text-xs text-text-secondary mt-1">{link.desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <Card variant="hover" padding="lg">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Common Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-sm font-medium text-text-primary">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}><ChevronDown size={16} className="text-text-secondary" /></motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <p className="px-4 pb-4 text-sm text-text-secondary">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="hover" padding="lg">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-accent-cyan" />
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Need more help?</h3>
              <p className="text-xs text-text-secondary">Contact our support team at <span className="text-accent-cyan">support@leaklens.io</span></p>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
