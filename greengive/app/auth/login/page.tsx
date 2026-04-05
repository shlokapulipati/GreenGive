'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('URL')) {
        setError('Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
      } else {
        setError(err.message || 'Login failed. Check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-teal-brand/5 rounded-full blur-[80px] pointer-events-none" />

      <Link href="/" className="flex items-center gap-2 mb-12">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M4 19H20" stroke="#f0d080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 19V5C7 4.44772 7.44772 4 8 4H10C10.5523 4 11 4.44772 11 5V19" fill="#c9a84c"/>
          <path d="M11 5L15 7L11 9V5Z" fill="#f0d080"/>
        </svg>
        <span className="font-syne font-bold text-2xl tracking-tight text-white">
          <span className="text-gold-light">Green</span>Give
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-ink-2 border border-white/5 rounded-2xl p-8 shadow-2xl">
          <h1 className="font-syne text-3xl font-black text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Log in to your GreenGive account</p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-ink-3 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-gold hover:text-gold-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-ink-3 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-ink font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Logging in...' : 'Log in →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-gold hover:text-gold-light font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Join 3,840 golfers competing, winning &amp; giving back every month.
        </p>
      </motion.div>
    </div>
  );
}
