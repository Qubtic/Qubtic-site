'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck, 
  Lock, 
  Database
} from 'lucide-react';

interface QubeAuthInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export function QubeAuthInstallModal({ isOpen, onClose }: QubeAuthInstallModalProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isOpen || !mounted) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://qubtic.tech/framer/qube-auth/docs');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return createPortal(
    <div className="qube-modal-backdrop">
      {/* Backdrop click */}
      <div
        onClick={onClose}
        className="qube-modal-backdrop-overlay"
      />

      {/* Modal Container */}
      <div className="qube-modal-dialog">
        
        {/* Header */}
        <div className="qube-modal-header">
          <div className="qube-modal-brand">
            <div className="qube-modal-logo-box">
              <Image
                src="/images/qube-auth/qube-auth-logo.png"
                alt="Qube Auth Logo"
                width={36}
                height={36}
                className="qube-modal-logo-img"
              />
            </div>
            <div>
              <h3 className="qube-modal-title">
                Install Qube Auth
              </h3>
              <span className="qube-modal-subtitle">
                <span className="qube-pulse-dot" />
                Framer Native Plugin · v1.0.0
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="qube-modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div className="qube-modal-steps">
          <div className="qube-modal-step-item">
            <span className="qube-modal-step-num">
              1
            </span>
            <div>
              <h4 className="qube-modal-step-heading">
                Launch Framer & Open Plugin Search
              </h4>
              <p className="qube-modal-step-text">
                Press <kbd className="qube-modal-kbd">Cmd + K</kbd> or <kbd className="qube-modal-kbd">Ctrl + K</kbd> and search for <strong>&ldquo;Qube Auth&rdquo;</strong>.
              </p>
            </div>
          </div>

          <div className="qube-modal-step-item">
            <span className="qube-modal-step-num">
              2
            </span>
            <div>
              <h4 className="qube-modal-step-heading">
                Connect Your Supabase Project
              </h4>
              <p className="qube-modal-step-text">
                Paste your HTTPS project URL &amp; client-safe publishable/anon key. Never expose secret keys.
              </p>
            </div>
          </div>

          <div className="qube-modal-step-item">
            <span className="qube-modal-step-num">
              3
            </span>
            <div>
              <h4 className="qube-modal-step-heading">
                1-Click Compile &amp; Drag to Canvas
              </h4>
              <p className="qube-modal-step-text">
                Click <strong>Install Library</strong> to generate <code>Qube-Auth.tsx</code> into your project code assets, then drop components on your canvas.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="qube-modal-actions">
          <a
            href="https://framer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="qube-modal-primary-btn"
          >
            <span>Open Framer Marketplace</span>
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="qube-modal-secondary-btn"
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Documentation Link'}</span>
          </button>
        </div>

        {/* Security badge */}
        <div className="qube-modal-trust-bar">
          <span className="qube-modal-trust-item">
            <ShieldCheck size={14} />
            PostgreSQL RLS
          </span>
          <span>•</span>
          <span className="qube-modal-trust-item">
            <Lock size={14} />
            Client-Safe Keys Only
          </span>
          <span>•</span>
          <span className="qube-modal-trust-item">
            <Database size={14} />
            100% Data Ownership
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
