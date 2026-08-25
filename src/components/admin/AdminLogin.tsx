'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4 bg-[#F8F6F0]">
      <div className="w-full max-w-md bg-white border border-[#E5E0D8] rounded-[28px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#0C3823]" />

        <div className="text-center mb-8">
          <div className="relative h-12 w-44 mx-auto overflow-hidden mb-3">
            <Image
              src="/images/brand/qubtic-green.png"
              alt="Qubtic Studio"
              width={1672}
              height={941}
              priority
              className="h-[76px] w-44 max-w-none -translate-y-[16px] object-contain mx-auto"
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#0C3823] block mb-1">
            MANAGEMENT PORTAL
          </span>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#141915] font-heading">
            Admin Access
          </h1>
          <p className="text-xs text-[#666C64] mt-2">
            Sign in to manage projects, services, pricing, blog posts, and site customizations.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
              Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#666C64]" />
              <input
                type="text"
                required
                placeholder="name@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#141915] placeholder:text-[#666C64]/60 focus:outline-none focus:border-[#0C3823] focus:ring-3 focus:ring-[#0C3823]/15 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#666C64]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#141915] focus:outline-none focus:border-[#0C3823] focus:ring-3 focus:ring-[#0C3823]/15 transition-all duration-200"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full justify-center bg-[#0C3823] text-white hover:bg-[#164E33] py-3.5 font-bold"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
