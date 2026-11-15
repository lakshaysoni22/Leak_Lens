import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Database, KeyRound, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User, AuthTokens } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/shared/Logo';
import PageTransition from '@/components/shared/PageTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await api.post<AuthTokens>('/auth/login', {
        email: email.trim(),
        password,
        remember_me: rememberMe,
      });

      const data = response.data;

      // Handle MFA challenge requirement
      if (data.mfa_required) {
        toast('Two-factor authentication required', { icon: '🔐' });
        navigate('/auth/mfa-verify', {
          state: {
            email: email.trim(),
            user_id: data.user_id,
            from: location.state?.from,
          },
        });
        return;
      }

      // Populate User object from tokens/login response
      const user: User = {
        id: data.user_id,
        email: data.email || email.trim(),
        username: (data.email || email.trim()).split('@')[0],
        full_name: data.full_name || null,
        role: (data.role as User['role']) || 'user',
        is_active: true,
        is_verified: data.is_verified ?? true,
        mfa_enabled: false,
        created_at: new Date().toISOString(),
      };

      setAuth(user, data.access_token);
      toast.success('Welcome back to LeakLens!');
      const destination = location.state?.from?.pathname || '/app/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Authentication failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Login | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="min-h-screen w-full flex bg-[#080B12] text-[#F5F7FA] overflow-hidden">
        {/* LEFT HALF: Decorative Branding & Security Stats (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#0D1220] flex-col justify-between p-12 overflow-hidden border-r border-white/[0.08]">
          <ParticleBackground className="absolute inset-0 z-0 pointer-events-none opacity-40" />

          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A3FF6F]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#45D6FF]/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-block">
              <Logo size="lg" />
            </Link>
          </div>

          {/* Center Brand Hero & Floating Stats */}
          <div className="relative z-10 max-w-lg my-auto space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3FF6F]/10 border border-[#A3FF6F]/30 text-xs font-semibold text-[#A3FF6F] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Threat Intel
              </div>
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Monitor. Detect.{' '}
                <span className="bg-gradient-to-r from-[#A3FF6F] via-[#45D6FF] to-[#8B7CFF] bg-clip-text text-transparent">
                  Protect.
                </span>
              </h1>
              <p className="text-base text-[#929BAD] leading-relaxed">
                Continuous dark web monitoring, credential breach alerts, and real-time domain threat intelligence for high-assurance organizations.
              </p>
            </div>

            {/* Floating Glass Stats Cards */}
            <div className="space-y-3.5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass-card p-4 rounded-xl flex items-center gap-4 border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-[#A3FF6F]/15 border border-[#A3FF6F]/30 flex items-center justify-center text-[#A3FF6F]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">10M+ Leaked Records Monitored</div>
                  <div className="text-xs text-[#929BAD]">Continuous indexing across dark web dumps & forums</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="glass-card p-4 rounded-xl flex items-center gap-4 border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-[#45D6FF]/15 border border-[#45D6FF]/30 flex items-center justify-center text-[#45D6FF]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Zero-Knowledge Verification</div>
                  <div className="text-xs text-[#929BAD]">K-Anonymity hashing protects queried credentials</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="glass-card p-4 rounded-xl flex items-center gap-4 border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Sub-Second Exposure Analysis</div>
                  <div className="text-xs text-[#929BAD]">Dynamic risk scoring and remediation playbooks</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#929BAD] border-t border-white/[0.06] pt-6">
            <span>Enterprise Security • ISO 27001 Ready</span>
            <span className="flex items-center gap-1.5 text-accent-green font-medium">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" /> All Systems Operational
            </span>
          </div>
        </div>

        {/* RIGHT HALF: Centered Glass Login Form Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/">
                <Logo size="lg" />
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-8 sm:p-10 rounded-2xl border border-white/10 bg-[#111827]/80 backdrop-blur-xl shadow-2xl relative"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
                <p className="text-sm text-[#929BAD] mt-2">
                  Sign in to access your security intelligence dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                  autoComplete="email"
                  autoFocus
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    icon={<Lock className="w-4 h-4" />}
                    error={errors.password}
                    autoComplete="current-password"
                  />
                  <div className="flex items-center justify-between mt-2.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-surface/80 text-[#A3FF6F] focus:ring-[#A3FF6F]/40 focus:ring-offset-0 focus:ring-1"
                      />
                      <span className="text-xs text-[#929BAD] hover:text-white transition-colors">Remember me</span>
                    </label>

                    <Link
                      to="/auth/forgot-password"
                      className="text-xs font-medium text-[#45D6FF] hover:text-[#A3FF6F] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="mt-2"
                >
                  Sign In
                </Button>
              </form>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#111827] px-3 text-[#929BAD] tracking-wider font-medium">or</span>
                </div>
              </div>

              <div className="text-center text-sm text-[#929BAD]">
                Don&apos;t have an account?{' '}
                <Link
                  to="/auth/signup"
                  className="font-semibold text-[#A3FF6F] hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-[#929BAD]/70 mt-8">
              Protected by military-grade encryption and automated intrusion detection.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
