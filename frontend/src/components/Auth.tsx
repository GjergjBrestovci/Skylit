import { useState } from 'react';
import { Logo } from './ui/Logo';
import { apiClient } from '../utils/apiClient';

interface AuthProps {
  onAuthSuccess: (token: string) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const data = await apiClient.post(endpoint, { email, password });
      
      if (isLogin) {
        // Login success - store tokens and notify parent
        localStorage.setItem('authToken', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        onAuthSuccess(data.token);
      } else {
        // Registration success - check if email confirmation is required
        if (data.emailConfirmationRequired) {
          setSuccess(data.message);
          // Don't auto-login, wait for email confirmation
        } else {
          // Auto-confirm enabled, proceed with login
          localStorage.setItem('authToken', data.token);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          onAuthSuccess(data.token);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 text-slate-900 dark:bg-[#0d0d0d] dark:text-white transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl p-8 bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.25)] dark:bg-[#1e1e1e] dark:border-accent-purple/20 dark:shadow-glass-xl transition-all duration-300">
        <div className="text-center mb-6 space-y-3">
          <Logo size={56} withText className="mx-auto justify-center" textSizeClass="text-3xl" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{isLogin ? 'Sign In' : 'Create Account'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full p-3 rounded-md text-sm bg-white/70 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/30 dark:bg-[#232323] dark:border-accent-purple/30 dark:text-white dark:placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full p-3 rounded-md text-sm bg-white/70 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/30 dark:bg-[#232323] dark:border-accent-purple/30 dark:text-white dark:placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-md text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-md text-emerald-600 dark:text-emerald-400 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-slate-900 dark:text-background font-semibold py-3 px-4 shadow-[0_12px_30px_-15px_rgba(56,189,248,0.8)] hover:from-accent-cyan/90 hover:to-accent-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-purple/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
            }}
            className="text-accent-purple hover:text-accent-purple/80 text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
