import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Check, Star, Zap } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'

const plans = [
  { id: 'free', name: 'Free', priceM: 0, priceY: 0, accent: 'border-accent-green/20', features: ['5 scans per month', 'Basic email scanner', 'Risk scoring', 'Community support'], limits: '5 scans/month' },
  { id: 'pro', name: 'Pro', priceM: 29, priceY: 279, accent: 'border-accent-cyan/30', popular: true, features: ['100 scans per month', 'All scanner types', 'API access', 'Priority support', 'PDF reports', 'Continuous monitoring'], limits: '100 scans/month' },
  { id: 'business', name: 'Business', priceM: 99, priceY: 949, accent: 'border-accent-purple/30', features: ['Unlimited scans', 'Team management (up to 25)', 'Custom integrations', 'Dedicated support', 'Admin console', 'SIEM export', 'Custom risk rules'], limits: 'Unlimited' },
  { id: 'enterprise', name: 'Enterprise', priceM: null, priceY: null, accent: 'border-white/10', features: ['Everything in Business', 'Unlimited team members', 'On-premise deployment', 'Custom SLA', 'Dedicated account manager', 'SSO / SAML', 'Audit logs'], limits: 'Custom' },
]

export default function SubscriptionPage() {
  const [annual, setAnnual] = useState(false)
  const currentPlan = 'free'

  return (
    <PageTransition>
      <Helmet><title>Subscription | LeakLens</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subscription</h1>
          <p className="text-text-secondary mt-1">Manage your plan and billing.</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-accent-green' : 'bg-white/20'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm ${annual ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>Annual <Badge variant="success" size="sm">Save 20%</Badge></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card variant="hover" padding="lg" className={`h-full relative ${plan.accent} ${plan.popular ? 'ring-1 ring-accent-cyan/30' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info"><Star size={12} className="mr-1" />Popular</Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                  {plan.priceM !== null ? (
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-text-primary">${annual ? Math.round((plan.priceY ?? 0) / 12) : plan.priceM}</span>
                      <span className="text-text-secondary text-sm">/mo</span>
                      {annual && plan.priceY ? <p className="text-xs text-text-muted">${plan.priceY}/year</p> : null}
                    </div>
                  ) : (
                    <p className="text-lg font-semibold text-text-secondary mt-2">Custom Pricing</p>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={14} className="text-accent-green mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>

                {currentPlan === plan.id ? (
                  <Button variant="secondary" fullWidth disabled>Current Plan</Button>
                ) : plan.priceM !== null ? (
                  <Button variant={plan.popular ? 'primary' : 'secondary'} fullWidth onClick={() => toast('Payment integration coming soon')} leftIcon={<Zap size={14} />}>Upgrade</Button>
                ) : (
                  <Button variant="secondary" fullWidth onClick={() => toast('Contact sales@leaklens.io')}>Contact Sales</Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
