import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle2, AlertTriangle, Check, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/shared/Logo';
import PageTransition from '@/components/shared/PageTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  // Password criteria evaluation
  const passwordCriteria = useMemo(() => {
    return [
      { id: 'length', label: 'At least 8 characters', met: newPassword.length >= 8 },
      { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
      { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
      { id: 'number', label: 'One number', met: /[0-9]/.test(newPassword) },
    ];
  }, [newPassword]);

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
    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (metCount < 3) {
      errs.newPassword = 'Password must satisfy at least 3 security criteria';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token) {
      toast.error('Invalid or missing password reset token.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      setIsSuccess(true);
      toast.success('Password successfully reset!');
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to reset password. The token may have expired.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Reset Password | LeakLens - Cyber Exposure & Intelligence</title>
      </Helmet>

      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#080B12] text-[#F5F7FA] relative overflow-hidden">
        <ParticleBackground className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#8B7CFF]/10 rounded-full blur-[120px] pointer-events-none" />
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
            className="glass-card p-8 sm:p-10 rounded-2xl border border-white/10 bg-[#111827]/85 backdrop-blur-xl shadow-2xl"
          >
            {!token ? (
              <div className="text-center py-4 space-y-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#FF5A5A]/15 border border-[#FF5A5A]/30 flex items-center justify-center text-[#FF5A5A]">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Invalid Reset Link</h3>
                  <p className="text-sm text-[#929BAD] mt-2">
                    The reset link is missing a valid security token. Please request a new password reset email.
                  </p>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/auth/forgot-password')}
                >
                  Request Reset Link
                </Button>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-4 space-y-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#A3FF6F]/15 border border-[#A3FF6F]/40 flex items-center justify-center text-[#A3FF6F]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Password Updated</h3>
                  <p className="text-sm text-[#929BAD] mt-2">
                    Your password has been successfully reset. You can now sign in with your new credentials.
                  </p>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/auth/login')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Set new password</h2>
                  <p className="text-sm text-[#929BAD] mt-1.5">
                    Choose a strong, unique password for your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      icon={<Lock className="w-4 h-4" />}
                      error={errors.newPassword}
                      autoFocus
                    />

                    {/* Password Strength Meter */}
                    {newPassword.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#929BAD]">Strength:</span>
                          <span className={`font-semibold ${strengthColor.text}`}>
                            {strengthColor.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${strengthColor.bar}`}
                            style={{ width: `${(metCount / 4) * 100}%` }}
                          />
                        </div>
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

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    icon={<Lock className="w-4 h-4" />}
                    error={errors.confirmPassword}
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
                    Reset Password
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-[#929BAD] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to sign in</span>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPasswordPage;
