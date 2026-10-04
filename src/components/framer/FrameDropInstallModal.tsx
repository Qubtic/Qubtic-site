'use client';

import * as React from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-[#141915]/10 z-10 overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#0C3823]/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#141915]/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="font-heading text-lg font-bold uppercase text-[#141915]">
              Install Frame Drop
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#666C64] hover:bg-black/5 hover:text-[#141915] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#0C3823] text-white font-mono text-xs font-bold">
              1
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase text-[#141915]">
                Open your Framer Project
              </h4>
              <p className="text-xs text-[#555C54] mt-0.5">
                Launch any project in your Framer dashboard or start from a blank canvas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#0C3823] text-white font-mono text-xs font-bold">
              2
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase text-[#141915]">
                Open Plugin Search
              </h4>
              <p className="text-xs text-[#555C54] mt-0.5">
                Press <kbd className="px-1.5 py-0.5 bg-white border border-black/10 rounded font-mono text-[10px]">Cmd + K</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-black/10 rounded font-mono text-[10px]">Ctrl + K</kbd> and search for <strong>&ldquo;Frame Drop&rdquo;</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#0C3823] text-white font-mono text-xs font-bold">
              3
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase text-[#141915]">
                Drop &amp; Design
              </h4>
              <p className="text-xs text-[#555C54] mt-0.5">
                Click to install and immediately insert 25+ WCAG-audited sections onto your canvas.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href="https://framer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#0C3823] py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#164E33] transition-colors"
          >
            <span>Launch Framer Marketplace</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-full border border-[#141915]/15 py-3 px-6 text-xs font-semibold text-[#141915] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Documentation Link'}</span>
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#666C64]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0C3823]" />
          <span>Framer Verified · Zero Code Lock-in · Atomic Rollback Safe</span>
        </div>
      </div>
    </div>
  );
}
