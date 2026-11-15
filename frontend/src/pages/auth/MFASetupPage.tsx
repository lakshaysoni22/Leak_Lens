import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Copy,
  Check,
  Download,
  QrCode,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/shared/Logo';
import PageTransition from '@/components/shared/PageTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';

interface MFASetupResponse {
  secret: string;
  provisioning_uri: string;
  recovery_codes: string[];
}

const MFASetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const [setupData, setSetupData] = useState<MFASetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;
    async function fetchMFASetup() {
      try {
        const res = await api.post<MFASetupResponse>('/auth/mfa/setup');
        if (isMounted) {
          setSetupData(res.data);
        }
      } catch (err: any) {
        if (isMounted) {
          const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            'Failed to initialize MFA setup. Please check authentication status.';
          toast.error(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSetup(false);
        }
      }
    }

    fetchMFASetup();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopySecret = async () => {
    if (!setupData?.secret) return;
    try {
      await navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      toast.success('Secret key copied to clipboard');
      setTimeout(() => setCopiedSecret(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleCopyRecoveryCodes = async () => {
    if (!setupData?.recovery_codes) return;
    try {
      await navigator.clipboard.writeText(setupData.recovery_codes.join('\n'));
      setCopiedCodes(true);
      toast.success('Recovery codes copied to clipboard');
      setTimeout(() => setCopiedCodes(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleDownloadCodes = () => {
    if (!setupData?.recovery_codes) return;
    const content = `LEAKLENS 2FA RECOVERY CODES\nGenerated: ${new Date().toISOString()}\n\nKeep these codes in a safe, offline location. Each code can only be used once.\n\n${setupData.recovery_codes.join(
      '\n'
    )}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leaklens-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Recovery codes downloaded');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(undefined);

    const cleanCode = verificationCode.trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length < 6) {
      setErrorCode('Please enter a valid 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    try {
      await api.post('/auth/mfa/verify', { code: cleanCode });
      updateUser({ mfa_enabled: true });
      setIsCompleted(true);
      toast.success('Two-factor authentication enabled successfully!');
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Invalid verification code. Please check your authenticator and try again.';
      setErrorCode(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Set Up 2FA | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#080B12] text-[#F5F7FA] relative overflow-hidden">
        <ParticleBackground className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B7CFF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A3FF6F]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10 py-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#111827]/90 backdrop-blur-xl shadow-2xl"
          >
            {isLoadingSetup ? (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#45D6FF] mx-auto" />
                <p className="text-sm text-[#929BAD]">Generating MFA encryption keys...</p>
              </div>
            ) : !setupData ? (
              <div className="py-8 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-[#FF5A5A] mx-auto" />
                <h3 className="text-xl font-bold text-white">Setup Unavailable</h3>
                <p className="text-sm text-[#929BAD]">
                  Could not load MFA credentials. Please ensure your session is active.
                </p>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : !isCompleted ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF] mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Set up Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-[#929BAD] mt-1.5">
                    Protect your security workspace with an authenticator app (Google Authenticator, Authy, 1Password)
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Step 1: Provisioning URI / QR Code Placeholder */}
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-surface/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#A3FF6F] uppercase tracking-wider">
                      <QrCode className="w-4 h-4" /> Step 1: Scan or Import URI
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-xs break-all select-all text-[#929BAD]">
                      {setupData.provisioning_uri}
                    </div>
                    <p className="text-[11px] text-[#929BAD]/80">
                      Copy or open this URI directly in your preferred authenticator app.
                    </p>
                  </div>

                  {/* Step 2: Manual Secret Key */}
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-surface/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-semibold text-[#45D6FF] uppercase tracking-wider">
                        <KeyRound className="w-4 h-4" /> Step 2: Or enter key manually
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="inline-flex items-center gap-1.5 text-xs text-[#A3FF6F] hover:underline"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSecret ? 'Copied' : 'Copy Key'}
                      </button>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-sm tracking-widest text-center font-bold text-white select-all">
                      {setupData.secret}
                    </div>
                  </div>

                  {/* Step 3: Verification Code Form */}
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <Input
                        label="Step 3: Enter 6-digit confirmation code"
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        icon={<Lock className="w-4 h-4" />}
                        error={errorCode}
                        className="text-center tracking-widest font-mono text-lg"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isVerifying}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Verify & Enable 2FA
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              /* Success / Recovery Codes Stage */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#A3FF6F]/15 border border-[#A3FF6F]/40 flex items-center justify-center text-[#A3FF6F] shadow-[0_0_30px_rgba(163,255,111,0.2)] mb-3">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    2FA Successfully Enabled
                  </h3>
                  <p className="text-sm text-[#929BAD] mt-1.5 leading-relaxed">
                    Save these backup recovery codes now. If you lose access to your authenticator, each code can be used once to access your account.
                  </p>
                </div>

                {/* Recovery Codes Grid */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Backup Recovery Codes
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRecoveryCodes}
                      className="inline-flex items-center gap-1.5 text-xs text-[#A3FF6F] hover:underline"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCodes ? 'Copied' : 'Copy All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs text-center">
                    {setupData.recovery_codes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-surface/80 border border-white/5 text-[#F5F7FA] font-medium select-all"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={handleDownloadCodes}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download Codes (.txt)
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      toast.success('MFA Setup complete!');
                      navigate('/app/dashboard');
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    I've Saved These Codes
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

export default MFASetupPage;
