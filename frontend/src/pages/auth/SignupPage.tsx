import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, AtSign, ArrowRight, ShieldCheck, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User, AuthTokens } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/shared/Logo';
import PageTransition from '@/components/shared/PageTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    username?: string;
    password?: string;
    terms?: string;
  }>({});

  // Password criteria evaluation
  const passwordCriteria = useMemo(() => {
    return [
      { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
      { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { id: 'number', label: 'One number', met: /[0-9]/.test(password) },
    ];
  }, [password]);

  const metCount = useMemo(() => {
    return passwordCriteria.filter((c) => c.met).length;
  }, [passwordCriteria]);

  const strengthColor = useMemo(() => {
    if (metCount <= 1) return { bar: 'bg-[#FF5A5A]', text: 'text-[#FF5A5A]', label: 'Weak' };
    if (metCount === 2) return { bar: 'bg-[#FFB547]', text: 'text-[#FFB547]', label: 'Fair' };
    if (metCount === 3) return { bar: 'bg-[#FFE066]', text: 'text-[#FFE066]', label: 'Good' };
    return { bar: 'bg-[#A3FF6F]', text: 'text-[#A3FF6F]', label: 'Strong' };
  }, [metCount]);

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      errs.username = 'Username must be 3-30 alphanumeric characters or underscores';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (metCount < 3) {
      errs.password = 'Please create a stronger password meeting the criteria';
    }
    if (!acceptTerms) {
      errs.terms = 'You must accept the Terms of Service to continue';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await api.post<AuthTokens>('/auth/register', {
        email: email.trim(),
        username: username.trim(),
        password,
        full_name: fullName.trim(),
        accept_terms: true,
      });

      const data = response.data;

      // Populate User object from tokens/register response
      const user: User = {
        id: data.user_id,
        email: data.email || email.trim(),
        username: username.trim(),
        full_name: data.full_name || fullName.trim(),
        role: (data.role as User['role']) || 'user',
        is_active: true,
        is_verified: data.is_verified ?? false,
        mfa_enabled: false,
        created_at: new Date().toISOString(),
      };

      setAuth(user, data.access_token);
      toast.success('Account created! Welcome to LeakLens.');
      navigate('/app/dashboard');
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Sign Up | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="min-h-screen w-full flex bg-[#080B12] text-[#F5F7FA] overflow-hidden">
        {/* LEFT HALF: Decorative Branding & Value Props (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#0D1220] flex-col justify-between p-12 overflow-hidden border-r border-white/[0.08]">
          <ParticleBackground className="absolute inset-0 z-0 pointer-events-none opacity-40" />

          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#45D6FF]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A3FF6F]/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-block">
              <Logo size="lg" />
            </Link>
          </div>

          {/* Center Brand Hero */}
          <div className="relative z-10 max-w-lg my-auto space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#45D6FF]/10 border border-[#45D6FF]/30 text-xs font-semibold text-[#45D6FF] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Start Free Today
              </div>
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-[#45D6FF] via-[#A3FF6F] to-[#8B7CFF] bg-clip-text text-transparent">
                  Exposure Footprint.
                </span>
              </h1>
              <p className="text-base text-[#929BAD] leading-relaxed">
                Join thousands of security professionals and proactive teams discovering data breaches and protecting exposed accounts before adversaries strike.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass-card p-4 rounded-xl flex items-center gap-4 border border-white/10 bg-white/[0.03] backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-lg bg-[#A3FF6F]/15 border border-[#A3FF6F]/30 flex items-center justify-center text-[#A3FF6F]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Proactive Breach Alerts</div>
                  <div className="text-xs text-[#929BAD]">Instant notification when your assets appear in leaks</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="glass-card p-4 rounded-xl flex items-center gap-4 border border-white/10 bg-white/[0.03] backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-lg bg-[#45D6FF]/15 border border-[#45D6FF]/30 flex items-center justify-center text-[#45D6FF]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Full-Spectrum Reconnaissance</div>
                  <div className="text-xs text-[#929BAD]">Deep scanning for emails, usernames, domains, and URLs</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#929BAD] border-t border-white/[0.06] pt-6">
            <span>No credit card required • Free tier included</span>
            <span className="text-[#A3FF6F] font-medium">99.9% Uptime SLA</span>
          </div>
        </div>

        {/* RIGHT HALF: Form Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-md py-6">
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
                <p className="text-sm text-[#929BAD] mt-1.5">
                  Start monitoring your organization's exposure
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  icon={<UserIcon className="w-4 h-4" />}
                  error={errors.fullName}
                  autoComplete="name"
                />

                <Input
                  label="Work Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@organization.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                  autoComplete="email"
                />

                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="janedoe"
                  icon={<AtSign className="w-4 h-4" />}
                  error={errors.username}
                  autoComplete="username"
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    icon={<Lock className="w-4 h-4" />}
                    error={errors.password}
                    autoComplete="new-password"
                  />

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#929BAD]">Strength:</span>
                        <span className={`font-semibold ${strengthColor.text}`}>
                          {strengthColor.label}
                        </span>
                      </div>

                      {/* Visual Strength Bar */}
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${strengthColor.bar}`}
                          style={{ width: `${(metCount / 4) * 100}%` }}
                        />
                      </div>

                      {/* Criteria Checklist */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {passwordCriteria.map((c) => (
                          <div
                            key={c.id}
                            className={`flex items-center gap-1.5 text-[11px] ${
                              c.met ? 'text-[#A3FF6F]' : 'text-[#929BAD]/70'
                            }`}
                          >
                            {c.met ? (
                              <Check className="w-3 h-3 shrink-0" />
                            ) : (
                              <X className="w-3 h-3 shrink-0 text-[#929BAD]/40" />
                            )}
                            <span>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms Acceptance */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-surface/80 text-[#A3FF6F] focus:ring-[#A3FF6F]/40 focus:ring-offset-0 focus:ring-1 shrink-0"
                    />
                    <span className="text-xs text-[#929BAD] leading-normal">
                      I accept the{' '}
                      <a href="#" className="text-[#45D6FF] hover:underline" onClick={(e) => e.preventDefault()}>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-[#45D6FF] hover:underline" onClick={(e) => e.preventDefault()}>
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-[#FF5A5A] mt-1 pl-6">{errors.terms}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="mt-4"
                >
                  Create Account
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#111827] px-3 text-[#929BAD] tracking-wider font-medium">or</span>
                </div>
              </div>

              <div className="text-center text-sm text-[#929BAD]">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="font-semibold text-[#A3FF6F] hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SignupPage;
