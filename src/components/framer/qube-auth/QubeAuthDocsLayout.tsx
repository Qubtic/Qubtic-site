'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Menu, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QubeAuthInstallModal } from './QubeAuthInstallModal';

const docNavigation = [
  {
    group: 'Getting Started',
    items: [
      { title: 'Overview & Architecture', href: '#overview' },
      { title: 'Quick Start (3-Minute Setup)', href: '#quickstart' },
      { title: 'Zero-Trust Security & RLS', href: '#security' },
    ],
  },
  {
    group: 'Database & Supabase',
    items: [
      { title: 'Supabase Project Setup', href: '#supabase-setup' },
      { title: 'Subscriptions SQL Schema', href: '#sql-subscriptions' },
      { title: 'Member Profiles SQL Schema', href: '#sql-profiles' },
      { title: 'Row Level Security Policies', href: '#rls-policies' },
    ],
  },
  {
    group: 'Monetization & Webhooks',
    items: [
      { title: 'Stripe Configuration', href: '#stripe-setup' },
      { title: 'Polar.sh Configuration', href: '#polar-setup' },
      { title: 'PaywallGuard Integration', href: '#paywall-guard' },
      { title: 'Customer Billing Portals', href: '#billing-portals' },
    ],
  },
  {
    group: 'Authentication Flows',
    items: [
      { title: 'Passwordless Magic Links', href: '#magic-links' },
      { title: '6-Digit Email & SMS OTP', href: '#otp-flows' },
      { title: 'WebAuthn Biometric Passkeys', href: '#passkeys' },
      { title: 'Enterprise SAML 2.0 / SSO', href: '#enterprise-sso' },
    ],
  },
  {
    group: 'Component Reference',
    items: [
      { title: 'All 30+ Framer Components', href: '#components' },
      { title: 'Design Presets & Tokens', href: '#presets' },
      { title: 'Client Environment Variables', href: '#env-vars' },
    ],
  },
];

