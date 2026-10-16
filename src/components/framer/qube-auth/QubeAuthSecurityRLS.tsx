'use client';

import * as React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Copy, 
  AlertTriangle 
} from 'lucide-react';

export function QubeAuthSecurityRLS() {
  const [activeSchemaTab, setActiveSchemaTab] = React.useState<'subscriptions' | 'profiles'>('subscriptions');
  const [copiedSchema, setCopiedSchema] = React.useState(false);

  const subscriptionsSql = `-- ==============================================================================
-- QUBE AUTH: Subscriptions Schema & Row Level Security (RLS)
-- Run this in your Supabase SQL Editor to manage Stripe / Polar subscriptions
-- ==============================================================================

create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  tier text not null default 'starter', -- e.g. 'starter', 'pro', 'enterprise'
  provider text not null default 'stripe', -- 'stripe' or 'polar'
  customer_id text,
  subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable PostgreSQL Row Level Security (MANDATORY)
alter table public.subscriptions enable row level security;

-- Policy 1: Members can read ONLY their own subscription records
create policy "Users can view own subscription" 
  on public.subscriptions 
  for select 
  using (auth.uid() = user_id);

-- Policy 2: Prevent client-side updates (only webhook service-role can mutate)
create policy "Prevent client mutations" 
  on public.subscriptions 
  for all 
  using (false);`;

  const profilesSql = `-- ==============================================================================
-- QUBE AUTH: Member Profiles Schema & Row Level Security (RLS)
-- Automatically synchronizes with auth.users and supports user metadata
-- ==============================================================================

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  company text,
  role text default 'member',
  metadata jsonb default '{}'::jsonb,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy 1: Authenticated users can view their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy 2: Authenticated users can update their own display metadata
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger: Automatically create public.profiles entry upon user sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`;

  const handleCopySchema = () => {
    const code = activeSchemaTab === 'subscriptions' ? subscriptionsSql : profilesSql;
    navigator.clipboard.writeText(code);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const comparisonRows = [
    {
      feature: 'Data Storage',
      qube: '100% in your own PostgreSQL / Supabase',
      widget: 'Third-party shared multi-tenant database',
      highlight: true,
    },
    {
      feature: 'API Keys Permitted',
      qube: 'Publishable / Anon keys only (Client Safe)',
      widget: 'Often requests secret tokens in client config',
      highlight: false,
    },
    {
      feature: 'Row Level Security (RLS)',
      qube: 'Full PostgreSQL database RLS policies',
      widget: 'Client-only JS hiding (easily bypassed in DevTools)',
      highlight: true,
    },
    {
      feature: 'PKCE Authorization',
      qube: 'Standard RFC-7636 PKCE token exchange',
      widget: 'Legacy implicit token grant / URL fragments',
      highlight: false,
    },
    {
      feature: 'Token Storage Strategy',
      qube: 'Configurable: localStorage (Remember Me) or sessionStorage',
      widget: 'Insecure cookie dumps or third-party cookies',
      highlight: false,
    },
    {
      feature: 'Payment Verification',
      qube: 'Verified server webhooks to database tables',
      widget: 'Unverified client URL parameters',
      highlight: true,
    },
  ];

  return (
    <section id="security" className="qube-section">
      <div className="qube-container">
        
        {/* Section Header */}
        <div className="qube-section-header center">
          <span className="qube-section-tag">
            <ShieldCheck size={14} />
            ZERO-TRUST SECURITY ARCHITECTURE
          </span>
          <h2 className="qube-section-title">
            Enterprise Security <br />
            <span className="qube-text-gradient">By Design</span>
          </h2>
          <p className="qube-section-desc">
            No middleman servers, no proxy cookies, and no black boxes. See why security-conscious founders choose direct database ownership.
          </p>
        </div>

        {/* COMPARISON TABLE */}
        <div className="qube-security-table-card">
          <table className="qube-security-table">
            <thead>
              <tr>
                <th>Security Feature</th>
                <th className="accent">Qube Auth Standard</th>
                <th>Typical Widget Plugins</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature}>
                  <td className="qube-cell-feature">{row.feature}</td>
                  <td className="qube-cell-accent">
                    <span className="qube-cell-badge">
                      <Check size={16} />
                      <span>{row.qube}</span>
                    </span>
                  </td>
                  <td className="qube-cell-widget">
                    <span className="qube-cell-badge">
                      <X size={16} />
                      <span>{row.widget}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RLS DEEP DIVE & SQL SCHEMAS */}
        <div className="qube-security-layout">
          
          {/* Why RLS Matters Callout */}
          <div className="qube-security-callout">
            <div>
              <div className="qube-callout-tag">
                <Lock size={14} />
                <span>Why Framer Gating Requires RLS</span>
              </div>

              <h3 className="qube-card-title">
                Client Visual Gates vs Database Row Level Security
              </h3>

              <p className="qube-card-desc">
                In all modern web frameworks (including Framer), static HTML, CSS, and client-side JavaScript bundles are delivered to the browser. While <code>PaywallGuard</code> and <code>AuthGuard</code> provide sleek presentation gates, true protection of proprietary assets, files, APIs, and databases is enforced by PostgreSQL Row Level Security (RLS).
              </p>

              <div className="qube-security-alert">
                <AlertTriangle size={16} />
                <div>
                  <strong className="qube-alert-title">Zero Data Leakage:</strong>
                  <span>Even if an attacker tampers with browser JavaScript or inspects DOM elements, they cannot read unowned database rows without authentic Supabase JWT authorization tokens.</span>
                </div>
              </div>
            </div>

            <div className="qube-callout-footer">
              <span>Ready-to-deploy SQL Schemas</span>
              <span className="qube-callout-footer-action">1-Click Copy</span>
            </div>
          </div>

          {/* SQL Editor Terminal */}
          <div className="qube-sql-terminal">
            
            {/* Terminal Header & Schema Tabs */}
            <div className="qube-terminal-header">
              <div className="qube-terminal-tabs">
                <button
                  type="button"
                  onClick={() => setActiveSchemaTab('subscriptions')}
                  className={`qube-terminal-tab-btn ${activeSchemaTab === 'subscriptions' ? 'active' : ''}`}
                >
                  subscriptions.sql
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSchemaTab('profiles')}
                  className={`qube-terminal-tab-btn ${activeSchemaTab === 'profiles' ? 'active' : ''}`}
                >
                  profiles.sql
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopySchema}
                className="qube-terminal-copy-btn"
              >
                {copiedSchema ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL for Supabase'}</span>
              </button>
            </div>

            {/* Code Body */}
            <pre className="qube-terminal-code">
              {activeSchemaTab === 'subscriptions' ? subscriptionsSql : profilesSql}
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
}
