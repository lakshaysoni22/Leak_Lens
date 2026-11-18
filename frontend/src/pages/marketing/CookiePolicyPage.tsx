import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Cookie, Calendar, ShieldCheck, Check } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const CookiePolicyPage: React.FC = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Cookie Policy — LeakLens</title>
        <meta
          name="description"
          content="LeakLens Cookie Policy. Learn how we minimize cookie usage and only utilize essential, non-invasive cookies for secure authentication."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <Badge variant="info">Transparency</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
            Cookie Policy
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#929BAD] pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#45D6FF]" />
              <span>Effective: January 15, 2024</span>
            </span>
            <span className="text-white/20">•</span>
            <span>Version 1.4</span>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="glass p-6 rounded-2xl border border-[#45D6FF]/30 bg-[#45D6FF]/5 flex items-start gap-3">
          <Cookie className="w-5 h-5 text-[#45D6FF] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed">
            <strong className="text-[#45D6FF]">Privacy Commitment:</strong> We do NOT use invasive
            advertising cookies, cross-site trackers, or third-party behavioral profiling scripts.
            Any cookie or local token used exists purely to provide secure authentication and session
            stability.
          </div>
        </div>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 sm:p-12 rounded-3xl border border-white/[0.08] space-y-10 text-sm leading-relaxed text-[#929BAD]"
        >
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#45D6FF]">1.</span> What Are Cookies?
            </h2>
            <p>
              Cookies are small alphanumeric files transferred to your computer&apos;s storage via
              your web browser. They enable web applications to recognize your browser session and
              maintain persistent state between page requests.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#45D6FF]">2.</span> Categories of Cookies We Use
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Strictly Necessary Cookies</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#A3FF6F]/15 text-[#A3FF6F]">
                    Required
                  </span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  These cookies are vital for the core functionality of the LeakLens application,
                  including JSON Web Token (JWT) session maintenance, CSRF protection, and user
                  authentication validation. The application cannot function without them.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Preference &amp; Theme Cookies</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#45D6FF]/15 text-[#45D6FF]">
                    Functional
                  </span>
                </div>
                <p className="text-xs text-[#929BAD] leading-relaxed">
                  Used exclusively to store user interface preferences such as dark/light mode toggle
                  state and sidebar collapsed preferences in HTML5 LocalStorage.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#45D6FF]">3.</span> Managing &amp; Disabling Cookies
            </h2>
            <p>
              You have the right to accept or decline cookies. Most web browsers automatically accept
              cookies, but you can modify your browser settings to reject them if you prefer. Please
              note that disabling strictly necessary cookies will render authenticated dashboard
              sessions inoperable.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
              <span className="text-[#45D6FF]">4.</span> Inquiries
            </h2>
            <p>For questions regarding our cookie implementation, please email:</p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#F5F7FA]">
              privacy@leaklens.io
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default CookiePolicyPage;
