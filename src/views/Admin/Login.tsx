"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';

type DevelopmentCredentials = {
  email: string;
  password: string;
};

export function AdminLogin({ developmentCredentials }: { developmentCredentials?: DevelopmentCredentials }) {
  const [email, setEmail] = useState(developmentCredentials?.email ?? '');
  const [password, setPassword] = useState(developmentCredentials?.password ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(email, password);
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-grey flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-10 mt-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading text-brand-charcoal mb-2">Admin Panel</h1>
          <p className="text-slate-500 font-light">Sign in to manage content</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 mb-6 border border-red-100 rounded-sm text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-slate-300 py-3 bg-transparent focus:outline-none focus:border-brand-champagne transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-slate-300 py-3 bg-transparent focus:outline-none focus:border-brand-champagne transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
