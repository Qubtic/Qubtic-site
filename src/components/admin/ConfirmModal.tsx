'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title = 'Delete Image?',
  message = 'Are you sure you want to delete this image? This action cannot be undone.',
  itemName,
  confirmText = 'Delete Image',
  cancelText = 'Cancel',
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  if (!isOpen || !portalContainer) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D8] rounded-[24px] max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#666C64] hover:text-[#141915] hover:bg-[#F0EDE5] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center pt-2 pb-2">
          {/* Warning Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold font-heading text-[#141915] tracking-tight">
            {title}
          </h3>

          {/* Message */}
          <p className="text-xs text-[#666C64] mt-2 leading-relaxed max-w-xs font-medium">
            {message}
          </p>

          {/* Highlighted Item Name (if provided) */}
          {itemName && (
            <div className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#F8F6F0] border border-[#E5E0D8] text-[11px] font-mono text-[#0C3823] break-all max-w-full font-medium">
              {itemName}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-5 mt-3 border-t border-[#E5E0D8]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 h-11 px-4 rounded-xl border border-[#E5E0D8] bg-[#F8F6F0] text-[#141915] text-xs font-bold hover:bg-[#E5E0D8] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-11 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 text-white/90" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    portalContainer
  );
}

export default ConfirmModal;
