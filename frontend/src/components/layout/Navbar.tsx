import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  Globe,
  AlertTriangle,
  Shield,
  FileText,
  Code,
  HelpCircle,
  Activity,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

interface DropdownItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const productItems: DropdownItem[] = [
  {
    title: 'Email Scanner',
    description: 'Detect compromised credentials and exposure history across known breach archives.',
    href: '/app/scan/email',
    icon: Mail,
  },
  {
    title: 'Username Scanner',
    description: 'Map cross-platform digital footprints across 300+ public and private networks.',
    href: '/app/scan/username',
    icon: User,
  },
  {
    title: 'Domain Scanner',
    description: 'Audit domain hygiene, DNS records, SSL posture, and open mail server vectors.',
    href: '/app/scan/domain',
    icon: Globe,
  },
  {
    title: 'Phishing Detection',
    description: 'Detect homoglyphs, typosquatting domains, and weaponized malicious URLs.',
    href: '/app/scan/phishing',
    icon: AlertTriangle,
  },
  {
    title: 'Threat Intelligence',
    description: 'Real-time aggregated indicators of compromise from global security networks.',
    href: '/app/threat-intel',
    icon: Shield,
  },
];

const resourceItems: DropdownItem[] = [
  {
    title: 'Documentation',
    description: 'Comprehensive guides, architecture overviews, and integration workflows.',
    href: '/docs',
    icon: FileText,
  },
  {
    title: 'API Reference',
    description: 'RESTful API endpoints, token authentication, and SDK code examples.',
    href: '/docs#api',
    icon: Code,
  },
  {
    title: 'Security',
    description: 'Zero-trust architecture, encryption practices, and SOC 2 compliance.',
    href: '/security',
    icon: Shield,
  },
  {
    title: 'FAQ',
    description: 'Frequently asked questions about scanning, privacy, and subscriptions.',
    href: '/faq',
    icon: HelpCircle,
  },
  {
    title: 'Status',
    description: 'Real-time operational status, latency metrics, and API health telemetry.',
    href: '/status',
    icon: Activity,
  },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'product' | 'resources' | null>(null);
  const location = useLocation();
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleMouseEnter = (menu: 'product' | 'resources') => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[#080B12]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3'
          : 'bg-transparent border-b border-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Product Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('product')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                  activeDropdown === 'product'
                    ? 'text-[#A3FF6F] bg-white/[0.04]'
                    : 'text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
                )}
                onClick={() => setActiveDropdown(activeDropdown === 'product' ? null : 'product')}
                aria-expanded={activeDropdown === 'product'}
              >
                <span>Product</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    activeDropdown === 'product' && 'rotate-180 text-[#A3FF6F]'
                  )}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === 'product' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-[420px] rounded-2xl bg-[#0D1220]/95 backdrop-blur-2xl border border-white/[0.1] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#929BAD]/70 px-3 py-1.5">
                      Security Modules
                    </div>
                    <div className="grid gap-1">
                      {productItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group/item"
                          >
                            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#A3FF6F] group-hover/item:border-[#A3FF6F]/40 group-hover/item:bg-[#A3FF6F]/10 transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[#F5F7FA] group-hover/item:text-[#A3FF6F] transition-colors">
                                {item.title}
                              </div>
                              <p className="text-xs text-[#929BAD] line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Features */}
            <Link
              to="/features"
              className={cn(
                'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                location.pathname === '/features'
                  ? 'text-[#A3FF6F] bg-white/[0.04]'
                  : 'text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
              )}
            >
              Features
            </Link>

            {/* Solutions */}
            <Link
              to="/solutions"
              className={cn(
                'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                location.pathname === '/solutions'
                  ? 'text-[#A3FF6F] bg-white/[0.04]'
                  : 'text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
              )}
            >
              Solutions
            </Link>

            {/* Pricing */}
            <Link
              to="/pricing"
              className={cn(
                'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                location.pathname === '/pricing'
                  ? 'text-[#A3FF6F] bg-white/[0.04]'
                  : 'text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
              )}
            >
              Pricing
            </Link>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('resources')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                  activeDropdown === 'resources'
                    ? 'text-[#A3FF6F] bg-white/[0.04]'
                    : 'text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
                )}
                onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                aria-expanded={activeDropdown === 'resources'}
              >
                <span>Resources</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    activeDropdown === 'resources' && 'rotate-180 text-[#A3FF6F]'
                  )}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === 'resources' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-[380px] rounded-2xl bg-[#0D1220]/95 backdrop-blur-2xl border border-white/[0.1] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#929BAD]/70 px-3 py-1.5">
                      Knowledge & Trust
                    </div>
                    <div className="grid gap-1">
                      {resourceItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group/item"
                          >
                            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#45D6FF] group-hover/item:border-[#45D6FF]/40 group-hover/item:bg-[#45D6FF]/10 transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[#F5F7FA] group-hover/item:text-[#45D6FF] transition-colors">
                                {item.title}
                              </div>
                              <p className="text-xs text-[#929BAD] line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Documentation */}
            <Link
              to="/docs"
              className={cn(
                'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                location.pathname === '/docs'
                  ? 'text-[#A3FF6F] bg-white/[0.04]'
                  : 'text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
              )}
            >
              Documentation
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/auth/login"
              className="px-4 py-2 text-sm font-medium text-[#F5F7FA] hover:text-[#A3FF6F] transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className="btn-primary text-sm shadow-[0_0_25px_rgba(163,255,111,0.35)]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#F5F7FA] hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-[65px] bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed top-[65px] right-0 bottom-0 w-full sm:w-[380px] bg-[#0D1220] border-l border-white/[0.1] p-6 z-50 overflow-y-auto lg:hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#929BAD] mb-3">
                    Navigation
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      Home
                    </Link>
                    <Link
                      to="/features"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      Features
                    </Link>
                    <Link
                      to="/solutions"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      Solutions
                    </Link>
                    <Link
                      to="/pricing"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      Pricing
                    </Link>
                    <Link
                      to="/docs"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      Documentation
                    </Link>
                    <Link
                      to="/security"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      Security
                    </Link>
                    <Link
                      to="/faq"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      FAQ
                    </Link>
                    <Link
                      to="/status"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-[#F5F7FA] hover:bg-white/5"
                    >
                      System Status
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#929BAD] mb-3">
                    Scanners
                  </div>
                  <div className="space-y-1">
                    {productItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          to={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#F5F7FA] hover:bg-white/5"
                        >
                          <Icon className="w-4 h-4 text-[#A3FF6F]" />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.08] space-y-3">
                <Link
                  to="/auth/login"
                  className="w-full text-center block py-2.5 rounded-lg border border-white/10 text-sm font-medium text-[#F5F7FA] hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="btn-primary w-full justify-center text-sm py-2.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
