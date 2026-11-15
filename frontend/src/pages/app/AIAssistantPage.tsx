import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Sparkles, AlertTriangle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import PageTransition from '@/components/shared/PageTransition'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface Message { id: string; role: 'user' | 'assistant'; content: string; time: string }

const botResponses: Record<string, string> = {
  risk: "Based on your scan history, your current risk posture depends on your latest assessments. I recommend running regular scans of your email addresses and usernames to maintain an up-to-date picture of your digital exposure. Focus on addressing any 'critical' or 'high' risk findings first.",
  scan: "Your scan results show exposure data from various sources. Each record includes the source, date, affected data categories, and severity. The risk score (0-100) is calculated using our multi-factor assessment engine considering breach recency, data sensitivity, exposure count, and more.",
  security: "Here are some key steps to improve your security:\n\n1. **Enable 2FA** on all important accounts\n2. **Use unique passwords** for every service\n3. **Monitor your exposure** regularly with LeakLens\n4. **Review app permissions** and revoke unnecessary access\n5. **Keep software updated** to patch vulnerabilities",
  phishing: "Phishing is a social engineering attack where attackers impersonate trusted entities to steal sensitive information. Common signs include:\n\n• Urgent or threatening language\n• Misspelled URLs or domains\n• Requests for personal information\n• Unexpected attachments\n\nAlways verify the sender and URL before clicking links or entering credentials.",
}

const suggestions = [
  "What's my current risk level?",
  "Explain my latest scan results",
  "How can I improve my security?",
  "What is phishing?",
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: "Hello! I'm your AI Security Assistant. I can help you understand your security posture, explain scan results, and provide cybersecurity guidance.\n\nHow can I help you today?", time: new Date().toLocaleTimeString() },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const getResponse = (text: string): string => {
    const lower = text.toLowerCase()
    if (lower.includes('risk') || lower.includes('level') || lower.includes('score')) return botResponses.risk
    if (lower.includes('scan') || lower.includes('result') || lower.includes('explain')) return botResponses.scan
    if (lower.includes('security') || lower.includes('improve') || lower.includes('protect')) return botResponses.security
    if (lower.includes('phishing') || lower.includes('phish')) return botResponses.phishing
    return "I can help with questions about your security posture, scan results, risk levels, and general cybersecurity guidance. Try asking about your risk level, how to improve security, or what phishing is.\n\n*Note: This is a demo assistant with pre-configured responses. It does not access live data.*"
  }

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), time: new Date().toLocaleTimeString() }
    setMessages(m => [...m, userMsg]); setInput(''); setTyping(true)
    setTimeout(() => {
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: getResponse(text), time: new Date().toLocaleTimeString() }
      setMessages(m => [...m, botMsg]); setTyping(false)
    }, 1200)
  }

  return (
    <PageTransition>
      <Helmet><title>AI Assistant | LeakLens</title></Helmet>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-cyan/20"><Bot size={24} className="text-accent-green" /></div>
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">AI Security Assistant <Badge variant="info" size="sm">Beta</Badge></h1>
            <p className="text-xs text-text-secondary">General security guidance · Pre-configured responses</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-xl mb-4 text-xs text-warning">
          <AlertTriangle size={14} /> This assistant provides general guidance with pre-configured responses. It does not access live data.
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-accent-green" /></div>}
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent-green/10 text-text-primary rounded-br-md' : 'glass text-text-primary rounded-bl-md'}`}>
                  {msg.content}
                  <p className="text-[10px] text-text-muted mt-1">{msg.time}</p>
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center flex-shrink-0"><User size={16} className="text-accent-purple" /></div>}
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center"><Bot size={16} className="text-accent-green" /></div>
              <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1"><span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" /><span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:0.15s]" /><span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:0.3s]" /></div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-text-secondary hover:border-accent-green/30 hover:text-accent-green transition-colors">{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3">
          <input className="input-field flex-1" placeholder="Ask about your security posture..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} />
          <Button onClick={() => send(input)} disabled={!input.trim() || typing} leftIcon={<Send size={16} />}>Send</Button>
        </div>
      </div>
    </PageTransition>
  )
}