export function QubeAuthDocsLayout() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeSnippet(id);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070D09] text-white pt-24 sm:pt-28">
      
      {/* Top Docs Banner */}
      <div className="border-b border-white/10 bg-[#0C150F]/90 backdrop-blur-xl sticky top-20 sm:top-24 z-30">
        <div className="mx-auto flex max-w-[1720px] items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:bg-white/10"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link
              href="/framer/qube-auth"
              className="flex items-center gap-2 text-sm font-bold text-white hover:text-[#A6FF00] transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#142318] p-1 border border-[#A6FF00]/30">
                <Image
                  src="/images/qube-auth/qube-auth-logo.png"
                  alt="Qube Auth"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span>Qube Auth Docs</span>
              <span className="text-[10px] font-mono text-[#A6FF00] bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/20 hidden sm:inline">
                v1.0.0
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsInstallModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#A6FF00] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0C3823] hover:bg-[#b8ff26] transition-colors cursor-pointer shadow-sm shadow-[#A6FF00]/20"
            >
              <span>Install Plugin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1720px] px-4 sm:px-8">
        
        {/* Desktop Sidebar Navigation */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 transform bg-[#09110B] p-6 lg:static lg:block lg:w-80 lg:bg-transparent lg:p-8 lg:transform-none border-r border-white/10 overflow-y-auto no-scrollbar',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="mb-6 lg:hidden flex justify-between items-center">
            <span className="font-heading text-sm font-bold uppercase text-white">Documentation</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-white/60">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-9 pr-3 py-2 text-xs border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-hidden focus:border-[#A6FF00]"
            />
          </div>

          <nav className="space-y-6">
            {docNavigation.map((group) => (
              <div key={group.group}>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/40 block mb-2 px-3">
                  {group.group}
                </span>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.title}>
                      <a
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Documentation Article Content */}
        <main className="flex-1 min-w-0 py-8 sm:py-12 lg:px-12 max-w-4xl">
          
          {/* Overview */}
          <section id="overview" className="mb-16 scroll-mt-32">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A6FF00] block mb-2">
              GETTING STARTED
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
              Qube Auth Documentation
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6 font-normal">
              Qube Auth is the complete authentication, member management, and subscription monetization suite for Framer. Unlike generic auth widgets, Qube Auth connects directly to your own Supabase project, ensuring you retain 100% control and ownership over customer data and PostgreSQL tables.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 mb-8">
              <div>
                <span className="text-xs text-white/50 block font-mono">Database Target</span>
                <strong className="text-sm text-white">Your Supabase Project</strong>
              </div>
              <div>
                <span className="text-xs text-white/50 block font-mono">Payment Engines</span>
                <strong className="text-sm text-white">Stripe &amp; Polar.sh</strong>
              </div>
              <div>
                <span className="text-xs text-white/50 block font-mono">Bundle Payload</span>
                <strong className="text-sm text-[#A6FF00]">Zero External Dependencies</strong>
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section id="quickstart" className="mb-16 scroll-mt-32 border-t border-white/10 pt-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-4">
              Quick Start in 3 Minutes
            </h2>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Follow these three steps to deploy full authentication and paid member gating in your Framer project:
            </p>

            <ol className="space-y-6 mb-8">
              <li className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#A6FF00] text-[#0C3823] font-mono text-xs font-bold">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Install from Framer Marketplace</h3>
                  <p className="text-xs text-white/70 mt-1">
                    Inside your Framer editor, press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">Cmd + K</kbd> or <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">Ctrl + K</kbd>, search for <strong>&ldquo;Qube Auth&rdquo;</strong>, and launch the plugin.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#A6FF00] text-[#0C3823] font-mono text-xs font-bold">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Enter Your Supabase Credentials</h3>
                  <p className="text-xs text-white/70 mt-1">
                    Paste your HTTPS Supabase Project URL and your client-safe Publishable Key (or anon key). Click <strong>Test Connection</strong> to verify.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#A6FF00] text-[#0C3823] font-mono text-xs font-bold">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Click Install Library &amp; Drag to Canvas</h3>
                  <p className="text-xs text-white/70 mt-1">
                    The plugin generates <code className="text-[#A6FF00]">Qube-Auth.tsx</code> into your <strong>Assets &rarr; Code</strong> panel. Drag any auth card or paywall guard onto your canvas and publish!
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* Subscriptions SQL Schema */}
          <section id="sql-subscriptions" className="mb-16 scroll-mt-32 border-t border-white/10 pt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#A6FF00] block mb-1">
                  SUPABASE POSTGRESQL SCHEMA
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
                  Subscriptions Table &amp; RLS
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handleCopy('sub', `-- Subscriptions SQL
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  tier text not null default 'starter',
  provider text not null default 'stripe',
  customer_id text,
  subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" 
  on public.subscriptions for select using (auth.uid() = user_id);`)}
                className="flex items-center gap-1.5 text-xs text-[#A6FF00] hover:underline cursor-pointer"
              >
                {copiedCodeSnippet === 'sub' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeSnippet === 'sub' ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Execute this SQL in your Supabase project&apos;s SQL Editor. It creates the table queried by <code className="text-[#A6FF00]">PaywallGuard</code> and locks mutations down with Row Level Security.
            </p>

            <pre className="text-xs font-mono text-white/85 p-5 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto leading-relaxed">
{`create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  tier text not null default 'starter',
  provider text not null default 'stripe', -- 'stripe' or 'polar'
  customer_id text,
  subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (Mandatory)
alter table public.subscriptions enable row level security;

-- Members can only view their own record
create policy "Users can view own subscription" 
  on public.subscriptions 
  for select 
  using (auth.uid() = user_id);`}
            </pre>
          </section>

          {/* PaywallGuard */}
          <section id="paywall-guard" className="mb-16 scroll-mt-32 border-t border-white/10 pt-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-4">
              Using PaywallGuard on Framer Canvas
            </h2>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Wrap any canvas layer or component with <code className="text-[#A6FF00]">StripePaywallGuard</code> or <code className="text-[#A6FF00]">PolarPaywallGuard</code>. When a visitor is signed out or their subscription status is not <code className="text-[#A6FF00]">active</code> or <code className="text-[#A6FF00]">trialing</code>, the paywall card replaces the content.
            </p>

            <pre className="text-xs font-mono text-white/85 p-5 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto leading-relaxed mb-6">
{`import { StripePaywallGuard } from "./qube-auth";

export default function PremiumCourseSection() {
  return (
    <StripePaywallGuard
      requiredTier="pro" // "starter" | "pro" | "enterprise"
      fallbackTitle="Pro Membership Required"
      checkoutUrl="https://buy.stripe.com/..."
    >
      {/* Drop any video, download links, or private UI here */}
      <PrivateMemberContent />
    </StripePaywallGuard>
  );
}`}
            </pre>

            <div className="p-4 rounded-2xl bg-[#A6FF00]/10 border border-[#A6FF00]/25 text-xs text-white/85 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#A6FF00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#A6FF00] block mb-0.5">Automatic Access Re-check:</strong>
                <span>After completing checkout, users can click the built-in &ldquo;Check access again&rdquo; button to verify subscription status immediately without refreshing the page.</span>
              </div>
            </div>
          </section>

        </main>

      </div>

      {/* Install Modal */}
      <QubeAuthInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

    </div>
  );
}
