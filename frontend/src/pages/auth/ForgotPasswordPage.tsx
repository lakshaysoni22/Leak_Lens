import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/shared/Logo';
import PageTransition from '@/components/shared/PageTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setIsSubmitted(true);
      toast.success('Password reset instructions sent');
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Unable to process reset request. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Forgot Password | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#080B12] text-[#F5F7FA] relative overflow-hidden">
        <ParticleBackground className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#45D6FF]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#A3FF6F]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="flex justify-center mb-8">
            <Link to="/">
              <Logo size="lg" />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-8 sm:p-10 rounded-2xl border border-white/10 bg-[#111827]/85 backdrop-blur-xl shadow-2xl"
          >
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Reset your password</h2>
                  <p className="text-sm text-[#929BAD] mt-2 leading-relaxed">
                    Enter the email associated with your account and we'll send you a secure verification link to reset your password.
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
                    error={error}
                    autoFocus
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="mt-2"
                  >
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#A3FF6F]/15 border border-[#A3FF6F]/40 flex items-center justify-center text-[#A3FF6F]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Check your email</h3>
                  <p className="text-sm text-[#929BAD] leading-relaxed">
                    We've dispatched password reset instructions to{' '}
                    <span className="font-semibold text-white">{email}</span>.
                  </p>
                </div>

                <p className="text-xs text-[#929BAD]/80">
                  Didn't receive an email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="text-[#45D6FF] hover:underline font-medium"
                  >
                    try another email
                  </button>
                  .
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-[#929BAD] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
