import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate UI-only submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Your message has been received! Our security engineers will reply within 24 hours.');
    }, 900);
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Contact Us — LeakLens Cybersecurity Support</title>
        <meta
          name="description"
          content="Get in touch with the LeakLens team for enterprise security inquiries, technical support, partnerships, or vulnerability reporting."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="info">Reach Out</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            We&apos;re Here to <span className="gradient-green">Assist You</span>
          </h1>
          <p className="text-lg text-[#929BAD] leading-relaxed">
            Have a question about our enterprise API, need custom threat feed integration, or want
            to report a security matter? Drop us a line.
          </p>
        </section>

        {/* Contact Layout: Form + Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column (8 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 glass p-8 sm:p-10 rounded-3xl border border-white/[0.08]"
          >
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#A3FF6F]/15 border border-[#A3FF6F]/30 text-[#A3FF6F] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#F5F7FA]">Message Transmitted</h3>
                <p className="text-sm text-[#929BAD] max-w-md mx-auto leading-relaxed">
                  Thank you for contacting LeakLens. Your ticket has been assigned to our defensive
                  operations team. You will receive an encrypted reply at{' '}
                  <span className="text-[#A3FF6F]">{formData.email}</span> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                  }}
                  className="btn-secondary text-sm mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA]">
                      Full Name <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA]">
                      Email Address <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA]">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field bg-[#0D1220]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Enterprise Sales">Enterprise Sales &amp; Custom SLA</option>
                    <option value="API Integration">API Integration &amp; Key Limits</option>
                    <option value="Responsible Disclosure">Security &amp; Vulnerability Disclosure</option>
                    <option value="Billing Support">Billing &amp; Subscription Support</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA]">
                    Message <span className="text-[#FF5A5A]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide details about your query or organization requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center text-base py-3.5"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#080B12] border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Send Encrypted Message</span>
                    </span>
                  )}
                </button>

                <p className="text-[11px] text-[#929BAD] text-center">
                  Protected by end-to-end encryption. Zero communication logs are retained.
                </p>
              </form>
            )}
          </motion.div>

          {/* Sidebar Column (4 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Direct Contact Card */}
            <div className="glass p-6 rounded-2xl border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#A3FF6F]" />
                <span>Direct Communications</span>
              </h3>
              <p className="text-xs text-[#929BAD] leading-relaxed">
                Need urgent triage or prefer direct channel communication?
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3 text-[#F5F7FA]">
                  <Mail className="w-4 h-4 text-[#A3FF6F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">General &amp; Sales</div>
                    <a href="mailto:contact@leaklens.io" className="text-[#929BAD] hover:text-[#A3FF6F]">
                      contact@leaklens.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#F5F7FA]">
                  <ShieldCheck className="w-4 h-4 text-[#45D6FF] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Security &amp; Vulnerability Reports</div>
                    <a href="mailto:security@leaklens.io" className="text-[#929BAD] hover:text-[#45D6FF]">
                      security@leaklens.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#F5F7FA]">
                  <MapPin className="w-4 h-4 text-[#8B7CFF] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Headquarters</div>
                    <div className="text-[#929BAD]">
                      LeakLens Labs Inc.
                      <br />
                      548 Market St, Suite 72000
                      <br />
                      San Francisco, CA 94104
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#F5F7FA]">
                  <Clock className="w-4 h-4 text-[#FFE066] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Response SLA</div>
                    <div className="text-[#929BAD]">Under 24 hours for all tiers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PGP Card */}
            <div className="glass p-6 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="text-xs font-bold text-[#F5F7FA]">PGP Fingerprint</div>
              <p className="text-[11px] font-mono text-[#A3FF6F] break-all bg-black/40 p-2.5 rounded-lg border border-white/[0.05]">
                4B29 8A1F 09E3 227C D145 99F2 BE01 7720 A3FF 6F01
              </p>
              <div className="text-[10px] text-[#929BAD]">
                Verify our GPG public key before submitting sensitive disclosure archives.
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default ContactPage;
