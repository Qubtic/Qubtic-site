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
  Building,
  Globe,
  KeyRound,
  Users,
  MailCheck,
  ArrowLeft,
} from 'lucide-react';
import { getPluginMetadata, FramerPluginMetadata } from '@/lib/plugins-registry';
import '@/styles/qubtic-auth.css';

export type AuthTab = 'signin' | 'signup' | 'otp' | 'reset' | 'teams';

interface QubticFramerAuthPortalProps {
  initialPlugin?: string;
}

/**
 * Validates and sanitizes a redirect URL.
 * Only allows safe relative paths or safe http/https URLs.
 * Strictly blocks javascript:, data:, vbscript:, etc.
 */
export function sanitizeRedirectUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Block javascript:, data:, vbscript:, and control characters
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return null;
  }

  // Safe relative paths starting with single '/' (not '//' protocol-relative)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Absolute URLs - must have valid http: or https: scheme
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    const host = parsed.hostname.toLowerCase();
    const isAllowedHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'qubtic.tech' ||
      host.endsWith('.qubtic.tech') ||
      host === 'framer.com' ||
      host.endsWith('.framer.com') ||
      host === 'framer.wiki' ||
      (typeof window !== 'undefined' && host === window.location.hostname);

    if (isAllowedHost) {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export default function QubticFramerAuthPortal({ initialPlugin }: QubticFramerAuthPortalProps) {
  const searchParams = useSearchParams();
  const pluginParam = searchParams.get('plugin') || initialPlugin || 'qube-auth';
  const returnUrlParam = searchParams.get('return_url') || searchParams.get('redirect_uri') || '';
  const framerProjectId = searchParams.get('project') || searchParams.get('project_id') || '';
  const framerUserId = searchParams.get('framer_user') || searchParams.get('user_id') || '';
  const codeParam = searchParams.get('code') || searchParams.get('user_code') || '';

  const [plugin, setPlugin] = useState<FramerPluginMetadata>(() => getPluginMetadata(pluginParam));
  const [prevPluginParam, setPrevPluginParam] = useState(pluginParam);
  if (prevPluginParam !== pluginParam) {
    setPrevPluginParam(pluginParam);
    setPlugin(getPluginMetadata(pluginParam));
  }

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');

  // Dual theme state engine (supports light and dark modes)
  const themeParam = searchParams.get('theme');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (themeParam === 'light' || themeParam === 'dark') return themeParam;
    return 'dark';
  });
  const [prevThemeParam, setPrevThemeParam] = useState(themeParam);
  if (prevThemeParam !== themeParam) {
    setPrevThemeParam(themeParam);
    if (themeParam === 'light' || themeParam === 'dark') {
      setTheme(themeParam);
    }
  }

  useEffect(() => {
    if (themeParam === 'light' || themeParam === 'dark') {
      return;
    }
    try {
      const savedTheme = localStorage.getItem('qubtic-auth-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        const id = setTimeout(() => setTheme(savedTheme), 0);
        return () => clearTimeout(id);
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      const id = setTimeout(() => setTheme('light'), 0);
      return () => clearTimeout(id);
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

  // Onboarding fields (Feature F6)
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // OTP flow state (Feature F7)
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Sign Up Email OTP verification flow state
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupResendCountdown, setSignupResendCountdown] = useState(0);

  // Password reset flow state (Feature F7)
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Team accounts flow state (Feature F7)
  const [selectedTeamId, setSelectedTeamId] = useState('team_personal');
  const [selectedTeamName, setSelectedTeamName] = useState('Personal Workspace');
  const [selectedTeamRole, setSelectedTeamRole] = useState('Owner');
  const [customTeamName, setCustomTeamName] = useState('');

  // Status and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [successData, setSuccessData] = useState<{
    token: string;
    sessionCode: string;
    user: {
      id: string;
      email: string;
      name?: string;
      company_name?: string;
      website_url?: string;
      plan: string;
      plugin_slug: string;
      team_name?: string;
      team_role?: string;
    };
    isNew: boolean;
  } | null>(null);

  const [copiedToken, setCopiedToken] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [isHandshakeSent, setIsHandshakeSent] = useState(false);

  // Pairing session state (RFC 8628 Device Authorization)
  const [pairingCode, setPairingCode] = useState(codeParam);
  const [prevCodeParam, setPrevCodeParam] = useState(codeParam);
  if (prevCodeParam !== codeParam) {
    setPrevCodeParam(codeParam);
    if (codeParam) {
      setPairingCode(codeParam);
    }
  }
  const [pairingStatus, setPairingStatus] = useState<'idle' | 'confirming' | 'confirmed' | 'failed'>('idle');

  // Check if user already authenticated and automatically confirm pairing if code exists
  useEffect(() => {
    if (!pairingCode || pairingStatus === 'confirmed') return;
    try {
      const storedToken = localStorage.getItem('qubtic_framer_token');
      if (storedToken && pairingStatus === 'idle') {
        fetch('/api/framer-auth/pair/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify({ user_code: pairingCode.trim() }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.success) {
              setPairingStatus('confirmed');
              setStatusMessage('Framer plugin paired successfully with your active account!');
            }
          })
          .catch(() => {
            // ignore
          });
      }
    } catch {
      // ignore
    }
  }, [pairingCode, pairingStatus]);

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

    let targetOrigin = '*';
    const safeReturn = sanitizeRedirectUrl(returnUrlParam);
    if (safeReturn) {
      try {
        const parsed = new URL(safeReturn, window.location.origin);
        if (parsed.origin && parsed.origin !== 'null') {
          targetOrigin = parsed.origin;
        }
      } catch {
        // ignore
      }
    } else if (typeof window !== 'undefined' && window.location.origin) {
      targetOrigin = window.location.origin;
    }

    let sent = false;
    try {
      if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
        window.opener.postMessage(payload, targetOrigin);
        sent = true;
      }
    } catch (e) {
      console.warn('Could not postMessage to window.opener:', e);
    }

    // Cross-tab synchronization via BroadcastChannel and localStorage
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('qubtic_framer_auth');
        bc.postMessage(payload);
        bc.close();
      }
    } catch {
      // ignore
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('qubtic_framer_auth_sync', JSON.stringify(payload));
      }
    } catch {
      // ignore
    }

    const handshakeTimer = setTimeout(() => setIsHandshakeSent(sent), 0);

    // Countdown to auto-close or redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const safeRedirect = sanitizeRedirectUrl(returnUrlParam);
          if (safeRedirect) {
            const redirectUrl = new URL(safeRedirect, window.location.origin);
            redirectUrl.searchParams.set('token', successData.token);
            redirectUrl.searchParams.set('email', successData.user.email);
            window.location.href = redirectUrl.toString();
          } else if (typeof window !== 'undefined') {
            try {
              window.close();
            } catch (e) {
              console.warn('Auto window.close error:', e);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(handshakeTimer);
      clearInterval(interval);
    };
  }, [successData, plugin.slug, returnUrlParam]);

  // Resend countdown timer for signup OTP
  useEffect(() => {
    if (signupResendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setSignupResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [signupResendCountdown]);

  const handleResendSignupOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/framer-auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: email.trim(),
          plugin: plugin.slug,
          mode: 'signup',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to dispatch verification code.');
        setIsLoading(false);
        return;
      }
      setSignupResendCountdown(30);
      setStatusMessage(data.message || `New verification code sent to ${email.trim()}.`);
      setIsLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error resending verification code.');
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/framer-auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          plugin: plugin.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to dispatch verification code.');
        setIsLoading(false);
        return;
      }
      setOtpSent(true);
      setStatusMessage(data.message || 'Verification code sent to your email.');
      setIsLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error sending OTP code.');
      setIsLoading(false);
    }
  };

  const handleSendResetRequest = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/framer-auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email,
          plugin: plugin.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to send reset code.');
        setIsLoading(false);
        return;
      }
      setResetSent(true);
      setStatusMessage(data.message || 'Password reset instructions sent to your email.');
      setIsLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error requesting password reset.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (activeTab === 'signup') {
      if (!signupOtpSent) {
        if (!password || password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          return;
        }

        setIsLoading(true);
        try {
          const res = await fetch('/api/framer-auth/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send',
              email: email.trim(),
              plugin: plugin.slug,
              mode: 'signup',
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            if (data.alreadyExists) {
              setErrorMessage('');
              setActiveTab('signin');
              setSignupOtpSent(false);
              setStatusMessage('An account with this email already exists. Please enter your password to sign in.');
            } else {
              setStatusMessage('');
              setErrorMessage(data.message || 'Failed to dispatch verification code.');
            }
            setIsLoading(false);
            return;
          }

          setSignupOtpSent(true);
          setSignupResendCountdown(30);
          setStatusMessage(data.message || `A 6-digit verification code has been sent to ${email.trim()}.`);
          setIsLoading(false);
          return;
        } catch (err: unknown) {
          setErrorMessage(err instanceof Error ? err.message : 'Network error sending verification code.');
          setIsLoading(false);
          return;
        }
      }

      // If signup OTP is already sent, verify the 6-digit code to complete registration
      if (!signupOtpCode || signupOtpCode.trim().length !== 6) {
        setErrorMessage('Please enter the 6-digit verification code sent to your email.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/framer-auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify-signup',
            email: email.trim(),
            code: signupOtpCode.trim(),
            password,
            name: name ? name.trim() : email.split('@')[0],
            company_name: companyName ? companyName.trim() : undefined,
            website_url: websiteUrl ? websiteUrl.trim() : undefined,
            plugin: plugin.slug,
            pairing_code: pairingCode ? pairingCode.trim() : undefined,
            framerUserId,
            framerProjectId,
            plan: 'pro',
            mode: 'signup',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(data.message || 'Invalid or expired verification code.');
          setIsLoading(false);
          return;
        }

        try {
          localStorage.setItem('qubtic_framer_token', data.token);
        } catch {
          // ignore
        }

        if (pairingCode && pairingCode.trim()) {
          try {
            const pairRes = await fetch('/api/framer-auth/pair/confirm', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.token}`,
              },
              body: JSON.stringify({
                user_code: pairingCode.trim().toUpperCase(),
              }),
            });
            const pairData = await pairRes.json();
            if (pairRes.ok && pairData.success) {
              setPairingStatus('confirmed');
            }
          } catch (pairErr) {
            console.warn('Pairing confirm background attempt:', pairErr);
          }
        }

        setSuccessData({
          token: data.token,
          sessionCode: data.sessionCode,
          user: data.user,
          isNew: Boolean(data.isNew),
        });
        setIsLoading(false);
        return;
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Network error verifying registration code.');
        setIsLoading(false);
        return;
      }
    }

    if (activeTab === 'signin' && (!password || password.length < 6)) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (activeTab === 'otp') {
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
      if (!otpCode || otpCode.trim().length < 4) {
        setErrorMessage('Please enter the 6-digit verification code.');
        return;
      }
    }

    if (activeTab === 'reset') {
      if (!resetSent) {
        await handleSendResetRequest();
        return;
      }
      if (!resetCode || resetCode.trim().length < 4) {
        setErrorMessage('Please enter the 6-digit reset code.');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let res: Response;
      if (activeTab === 'otp') {
        res = await fetch('/api/framer-auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            email,
            code: otpCode.trim(),
            plugin: plugin.slug,
            name: name || email.split('@')[0],
            framerUserId,
            framerProjectId,
            plan: 'pro',
          }),
        });
      } else if (activeTab === 'reset') {
        res = await fetch('/api/framer-auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reset',
            email,
            code: resetCode.trim(),
            newPassword,
            plugin: plugin.slug,
          }),
        });
      } else if (activeTab === 'teams') {
        const teamDisplayName =
          selectedTeamId === 'custom' && customTeamName.trim()
            ? customTeamName.trim()
            : selectedTeamName;
        res = await fetch('/api/framer-auth/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: name || email.split('@')[0],
            teamId: selectedTeamId,
            teamName: teamDisplayName,
            teamRole: selectedTeamRole,
            plugin: plugin.slug,
            framerUserId,
            framerProjectId,
            plan: 'pro',
          }),
        });
      } else {
        // Sign In
        res = await fetch('/api/framer-auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: name || email.split('@')[0],
            password,
            company_name: companyName,
            website_url: websiteUrl,
            mode: activeTab,
            plugin: plugin.slug,
            framerUserId,
            framerProjectId,
            plan: 'pro',
            pairing_code: pairingCode ? pairingCode.trim() : undefined,
            metadata: {
              sourceTab: activeTab,
              rememberMe,
              company_name: companyName,
              website_url: websiteUrl,
              pairing_code: pairingCode ? pairingCode.trim() : undefined,
            },
          }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.requiresSignup) {
          setErrorMessage('');
          setActiveTab('signup');
          setSignupOtpSent(false);
          setStatusMessage('No account found for this email. Switched to Sign Up so you can create your account.');
        } else if (data.requiresSignin) {
          setErrorMessage('');
          setActiveTab('signin');
          setStatusMessage('An account with this email already exists. Please enter your password to sign in.');
        } else {
          setStatusMessage('');
          setErrorMessage(data.message || data.error || 'Authentication failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Save token for persistent session and auto-pairing handoff
      try {
        localStorage.setItem('qubtic_framer_token', data.token);
      } catch {
        // ignore
      }

      // Automatically confirm pairing if pairing code is present
      if (pairingCode && pairingCode.trim()) {
        try {
          const pairRes = await fetch('/api/framer-auth/pair/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({
              user_code: pairingCode.trim().toUpperCase(),
            }),
          });
          const pairData = await pairRes.json();
          if (pairRes.ok && pairData.success) {
            setPairingStatus('confirmed');
          }
        } catch (pairErr) {
          console.warn('Pairing confirm background attempt:', pairErr);
        }
      }

      setSuccessData({
        token: data.token,
        sessionCode: data.sessionCode,
        user: data.user,
        isNew: data.isNew,
      });
      setIsLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error connecting to Qubtic Auth.');
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
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
              <div className="qubtic-auth-tabs qubtic-auth-tabs-duo">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage('');
                    setStatusMessage('');
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
                    setStatusMessage('');
                  }}
                  className={`qubtic-auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                >
                  Sign Up
                </button>
              </div>

              {/* Status Success Banner */}
              {statusMessage && (
                <div className="qubtic-auth-box qubtic-auth-status-banner">
                  <CheckCircle2 size={16} />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && !statusMessage && (
                <div className="qubtic-auth-error">
                  <AlertCircle className="qubtic-auth-error-icon" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="qubtic-auth-form">
                {/* Email Address - Hidden during signup OTP step to focus on the code */}
                {!(activeTab === 'signup' && signupOtpSent) && (
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
                )}

                {/* --- 1. SIGN IN TAB --- */}
                {activeTab === 'signin' && (
                  <>
                    <div className="qubtic-auth-group">
                      <div className="qubtic-auth-label-row">
                        <label htmlFor="qubtic-auth-password" className="qubtic-auth-label">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('reset');
                            setErrorMessage('');
                            setStatusMessage('');
                          }}
                          className="qubtic-auth-magic-link-btn"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="qubtic-auth-input-wrapper">
                        <Lock className="qubtic-auth-input-icon" />
                        <input
                          id="qubtic-auth-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
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

                  </>
                )}

                {/* --- 2. SIGN UP TAB (With Feature F6 Onboarding Fields & Email OTP Verification) --- */}
                {activeTab === 'signup' && (
                  <>
                    {signupOtpSent ? (
                      /* Step 2: 6-Digit Email OTP Verification */
                      <>
                        <div className="qubtic-auth-verify-notice">
                          <div className="qubtic-auth-verify-notice-icon">
                            <MailCheck size={20} />
                          </div>
                          <div className="qubtic-auth-verify-notice-content">
                            <div className="qubtic-auth-verify-notice-title">
                              Verify Your Email Address
                            </div>
                            <div className="qubtic-auth-verify-notice-desc">
                              We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to activate your account.
                            </div>
                          </div>
                        </div>

                        <div className="qubtic-auth-group">
                          <div className="qubtic-auth-label-row">
                            <label htmlFor="qubtic-auth-signup-otp" className="qubtic-auth-label">
                              6-Digit Verification Code
                            </label>
                            {signupResendCountdown > 0 ? (
                              <span className="qubtic-auth-resend-countdown">
                                Resend in {signupResendCountdown}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleResendSignupOtp}
                                disabled={isLoading}
                                className="qubtic-auth-magic-link-btn"
                              >
                                Resend code
                              </button>
                            )}
                          </div>
                          <div className="qubtic-auth-input-wrapper">
                            <KeyRound className="qubtic-auth-input-icon" />
                            <input
                              id="qubtic-auth-signup-otp"
                              name="signup_otp_code"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              value={signupOtpCode}
                              onChange={(e) => setSignupOtpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="qubtic-auth-input qubtic-auth-input-code"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="qubtic-auth-action-row-end">
                          <button
                            type="button"
                            onClick={() => {
                              setSignupOtpSent(false);
                              setErrorMessage('');
                              setStatusMessage('');
                            }}
                            className="qubtic-auth-back-link"
                          >
                            <ArrowLeft size={13} />
                            <span>Edit registration details</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Step 1: Initial Registration Form Details */
                      <>
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

                        <div className="qubtic-auth-group">
                          <label htmlFor="qubtic-auth-password" className="qubtic-auth-label">
                            Password
                          </label>
                          <div className="qubtic-auth-input-wrapper">
                            <Lock className="qubtic-auth-input-icon" />
                            <input
                              id="qubtic-auth-password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
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

                        {/* Company Name (Optional) */}
                        <div className="qubtic-auth-group">
                          <label htmlFor="qubtic-auth-company" className="qubtic-auth-label">
                            Company Name (Optional)
                          </label>
                          <div className="qubtic-auth-input-wrapper">
                            <Building className="qubtic-auth-input-icon" />
                            <input
                              id="qubtic-auth-company"
                              name="company_name"
                              type="text"
                              autoComplete="organization"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Company Name (Optional)"
                              className="qubtic-auth-input"
                            />
                          </div>
                        </div>

                        {/* Website URL (Optional) */}
                        <div className="qubtic-auth-group">
                          <label htmlFor="qubtic-auth-website" className="qubtic-auth-label">
                            Website URL (Optional)
                          </label>
                          <div className="qubtic-auth-input-wrapper">
                            <Globe className="qubtic-auth-input-icon" />
                            <input
                              id="qubtic-auth-website"
                              name="website_url"
                              type="url"
                              autoComplete="url"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="Website URL (Optional)"
                              className="qubtic-auth-input"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* --- 3. OTP VERIFICATION CODE TAB --- */}
                {activeTab === 'otp' && (
                  <>
                    <p className="qubtic-auth-tab-description">
                      Sign in securely without a password using a 6-digit one-time code sent directly to your inbox.
                    </p>

                    {otpSent && (
                      <div className="qubtic-auth-group">
                        <div className="qubtic-auth-label-row">
                          <label htmlFor="qubtic-auth-otp" className="qubtic-auth-label">
                            6-Digit Verification Code
                          </label>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isLoading}
                            className="qubtic-auth-magic-link-btn"
                          >
                            Resend code
                          </button>
                        </div>
                        <div className="qubtic-auth-input-wrapper">
                          <KeyRound className="qubtic-auth-input-icon" />
                          <input
                            id="qubtic-auth-otp"
                            name="otp_code"
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="123456"
                            className="qubtic-auth-input qubtic-auth-input-code"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* --- 4. FORGOT / RESET PASSWORD TAB --- */}
                {activeTab === 'reset' && (
                  <>
                    <p className="qubtic-auth-tab-description">
                      {!resetSent
                        ? 'Enter your account email to receive a 6-digit password reset verification code.'
                        : 'Enter the 6-digit code sent to your email along with your new password.'}
                    </p>

                    {resetSent && (
                      <>
                        <div className="qubtic-auth-group">
                          <label htmlFor="qubtic-auth-reset-code" className="qubtic-auth-label">
                            6-Digit Reset Code
                          </label>
                          <div className="qubtic-auth-input-wrapper">
                            <KeyRound className="qubtic-auth-input-icon" />
                            <input
                              id="qubtic-auth-reset-code"
                              name="reset_code"
                              type="text"
                              maxLength={6}
                              value={resetCode}
                              onChange={(e) => setResetCode(e.target.value)}
                              placeholder="123456"
                              className="qubtic-auth-input qubtic-auth-input-code"
                            />
                          </div>
                        </div>

                        <div className="qubtic-auth-group">
                          <label htmlFor="qubtic-auth-new-password" className="qubtic-auth-label">
                            New Password
                          </label>
                          <div className="qubtic-auth-input-wrapper">
                            <Lock className="qubtic-auth-input-icon" />
                            <input
                              id="qubtic-auth-new-password"
                              name="new_password"
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="New password (min. 6 chars)"
                              className="qubtic-auth-input has-eye"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="qubtic-auth-eye-btn"
                              aria-label="Toggle password visibility"
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                  </>
                )}

                {/* --- 5. TEAM ACCOUNTS SELECTION / SWITCHER TAB --- */}
                {activeTab === 'teams' && (
                  <div className="qubtic-auth-group">
                    <label className="qubtic-auth-label">
                      Select Target Team Workspace
                    </label>
                    <div className="qubtic-auth-team-list">
                      {[
                        {
                          id: 'team_personal',
                          name: email ? `${email.split('@')[0]}'s Workspace` : 'Personal Workspace',
                          role: 'Owner',
                          tier: 'Pro',
                        },
                        {
                          id: 'team_agency',
                          name: 'Design Studio & Agency Hub',
                          role: 'Admin',
                          tier: 'Enterprise Team',
                        },
                        {
                          id: 'team_marketing',
                          name: 'Growth & Brand Marketing Team',
                          role: 'Editor',
                          tier: 'Team',
                        },
                        {
                          id: 'custom',
                          name: 'Create / Join Another Workspace...',
                          role: 'Member',
                          tier: 'Workspace',
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedTeamId(item.id);
                            if (item.id !== 'custom') {
                              setSelectedTeamName(item.name);
                              setSelectedTeamRole(item.role);
                            }
                          }}
                          className={`qubtic-auth-team-item ${selectedTeamId === item.id ? 'selected' : ''}`}
                        >
                          <div className="qubtic-auth-team-item-left">
                            <Users size={16} className="qubtic-auth-team-icon" />
                            <div className="qubtic-auth-team-info">
                              <div className="qubtic-auth-team-name">
                                {item.name}
                              </div>
                              <div className="qubtic-auth-team-tier">
                                {item.tier} • Role: {item.role}
                              </div>
                            </div>
                          </div>
                          {selectedTeamId === item.id && (
                            <CheckCircle2 size={16} className="qubtic-auth-team-check" />
                          )}
                        </div>
                      ))}

                      {selectedTeamId === 'custom' && (
                        <div className="qubtic-auth-team-custom-input">
                          <input
                            type="text"
                            placeholder="Enter Team or Studio Name"
                            value={customTeamName}
                            onChange={(e) => {
                              setCustomTeamName(e.target.value);
                              setSelectedTeamName(e.target.value || 'Custom Workspace');
                            }}
                            className="qubtic-auth-input"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remember Me */}
                {(activeTab === 'signin' || (activeTab === 'signup' && !signupOtpSent)) && (
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
                )}

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="qubtic-auth-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="qubtic-auth-spinner" />
                      <span>
                        {activeTab === 'signin'
                          ? 'Signing in...'
                          : activeTab === 'signup'
                          ? signupOtpSent
                            ? 'Verifying code & activating account...'
                            : 'Sending verification code...'
                          : activeTab === 'otp'
                          ? otpSent
                            ? 'Verifying code...'
                            : 'Sending verification code...'
                          : activeTab === 'reset'
                          ? resetSent
                            ? 'Updating password...'
                            : 'Sending reset link...'
                          : 'Verifying...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {activeTab === 'signin'
                          ? `Sign In to ${plugin.name}`
                          : activeTab === 'signup'
                          ? signupOtpSent
                            ? `Verify Email & Complete Sign Up`
                            : `Continue to Email Verification`
                          : activeTab === 'otp'
                          ? otpSent
                            ? `Verify Code & Connect`
                            : `Send Verification Code`
                          : activeTab === 'reset'
                          ? resetSent
                            ? `Save Password & Connect`
                            : `Send Password Reset Code`
                          : `Connect as ${selectedTeamId === 'custom' ? (customTeamName || 'Team') : selectedTeamName}`}
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
                {successData.user.company_name && (
                  <div className="qubtic-auth-success-row">
                    <span className="qubtic-auth-success-label">Company / Studio:</span>
                    <span className="qubtic-auth-success-val">{successData.user.company_name}</span>
                  </div>
                )}
                {successData.user.team_name && (
                  <div className="qubtic-auth-success-row">
                    <span className="qubtic-auth-success-label">Connected Team:</span>
                    <span className="qubtic-auth-success-val">{successData.user.team_name}</span>
                  </div>
                )}
                {pairingCode && (
                  <div className="qubtic-auth-success-row">
                    <span className="qubtic-auth-success-label">Framer Plugin Paired:</span>
                    <span className="qubtic-auth-success-val qubtic-auth-status-connected">
                      <Check size={14} /> Connected
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="qubtic-auth-success-actions">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      try {
                        window.close();
                      } catch (e) {
                        console.warn('Manual window.close error:', e);
                      }
                      const safeRedirect = sanitizeRedirectUrl(returnUrlParam);
                      if (safeRedirect) {
                        window.location.href = safeRedirect;
                      }
                    }
                  }}
                  className={`qubtic-auth-submit-btn ${countdown === 0 ? 'qubtic-auth-close-pulse-btn' : ''}`}
                >
                  <span>
                    {countdown === 0 ? (
                      'Close Tab Now'
                    ) : (
                      <>
                        Closing Tab in <span className="qubtic-auth-countdown-val">{countdown}</span>s
                      </>
                    )}
                  </span>
                  <ExternalLink size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(successData.token)}
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
