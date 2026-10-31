'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import './return.css';

export function BillingReturnClient() {
  const [countdown, setCountdown] = useState<number>(2);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isClosedAttempted, setIsClosedAttempted] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [pluginName, setPluginName] = useState<string>('Qubtic Plugin');

  // Detect system theme preference and URL parameters after hydration
  useEffect(() => {
    const initTimer = window.setTimeout(() => {
      try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
          setTheme('light');
        }

        const params = new URLSearchParams(window.location.search);
        const plugin = params.get('plugin');
        if (plugin === 'whatsapp-commerce') {
          setPluginName('WhatsApp Commerce');
        } else if (plugin === 'frame-drop') {
          setPluginName('FrameDrop');
        } else if (plugin === 'qube-auth') {
          setPluginName('Qube Auth');
        } else if (plugin) {
          setPluginName(plugin);
        }
      } catch {
        // Ignore client lookup errors
      }
    }, 0);

    return () => window.clearTimeout(initTimer);
  }, []);

  // 2-second auto-close countdown handler
  useEffect(() => {
    if (isPaused) return;

    const intervalId = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timerId = window.setTimeout(() => {
      try {
        window.close();
      } catch {
        // Tab closing blocked by browser sandbox
      }
      setIsClosedAttempted(true);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timerId);
    };
  }, [isPaused]);

  const handleCloseTab = useCallback(() => {
    try {
      window.close();
    } catch {
      // Ignored
    }
    setIsClosedAttempted(true);
  }, []);

  const handleToggleAutoClose = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <main className="billing-return-page" data-theme={theme}>
      {/* Ambient background glows */}
      <div className="billing-return-ambient" aria-hidden="true">
        <div className="billing-return-glow billing-return-glow-top" />
        <div className="billing-return-glow billing-return-glow-bottom" />
        <div className="billing-return-grid-pattern" />
      </div>

      <div className="billing-return-container">
        <section className="billing-return-card" aria-labelledby="billing-return-title">
          {/* Header Row */}
          <header className="billing-return-header">
            <div className="billing-return-brand">
              <svg
                className="billing-return-logo-icon"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect width="32" height="32" rx="8" className="billing-return-logo-bg" />
                <path
                  d="M10 8h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm2 4v8h8v-8h-8z"
                  className="billing-return-logo-mark"
                />
              </svg>
              <span className="billing-return-brand-name">Qubtic</span>
              <span className="billing-return-brand-divider">/</span>
              <span className="billing-return-brand-tag">Billing</span>
            </div>

            <div className="billing-return-header-actions">
              <div className="billing-return-status-badge">
                <span className="billing-return-pulse-dot" aria-hidden="true" />
                <span className="billing-return-status-text">Polar Verified</span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="billing-return-theme-toggle"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? (
                  <svg
                    className="billing-return-theme-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg
                    className="billing-return-theme-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <div className="billing-return-hero">
            <div className="billing-return-icon-wrapper">
              <div className="billing-return-icon-glow" aria-hidden="true" />
              <div className="billing-return-icon-ring" aria-hidden="true" />
              <div className="billing-return-icon-circle">
                <svg
                  className="billing-return-check-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <h1 id="billing-return-title" className="billing-return-title">
              Payment Confirmed &amp; Verified
            </h1>

            <p className="billing-return-subtitle">
              Your session was authenticated securely through Polar. Return to{' '}
              <strong>{pluginName}</strong> in Framer to access your Pro plan and features.
            </p>
          </div>

          {/* 2-Second Auto-Close Widget */}
          <div
            className="billing-return-timer-box"
            role="region"
            aria-label="Automatic tab closure notification"
          >
            <div className="billing-return-timer-info">
              <div className="billing-return-timer-left">
                <svg
                  className="billing-return-timer-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="billing-return-timer-label">
                  {isPaused ? (
                    <>Auto-close paused</>
                  ) : countdown > 0 ? (
                    <>
                      Closing tab in{' '}
                      <strong className="billing-return-timer-seconds">{countdown}s</strong>...
                    </>
                  ) : (
                    <>Closing window now...</>
                  )}
                </span>
              </div>

              <button
                type="button"
                className="billing-return-timer-cancel"
                onClick={handleToggleAutoClose}
              >
                {isPaused ? 'Resume auto-close' : 'Keep tab open'}
              </button>
            </div>

            {/* Visual Progress Bar (2s linear fill) */}
            <div className="billing-return-progress-track">
              <div
                className={`billing-return-progress-bar ${
                  isPaused
                    ? 'billing-return-progress-paused'
                    : 'billing-return-progress-running'
                }`}
              />
            </div>

            <p className="billing-return-timer-hint">
              {isClosedAttempted
                ? 'Tab close command issued. If your browser restricts automatic tab closure, please close this tab manually or click Return to Framer below.'
                : 'You can safely close this browser window and continue working in your Framer canvas.'}
            </p>
          </div>

          {/* Feature Badges */}
          <div className="billing-return-features">
            <div className="billing-return-feature-card">
              <div className="billing-return-feature-icon-box">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="billing-return-feature-content">
                <h2 className="billing-return-feature-title">Instant Activation</h2>
                <p className="billing-return-feature-desc">
                  Your plugin verifies subscription status automatically. You can also select{' '}
                  <em>Refresh billing</em> inside Framer.
                </p>
              </div>
            </div>

            <div className="billing-return-feature-card">
              <div className="billing-return-feature-icon-box">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="billing-return-feature-content">
                <h2 className="billing-return-feature-title">Secured by Polar</h2>
                <p className="billing-return-feature-desc">
                  Payment confirmation and customer portal management details were sent to your account email.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="billing-return-actions">
            <button
              type="button"
              onClick={handleCloseTab}
              className="billing-return-btn billing-return-btn-primary"
            >
              <span>Return to Framer</span>
              <svg
                className="billing-return-btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>

            <Link href="/" className="billing-return-btn billing-return-btn-secondary">
              <span>Back to Qubtic Studio</span>
            </Link>
          </div>

          {/* Footer Note */}
          <footer className="billing-return-footer">
            <p className="billing-return-footer-text">
              Need assistance?{' '}
              <Link href="/contact" className="billing-return-footer-link">
                Contact Support
              </Link>
              {' · '}
              <Link href="/billing" className="billing-return-footer-link">
                Manage Account &amp; Billing
              </Link>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
