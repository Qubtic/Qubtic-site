'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Database,
  ArrowRight,
  Zap,
  Play,
  FileCode,
} from 'lucide-react';
import { REGISTERED_PLUGINS } from '@/lib/plugins-registry';

interface ReceivedAuthPayload {
  type?: string;
  token?: string;
  plugin?: string;
  user?: {
    email?: string;
    plan?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface VerificationResult {
  valid?: boolean;
  error?: string;
  [key: string]: unknown;
}

export default function FramerAuthBridgeSimulator() {
  const [selectedPlugin, setSelectedPlugin] = useState<string>('qube-auth');
  const [customSlug, setCustomSlug] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'listening' | 'authenticated'>('idle');
  const [receivedPayload, setReceivedPayload] = useState<ReceivedAuthPayload | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const activeSlug = selectedPlugin === 'custom' ? (customSlug || 'my-future-plugin') : selectedPlugin;

  // Listen for postMessage from the popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate message structure
      if (event.data && event.data.type === 'QUBTIC_AUTH_SUCCESS') {
        console.log('Received Qubtic Auth Handshake:', event.data);
        setReceivedPayload(event.data as ReceivedAuthPayload);
        setAuthStatus('authenticated');

        // Automatically verify token via Qubtic backend
        setIsVerifying(true);
        try {
          const tokenStr = String(event.data.token || '');
          const pluginStr = String(event.data.plugin || activeSlug);
          const res = await fetch(`/api/framer-auth/verify?token=${encodeURIComponent(tokenStr)}&plugin=${encodeURIComponent(pluginStr)}`);
          const verifyJson = (await res.json()) as VerificationResult;
          setVerificationResult(verifyJson);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          setVerificationResult({ valid: false, error: msg });
        } finally {
          setIsVerifying(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeSlug]);

  const launchAuthPopup = () => {
    setAuthStatus('listening');
    setReceivedPayload(null);
    setVerificationResult(null);

    const width = 480;
    const height = 660;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const authUrl = `/auth?plugin=${encodeURIComponent(activeSlug)}&project=Framer_Canvas_Simulator`;

    const popup = window.open(
      authUrl,
      'qubtic_framer_auth',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      alert('Popup was blocked by your browser. Please allow popups for this site to test the Framer handshake.');
      setAuthStatus('idle');
    }
  };

  const samplePluginCode = `// =========================================================================
// QUBTIC AUTH CLIENT FOR FRAMER PLUGINS (TypeScript / JavaScript)
// Drop this directly into your Framer Plugin code assets or Framer component
// =========================================================================

export interface QubticUser {
  id: string;
  email: string;
  name?: string;
  plan: 'free' | 'pro' | 'enterprise';
  plugin_slug: string;
}

export class QubticFramerAuth {
  private pluginSlug: string;
  private backendUrl: string;

  constructor(pluginSlug = '${activeSlug}', backendUrl = 'https://qubtic.tech') {
    this.pluginSlug = pluginSlug;
    this.backendUrl = backendUrl;
  }

  /**
   * Opens the Qubtic external authentication popup and waits for handshake.
   */
  public async authenticate(options?: { framerProjectId?: string; framerUserId?: string }): Promise<{ token: string; user: QubticUser }> {
    return new Promise((resolve, reject) => {
      const width = 480;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const url = new URL(\`\${this.backendUrl}/auth\`);
      url.searchParams.set('plugin', this.pluginSlug);
      if (options?.framerProjectId) url.searchParams.set('project', options.framerProjectId);
      if (options?.framerUserId) url.searchParams.set('framer_user', options.framerUserId);

      const popup = window.open(
        url.toString(),
        'qubtic_auth',
        \`width=\${width},height=\${height},left=\${left},top=\${top},status=no,menubar=no\`
      );

      if (!popup) {
        reject(new Error('Browser popup blocked. Please allow popups in Framer.'));
        return;
      }

      // Listen for the cross-window postMessage handshake
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'QUBTIC_AUTH_SUCCESS') {
          window.removeEventListener('message', handler);
          
          // Store token in Framer plugin storage or memory
          const { token, user } = event.data;
          resolve({ token, user });
        }
      };

      window.addEventListener('message', handler);
    });
  }

  /**
   * Verifies an existing token against the Qubtic backend.
   */
  public async verifyToken(token: string): Promise<{ valid: boolean; user?: QubticUser }> {
    const res = await fetch(\`\${this.backendUrl}/api/framer-auth/verify?token=\${encodeURIComponent(token)}&plugin=\${this.pluginSlug}\`);
    return await res.json();
  }
}

// Example Usage inside your Framer Plugin:
// const auth = new QubticFramerAuth('${activeSlug}');
// const session = await auth.authenticate({ framerProjectId: 'my-framer-site' });
// console.log('Authenticated member:', session.user.email);`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#0C3823]/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A6FF00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A6FF00]/10 border border-[#A6FF00]/30 text-xs text-[#A6FF00] font-mono mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Interactive Framer Plugin Handshake Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Test Qubtic Auth Handshake Live
            </h2>
            <p className="text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              Test how Framer marketplace plugins connect to the external Qubtic backend. Click the launch button below to open the external auth window, complete login, and observe real-time message broadcasting back to your plugin session.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/framer/qube-auth"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
            >
              Qube Auth Overview
            </Link>
            <Link
              href="/framer/qube-auth/docs"
              className="px-4 py-2.5 rounded-xl bg-[#0C3823] hover:bg-[#0C3823]/80 border border-[#A6FF00]/30 text-xs font-semibold text-[#A6FF00] flex items-center gap-1.5 transition-colors"
            >
              <span>View API Docs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plugin Selector & Trigger */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#A6FF00]" />
              <span>1. Choose Target Plugin</span>
            </h3>

            <div className="space-y-2.5 mb-5">
              {Object.values(REGISTERED_PLUGINS).map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => {
                    setSelectedPlugin(p.slug);
                    setAuthStatus('idle');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedPlugin === p.slug
                      ? 'bg-[#0C3823]/70 border-[#A6FF00]/50 shadow-lg'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 p-1.5 flex items-center justify-center">
                      <Image
                        src={p.logo}
                        alt={p.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                          {p.slug}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{p.tagline}</p>
                    </div>
                  </div>
                  {selectedPlugin === p.slug && (
                    <CheckCircle2 className="w-5 h-5 text-[#A6FF00] shrink-0" />
                  )}
                </button>
              ))}

              {/* Custom future plugin */}
              <button
                type="button"
                onClick={() => setSelectedPlugin('custom')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedPlugin === 'custom'
                    ? 'bg-[#0C3823]/70 border-[#A6FF00]/50 shadow-lg'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Future Plugin (Dynamic Slug)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#A6FF00]/20 text-[#A6FF00]">
                      Extensible
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">Test any unreleased plugin slug</p>
                </div>
                {selectedPlugin === 'custom' && (
                  <CheckCircle2 className="w-5 h-5 text-[#A6FF00] shrink-0" />
                )}
              </button>
            </div>

            {selectedPlugin === 'custom' && (
              <div className="mb-5 animate-fadeIn">
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Custom Plugin Slug
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="e.g. crestbar or qube-forms"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#A6FF00]"
                />
              </div>
            )}

            {/* Launch Button */}
            <button
              type="button"
              onClick={launchAuthPopup}
              className="w-full py-3.5 px-4 rounded-xl bg-[#A6FF00] hover:bg-[#b8ff33] text-[#070D09] font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#A6FF00]/10 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Auth Popup for {activeSlug}</span>
            </button>

            <p className="text-[11px] text-zinc-500 text-center mt-3">
              Opens <code className="text-zinc-400">/auth?plugin={activeSlug}</code> in a 480×660 Framer modal popup.
            </p>
          </div>
        </div>

        {/* Right Column: Live Event Inspector & Verified Session */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#A6FF00]" />
                  <span>2. Live Framer Plugin Session Listener</span>
                </h3>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      authStatus === 'authenticated'
                        ? 'bg-[#A6FF00]'
                        : authStatus === 'listening'
                        ? 'bg-amber-400 animate-ping'
                        : 'bg-zinc-600'
                    }`}
                  />
                  <span className="text-xs font-mono text-zinc-300 capitalize">
                    {authStatus}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {authStatus === 'idle' && (
                <div className="py-12 text-center text-zinc-500">
                  <Laptop className="w-12 h-12 mx-auto mb-3 opacity-30 text-zinc-400" />
                  <p className="text-sm font-medium text-zinc-400">
                    No active auth session
                  </p>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1">
                    Click &quot;Launch Auth Popup&quot; to simulate a user connecting their account inside Framer.
                  </p>
                </div>
              )}

              {authStatus === 'listening' && (
                <div className="py-12 text-center text-zinc-300 animate-pulse">
                  <RefreshCw className="w-10 h-10 mx-auto mb-3 text-amber-400 animate-spin" />
                  <p className="text-sm font-semibold text-white">
                    Listening for <code className="text-[#A6FF00]">QUBTIC_AUTH_SUCCESS</code> event...
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Complete sign in inside the popup window to broadcast session back to this parent.
                  </p>
                </div>
              )}

              {authStatus === 'authenticated' && receivedPayload && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Verified Header */}
                  <div className="p-3.5 rounded-xl bg-[#0C3823]/50 border border-[#A6FF00]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#A6FF00]" />
                      <div>
                        <div className="text-sm font-bold text-white">
                          Framer Handshake Received!
                        </div>
                        <div className="text-xs text-zinc-300">
                          User: <strong className="text-[#A6FF00]">{receivedPayload.user?.email}</strong> ({receivedPayload.user?.plan} plan)
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 text-[#A6FF00] border border-[#A6FF00]/20">
                      Plugin: {receivedPayload.plugin}
                    </span>
                  </div>

                  {/* Backend Verification Pill */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                        <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
                        <span>Backend Verification:</span>
                      </span>
                      {isVerifying ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Verifying token...</span>
                        </span>
                      ) : verificationResult?.valid ? (
                        <span className="text-[#A6FF00] font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>200 OK — Valid Active Session</span>
                        </span>
                      ) : (
                        <span className="text-red-400">Failed Verification</span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-400 truncate">
                      Token: <span className="text-white">{receivedPayload.token}</span>
                    </div>
                  </div>

                  {/* Raw Event Payload Viewer */}
                  <div>
                    <div className="text-[11px] font-mono text-zinc-400 mb-1">
                      Raw Window Message Payload:
                    </div>
                    <pre className="p-3 rounded-xl bg-black/80 border border-white/10 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48">
                      {JSON.stringify(receivedPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Quick reset */}
            {authStatus === 'authenticated' && (
              <button
                type="button"
                onClick={() => setAuthStatus('idle')}
                className="mt-4 text-xs text-zinc-400 hover:text-white underline text-center"
              >
                Clear Simulator Session & Run Again
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Code Snippet for Framer Plugin Developers */}
      <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#A6FF00]" />
              <span>Framer Plugin Integration SDK Code</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Copy and paste this helper into your Framer Plugin&apos;s code asset to trigger the external Qubtic Auth flow.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(samplePluginCode);
              setCopiedSnippet(true);
              setTimeout(() => setCopiedSnippet(false), 2000);
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-[#A6FF00]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'Snippet Copied!' : 'Copy Framer Plugin SDK'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-[#070D09] border border-white/10 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-96">
          {samplePluginCode}
        </pre>
      </div>
    </div>
  );
}
