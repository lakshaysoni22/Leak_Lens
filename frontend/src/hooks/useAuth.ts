import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { User, LoginPayload, RegisterPayload } from '@/types';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginPayload | { email: string; password: string }): Promise<User> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/auth/login', credentials);
        const data = response.data?.data ?? response.data;

        const accessToken = data.access_token || data.token;
        if (!accessToken) {
          throw new Error('No access token returned from server');
        }

        const authenticatedUser: User = data.user || {
          id: data.user_id || `user_${Date.now()}`,
          email: data.email || credentials.email,
          username: data.username || credentials.email.split('@')[0],
          full_name: data.full_name || '',
          role: data.role || 'user',
          is_active: true,
          is_verified: data.is_verified ?? false,
          mfa_enabled: data.mfa_required ?? false,
          created_at: new Date().toISOString(),
        };

        setAuth(authenticatedUser, accessToken);
        return authenticatedUser;
      } catch (err: unknown) {
        const errMessage =
          (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.detail ??
          (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.message ??
          (err as Error)?.message ??
          'Failed to sign in. Please check your credentials.';

        setError(errMessage);
        throw new Error(errMessage);
      } finally {
        setLoading(false);
      }
    },
    [setAuth]
  );

  const signup = useCallback(
    async (payload: RegisterPayload): Promise<User | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/auth/register', payload);
        const data = response.data?.data ?? response.data;

        // If backend automatically returns tokens upon registration
        if (data.access_token) {
          const newUser: User = data.user || {
            id: data.user_id || `user_${Date.now()}`,
            email: data.email || payload.email,
            username: payload.username,
            full_name: payload.full_name,
            role: 'user',
            is_active: true,
            is_verified: false,
            mfa_enabled: false,
            created_at: new Date().toISOString(),
          };
          setAuth(newUser, data.access_token);
          return newUser;
        }

        return data.user ?? null;
      } catch (err: unknown) {
        const errMessage =
          (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.detail ??
          (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.message ??
          (err as Error)?.message ??
          'Registration failed. Please try again.';

        setError(errMessage);
        throw new Error(errMessage);
      } finally {
        setLoading(false);
      }
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout to guarantee client teardown
    } finally {
      clearAuth();
      setLoading(false);
    }
  }, [clearAuth]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
  };
}

export default useAuth;
