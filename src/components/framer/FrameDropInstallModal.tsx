'use client';

import * as React from 'react';
import Image from 'next/image';
import { 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck 
} from 'lucide-react';

interface FrameDropInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FrameDropInstallModal({ isOpen, onClose }: FrameDropInstallModalProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://qubtic.tech/framer/frame-drop/docs');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fd-modal-fixed">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fd-modal-backdrop"
      />

      {/* Modal Container */}
      <div className="fd-modal-dialog">
        {/* Glow */}
        <div className="fd-modal-glow" />

        {/* Header */}
        <div className="fd-modal-header">
          <div className="fd-modal-brand-wrap">
            <div className="fd-modal-logo-box">
              <Image
                src="/images/brand/frame-drop-icon-transparent.png"
                alt="Frame Drop Logo"
                width={24}
                height={24}
                className="fd-icon-lg"
              />
            </div>
            <div>
              <span className="fd-modal-title">
                Install Frame Drop
              </span>
              <span className="fd-modal-version">
                <span className="fd-pulse-lime" />
                <span>Framer Native Plugin · v0.2.0</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="fd-modal-close-btn"
            aria-label="Close modal"
          >
            <X className="fd-icon-md" />
          </button>
        </div>

        {/* Steps */}
        <div className="fd-modal-step-list">
          <div className="fd-modal-step-item">
            <span className="fd-modal-step-num">
              1
            </span>
            <div>
              <h4 className="fd-modal-step-heading">
                Open your Framer Project
              </h4>
              <p className="fd-modal-step-text">
                Launch any project in your Framer dashboard or start from a blank canvas.
              </p>
            </div>
          </div>

          <div className="fd-modal-step-item">
            <span className="fd-modal-step-num">
              2
            </span>
            <div>
              <h4 className="fd-modal-step-heading">
                Open Plugin Search
              </h4>
              <p className="fd-modal-step-text">
                Press <kbd className="fd-modal-kbd">Cmd + K</kbd> or <kbd className="fd-modal-kbd">Ctrl + K</kbd> and search for <strong>&ldquo;Frame Drop&rdquo;</strong>.
              </p>
            </div>
          </div>

          <div className="fd-modal-step-item">
            <span className="fd-modal-step-num">
              3
            </span>
            <div>
              <h4 className="fd-modal-step-heading">
                Drop &amp; Design
              </h4>
              <p className="fd-modal-step-text">
                Click to install and immediately insert 34+ WCAG-audited sections onto your canvas.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="fd-modal-actions">
          <a
            href="https://framer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fd-modal-primary-btn"
          >
            <span>Launch Framer Marketplace</span>
            <ExternalLink className="fd-icon-sm" />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="fd-modal-secondary-btn"
          >
            {copiedLink ? <Check className="fd-icon-sm" /> : <Copy className="fd-icon-sm" />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Documentation Link'}</span>
          </button>
        </div>

        {/* Security badge */}
        <div className="fd-modal-badge">
          <ShieldCheck className="fd-icon-xs" />
          <span>Framer Verified · Zero Code Lock-in · Atomic Rollback Safe</span>
        </div>
      </div>
    </div>
  );
}
