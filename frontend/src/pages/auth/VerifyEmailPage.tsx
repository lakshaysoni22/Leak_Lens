import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Logo from '@/components/shared/Logo';
import PageTransition from '@/components/shared/PageTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { updateUser, isAuthenticated } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Verification token is missing from the URL.');
        }
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        if (isMounted) {
          setStatus('success');
          updateUser({ is_verified: true });
          toast.success('Email successfully verified!');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            'Email verification failed. The link may have expired or is invalid.';
          setErrorMessage(msg);
        }
      }
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token, updateUser]);

  return (
    <PageTransition>
      <Helmet>
        <title>Verify Email | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#080B12] text-[#F5F7FA] relative overflow-hidden">
        <ParticleBackground className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#A3FF6F]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#45D6FF]/10 rounded-full blur-[120px] pointer-events-none" />

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
            className="glass-card p-8 sm:p-10 rounded-2xl border border-white/10 bg-[#111827]/85 backdrop-blur-xl shadow-2xl text-center"
          >
            {status === 'loading' && (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#45D6FF]/15 border border-[#45D6FF]/30 flex items-center justify-center text-[#45D6FF]">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Verifying your email...</h3>
                  <p className="text-sm text-[#929BAD] mt-1.5">
                    Validating cryptographic security signature with server
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="py-4 space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-16 h-16 mx-auto rounded-full bg-[#A3FF6F]/15 border border-[#A3FF6F]/40 flex items-center justify-center text-[#A3FF6F] shadow-[0_0_30px_rgba(163,255,111,0.2)]"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Email Verified!</h3>
                  <p className="text-sm text-[#929BAD] mt-2 leading-relaxed">
                    Your email address has been authenticated. Your account now has full access to automated threat monitoring and alerts.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate(isAuthenticated ? '/app/dashboard' : '/auth/login')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Proceed to Sign In'}
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="py-4 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FF5A5A]/15 border border-[#FF5A5A]/30 flex items-center justify-center text-[#FF5A5A] shadow-[0_0_30px_rgba(255,90,90,0.2)]">
                  <XCircle className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Verification Failed</h3>
                  <p className="text-sm text-[#FF5A5A]/90 mt-2 leading-relaxed">
                    {errorMessage}
                  </p>
                  <p className="text-xs text-[#929BAD] mt-2">
                    Verification links are valid for 24 hours. You can request a fresh link by signing in.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => window.location.reload()}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Retry
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate('/auth/login')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default VerifyEmailPage;
