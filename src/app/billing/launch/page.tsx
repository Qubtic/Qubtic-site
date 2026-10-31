'use client';
import { useEffect, useState } from 'react';
import './launch.css';

const polarHosts = new Set([
  'polar.sh',
  'buy.polar.sh',
  'sandbox.polar.sh',
  'sandbox-api.polar.sh',
  'api.polar.sh',
  'sandbox.buy.polar.sh',
]);

export default function BillingLaunch() {
  const [waiting, setWaiting] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    const channel = window.location.hash.slice(1);
    if (!/^[0-9a-f-]{36}$/i.test(channel)) {
      setWaiting(true);
      return;
    }

    let redirected = false;
    const opener = window.opener;

    const navigateTo = (targetUrl: string) => {
      if (redirected) return;
      try {
        const url = new URL(targetUrl);
        if (url.protocol !== 'https:' || !polarHosts.has(url.hostname) || url.username || url.password) {
          return;
        }
        redirected = true;
        setResolvedUrl(url.href);
        window.location.replace(url.href);
      } catch {
        /* Keep waiting for valid checkout */
      }
    };

    const receive = (event: MessageEvent) => {
      if (
        event.data?.type !== 'qubtic-billing-checkout' ||
        event.data?.channel !== channel ||
        typeof event.data?.url !== 'string'
      ) {
        return;
      }
      if (opener && event.source && event.source !== opener) return;
      navigateTo(event.data.url);
    };

    window.addEventListener('message', receive);

    // Notify opener if available
    try {
      opener?.postMessage({ type: 'qubtic-billing-ready', channel }, '*');
    } catch {
      /* Opener inaccessible */
    }

    // Direct API polling fallback: resolves checkout even when cross-window communication is blocked
    let active = true;
    let attempts = 0;
    const poll = async () => {
      while (active && !redirected && attempts < 25) {
        attempts++;
        try {
          const res = await fetch(`/api/billing/resolve?channel=${encodeURIComponent(channel)}`, {
            cache: 'no-store',
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.url) {
              navigateTo(data.url);
              return;
            }
          }
        } catch {
          /* Retry next tick */
        }
        if (!active || redirected) return;
        await new Promise((r) => setTimeout(r, attempts < 5 ? 500 : 1000));
      }
      if (active && !redirected) {
        setWaiting(true);
      }
    };

    void poll();
    const timer = window.setTimeout(() => setWaiting(true), 15000);

    return () => {
      active = false;
      window.removeEventListener('message', receive);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <main className="billing-launch">
      <section className="billing-launch__content" aria-labelledby="billing-launch-title">
        <span className="billing-launch__spinner" aria-hidden="true" />
        <h1 id="billing-launch-title">Opening Polar checkout</h1>
        <p role="status">Please wait while your checkout loads.</p>
        {resolvedUrl && (
          <p>
            <a href={resolvedUrl} className="billing-launch__link">
              Click here if checkout does not open automatically
            </a>
          </p>
        )}
        {waiting && !resolvedUrl && (
          <p className="billing-launch__recovery">
            Checkout is taking longer than expected. Return to the plugin and select Open Polar checkout, or try Purchase Pro again.
          </p>
        )}
      </section>
    </main>
  );
}
