import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import { Shield, Disc as Discord, ArrowUpRight } from 'lucide-react';

const GithubIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080B12] border-t border-white/[0.06] text-[#929BAD] text-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/[0.06]">
          {/* Column 1: Logo + Tagline + Social (takes 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-[#929BAD] max-w-sm leading-relaxed">
              Empowering individuals and organizations with actionable digital footprint
              intelligence, exposure assessment, and automated attack-surface defense.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#929BAD] hover:text-[#A3FF6F] hover:border-[#A3FF6F]/30 transition-all"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#929BAD] hover:text-[#45D6FF] hover:border-[#45D6FF]/30 transition-all"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#929BAD] hover:text-[#8B7CFF] hover:border-[#8B7CFF]/30 transition-all"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#929BAD] hover:text-[#A3FF6F] hover:border-[#A3FF6F]/30 transition-all"
              >
                <Discord className="w-4 h-4" />
              </a>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#929BAD]/80">
              <span className="w-2 h-2 rounded-full bg-[#A3FF6F] animate-pulse" />
              <span>All intelligence engines operational</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA] mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/app/scan/email"
                  className="hover:text-[#A3FF6F] transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Email Scanner</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/app/scan/username"
                  className="hover:text-[#A3FF6F] transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Username Scanner</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/app/scan/domain"
                  className="hover:text-[#A3FF6F] transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Domain Scanner</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/app/scan/phishing"
                  className="hover:text-[#A3FF6F] transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Phishing Detection</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-[#A3FF6F] transition-colors">
                  All Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="hover:text-[#F5F7FA] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#F5F7FA] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-[#F5F7FA] transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F5F7FA] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-[#F5F7FA] transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA] mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="hover:text-[#F5F7FA] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#F5F7FA] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-[#F5F7FA] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/acceptable-use" className="hover:text-[#F5F7FA] transition-colors">
                  Acceptable Use
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#F5F7FA] transition-colors">
                  Security & FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#929BAD]/70">
          <div>© 2024 LeakLens. All rights reserved.</div>
          <div className="flex items-center gap-2 text-[#929BAD]/80">
            <Shield className="w-3.5 h-3.5 text-[#A3FF6F]" />
            <span>Built with security in mind.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
