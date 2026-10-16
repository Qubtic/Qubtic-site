'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Lock,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Mail,
  User,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react';
import { getPluginMetadata, FramerPluginMetadata } from '@/lib/plugins-registry';
import '@/styles/qubtic-auth.css';

interface QubticFramerAuthPortalProps {
  initialPlugin?: string;
}

export default function QubticFramerAuthPortal({ initialPlugin }: QubticFramerAuthPortalProps) {
  const searchParams = useSearchParams();
  const pluginParam = searchParams.get('plugin') || initialPlugin || 'qube-auth';
  const returnUrlParam = searchParams.get('return_url') || searchParams.get('redirect_uri') || '';
  const framerProjectId = searchParams.get('project') || searchParams.get('project_id') || '';
  const framerUserId = searchParams.get('framer_user') || searchParams.get('user_id') || '';

  const [plugin, setPlugin] = useState<FramerPluginMetadata>(() => getPluginMetadata(pluginParam));
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'magic'>('signin');

  // Dual theme state engine (supports light and dark modes)
  const themeParam = searchParams.get('theme');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (themeParam === 'light' || themeParam === 'dark') {
      setTheme(themeParam);
      return;
    }
    try {
      const savedTheme = localStorage.getItem('qubtic-auth-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        return;
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, [themeParam]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('qubtic-auth-theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{
    token: string;
    sessionCode: string;
    user: {
      id: string;
      email: string;
      name?: string;
      plan: string;
      plugin_slug: string;
    };
    isNew: boolean;
  } | null>(null);

  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [isHandshakeSent, setIsHandshakeSent] = useState(false);

  // Sync plugin if param changes
  useEffect(() => {
    setPlugin(getPluginMetadata(pluginParam));
  }, [pluginParam]);

  // Handle postMessage handshake when successData is set
  useEffect(() => {
    if (!successData) return;

    // Send postMessage to opener (Framer plugin modal/window)
    const payload = {
      type: 'QUBTIC_AUTH_SUCCESS',
      source: 'qubtic-auth-portal',
      plugin: plugin.slug,
      token: successData.token,
      sessionCode: successData.sessionCode,
      user: successData.user,
      timestamp: Date.now(),
    };

    let sent = false;
    try {
      if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
        window.opener.postMessage(payload, '*');
        sent = true;
      }
    } catch (e) {
      console.warn('Could not postMessage to window.opener:', e);
    }

    setIsHandshakeSent(sent);

    // Countdown to auto-close or redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (returnUrlParam) {
            const redirectUrl = new URL(returnUrlParam, window.location.origin);
            redirectUrl.searchParams.set('token', successData.token);
            redirectUrl.searchParams.set('email', successData.user.email);
            window.location.href = redirectUrl.toString();
          } else if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
            window.close();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [successData, plugin.slug, returnUrlParam]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (activeTab !== 'magic' && (!password || password.length < 6)) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/framer-auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || email.split('@')[0],
          mode: activeTab,
          plugin: plugin.slug,
          framerUserId,
          framerProjectId,
          plan: 'pro',
          metadata: {
            sourceTab: activeTab,
            rememberMe,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccessData({
        token: data.token,
        sessionCode: data.sessionCode,
        user: data.user,
        isNew: data.isNew,
      });
      setIsLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error connecting to Qubtic Auth.');
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'token' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="qubtic-auth-page" data-theme={theme} suppressHydrationWarning>
      {/* Dynamic Animated Ambient Background Effects (Pure CSS) */}
      <div className="qubtic-auth-bg-layer">
        <div className="qubtic-auth-orb-primary" />
        <div className="qubtic-auth-orb-secondary" />
        <div className="qubtic-auth-orb-center" />
        <div className="qubtic-auth-grid-overlay" />
      </div>

      {/* Top Bar with Theme Toggle */}
      <div className="qubtic-auth-top-bar">
        <button
          type="button"
          onClick={toggleTheme}
          className="qubtic-auth-theme-toggle"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Top Spacer to balance vertical centering */}
      <div className="qubtic-auth-spacer" />

      {/* Main Glassmorphic Form Card */}
      <main className="qubtic-auth-main">
        <div className="qubtic-auth-card">
          {!successData ? (
            /* --- STATE 1: AUTHENTICATION FORM --- */
            <div>
              {/* Plugin Header: Logo & Title only */}
              <div className="qubtic-auth-header">
                <div className="qubtic-auth-logo-box">
                  <Image
                    src={plugin.logo}
                    alt={plugin.name}
                    width={36}
                    height={36}
                    className="qubtic-auth-logo-img"
                  />
                </div>
                <h1 className="qubtic-auth-title">
                  {plugin.name}
                </h1>
              </div>

              {/* Framer Project Pill if present */}
              {framerProjectId && (
                <div className="qubtic-auth-project-pill">
                  <span className="qubtic-auth-project-pulse" />
                  <span>Target Canvas:</span>
                  <span className="qubtic-auth-project-name">{framerProjectId}</span>
                </div>
              )}

              {/* Switcher Tabs */}
              <div className="qubtic-auth-tabs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage('');
                  }}
                  className={`qubtic-auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage('');
                  }}
                  className={`qubtic-auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('magic');
                    setErrorMessage('');
                  }}
                  className={`qubtic-auth-tab ${activeTab === 'magic' ? 'active' : ''}`}
                >
                  Magic Link
                </button>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="qubtic-auth-error">
                  <AlertCircle className="qubtic-auth-error-icon" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="qubtic-auth-form">
                {/* Name field (for Sign Up) */}
                {activeTab === 'signup' && (
                  <div className="qubtic-auth-group">
                    <label htmlFor="qubtic-auth-name" className="qubtic-auth-label">
                      Full Name
                    </label>
                    <div className="qubtic-auth-input-wrapper">
                      <User className="qubtic-auth-input-icon" />
                      <input
                        id="qubtic-auth-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="qubtic-auth-input"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="qubtic-auth-group">
                  <label htmlFor="qubtic-auth-email" className="qubtic-auth-label">
                    Email Address
                  </label>
                  <div className="qubtic-auth-input-wrapper">
                    <Mail className="qubtic-auth-input-icon" />
                    <input
                      id="qubtic-auth-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="qubtic-auth-input"
                    />
                  </div>
                </div>

                {/* Password (if not magic link) */}
                {activeTab !== 'magic' && (
                  <div className="qubtic-auth-group">
                    <div className="qubtic-auth-label-row">
                      <label htmlFor="qubtic-auth-password" className="qubtic-auth-label">
                        Password
                      </label>
                      {activeTab === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('magic')}
                          className="qubtic-auth-magic-link-btn"
                        >
                          Use passwordless OTP
                        </button>
                      )}
                    </div>
                    <div className="qubtic-auth-input-wrapper">
                      <Lock className="qubtic-auth-input-icon" />
                      <input
                        id="qubtic-auth-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="qubtic-auth-input has-eye"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="qubtic-auth-eye-btn"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me */}
                <label className="qubtic-auth-checkbox-row">
                  <input
                    id="qubtic-auth-remember"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="qubtic-auth-checkbox"
                  />
                  <span>Stay signed in to Framer</span>
                </label>

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="qubtic-auth-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="qubtic-auth-spinner" />
                      <span>Verifying with Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {activeTab === 'signin'
                          ? `Sign In to ${plugin.name}`
                          : activeTab === 'signup'
                          ? `Create Account & Connect`
                          : `Send Magic Link`}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* --- STATE 2: SUCCESS & HANDSHAKE VIEW --- */
            <div className="qubtic-auth-success">
              <div className="qubtic-auth-success-badge">
                <CheckCircle2 className="qubtic-auth-success-badge-icon" />
              </div>

              <h2 className="qubtic-auth-success-title">
                Authentication Successful!
              </h2>
              <p className="qubtic-auth-success-desc">
                Connected to {plugin.name} as{' '}
                <span className="qubtic-auth-success-email">{successData.user.email}</span>.
              </p>

              {/* Handshake Status Box */}
              <div className="qubtic-auth-success-box">
                <div className="qubtic-auth-success-row">
                  <span className="qubtic-auth-success-label">Framer Marketplace Handshake:</span>
                  <span className="qubtic-auth-success-val">
                    <Check size={14} />
                    {isHandshakeSent ? 'Token Broadcast' : 'Session Ready'}
                  </span>
                </div>
                <div className="qubtic-auth-success-row">
                  <span className="qubtic-auth-success-label">Account Subscription Tier:</span>
                  <span className="qubtic-auth-plan-tag">
                    {successData.user.plan}
                  </span>
                </div>
              </div>

              {/* 6-Digit Manual Session Code (For Framer Plugin Fallback) */}
              <div className="qubtic-auth-pin-box">
                <div className="qubtic-auth-pin-header">
                  <span className="qubtic-auth-pin-title">
                    Manual 6-Digit Plugin Pin
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(successData.sessionCode, 'code')}
                    className="qubtic-auth-copy-btn"
                  >
                    {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copied' : 'Copy Pin'}</span>
                  </button>
                </div>
                <div className="qubtic-auth-pin-code">
                  {successData.sessionCode}
                </div>
                <p className="qubtic-auth-pin-hint">
                  If Framer did not auto-advance, paste this pin into your plugin interface.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="qubtic-auth-success-actions">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      if (window.opener && window.opener !== window) {
                        window.close();
                      } else if (returnUrlParam) {
                        window.location.href = returnUrlParam;
                      } else {
                        window.location.href = plugin.productUrl;
                      }
                    }
                  }}
                  className="qubtic-auth-submit-btn"
                >
                  <span>Return to Framer ({countdown}s)</span>
                  <ExternalLink size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(successData.token, 'token')}
                  className="qubtic-auth-btn-secondary"
                >
                  {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedToken ? 'Auth Token Copied!' : 'Copy Full Bearer Session Token'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="qubtic-auth-footer">
        <div className="qubtic-auth-footer-links">
          <Link href="/privacy-policy" className="qubtic-auth-footer-link">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms-of-service" className="qubtic-auth-footer-link">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/framer/qube-auth/docs" className="qubtic-auth-footer-link">
            Plugin API Docs
          </Link>
        </div>
        <p className="qubtic-auth-footer-copy" suppressHydrationWarning>
          © {new Date().getFullYear()} Qubtic Technologies. External auth backend for Framer.
        </p>
      </footer>
    </div>
  );
}
