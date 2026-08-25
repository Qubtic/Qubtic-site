'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  RefreshCw,
  UploadCloud,
  Trash2,
  Check,
  Search,
  Image as ImageIcon,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { CloudImage } from '@/components/ui/CloudImage';
import { ConfirmModal } from './ConfirmModal';
import { TechLoader } from '@/components/ui/TechLoader';
import { LumaSpin } from '@/components/ui/luma-spin';

export interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  secure_url: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (publicId: string) => void;
  selectedPublicId?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  selectedPublicId,
}: MediaLibraryModalProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (res.ok) {
        setResources(data.resources || []);
      } else {
        setError(data.error || 'Failed to fetch media library');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'qubtic_media_library');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchMedia();
        if (onSelect) {
          onSelect(data.public_id);
        }
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDelete = (public_id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingPublicId(public_id);
  };

  const executeDelete = async () => {
    if (!deletingPublicId) return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: deletingPublicId }),
      });

      if (res.ok) {
        setResources((prev) => prev.filter((item) => item.public_id !== deletingPublicId));
        setDeletingPublicId(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete media from Cloudinary');
      }
    } catch (err: any) {
      alert('Error deleting file: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyId = (public_id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(public_id);
    setCopiedId(public_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen || !portalContainer) return null;

  const filteredResources = resources.filter((item) =>
    item.public_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D8] rounded-[28px] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative z-10">
        {/* Header Bar */}
        <div className="p-6 border-b border-[#E5E0D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F8F6F0]">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#0C3823]" />
              <h2 className="text-lg font-bold uppercase tracking-tight text-[#141915] font-heading">
                Cloudinary Media Manager
              </h2>
            </div>
            <p className="text-xs text-[#666C64] mt-0.5">
              Browse, manage, and select images live from your Cloudinary account ({resources.length} items)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              uploading ? 'bg-[#082417] text-[#CCFF00] border border-[#CCFF00]/40' : 'bg-[#0C3823] text-white hover:bg-[#164E33]'
            }`}>
              {uploading ? (
                <TechLoader size="inline" text="Uploading..." />
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-[#CCFF00]" />
                  <span>Upload New</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button
              onClick={fetchMedia}
              className="p-2 rounded-xl border border-[#E5E0D8] hover:bg-[#F0EDE5] transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-[#0C3823] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E5E0D8] hover:bg-[#F0EDE5] transition-colors"
            >
              <X className="w-5 h-5 text-[#141915]" />
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-[#E5E0D8] bg-white flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#666C64]" />
            <input
              type="text"
              placeholder="Search images by Cloudinary public ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E0D8] rounded-xl text-xs text-[#141915] focus:outline-none focus:border-[#0C3823]"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F6F0]/50">
          {error && (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs space-y-2 mb-6 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                <span className="text-base">🔑</span>
                <span>Cloudinary API Credentials Action Required</span>
              </div>
              <p className="leading-relaxed text-amber-900/90 font-medium">
                {error}
              </p>
              <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold">How to fix:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Go to your <strong>Cloudinary Dashboard &gt; Product Environment Credentials</strong>.</li>
                  <li>Click the 👁️ <strong>eye icon</strong> next to &quot;API secret&quot; to reveal the full unmasked secret string.</li>
                  <li>Copy the unmasked secret and update <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">CLOUDINARY_API_SECRET=your_secret</code> in your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.env</code> file.</li>
                </ol>
              </div>
            </div>
          )}

          {loading && resources.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <TechLoader size="md" text="Loading Cloudinary Assets..." />
            </div>
          ) : filteredResources.length === 0 && !uploading ? (
            <div className="py-20 text-center space-y-3">
              <ImageIcon className="w-12 h-12 text-[#666C64]/30 mx-auto" />
              <p className="text-sm font-bold text-[#141915]">No Cloudinary images found</p>
              <p className="text-xs text-[#666C64]">Upload an image to start using it in your website</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {uploading && (
                <div className="relative aspect-square rounded-2xl bg-[#082417] border-2 border-[#CCFF00] p-4 flex flex-col items-center justify-center text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <LumaSpin size={52} color="#CCFF00" />
                  <span className="mt-3 text-[11px] font-mono font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-1.5">
                    <span>Uploading...</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00] animate-ping" />
                  </span>
                  <span className="text-[9px] font-medium text-white/70 mt-0.5">Publishing to Cloudinary</span>
                </div>
              )}
              {filteredResources.map((item) => {
                const isSelected = selectedPublicId === item.public_id;
                return (
                  <div
                    key={item.public_id}
                    onClick={() => {
                      if (onSelect) {
                        onSelect(item.public_id);
                        onClose();
                      }
                    }}
                    className={`group relative bg-white border-2 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0C3823] ring-4 ring-[#0C3823]/20'
                        : 'border-[#E5E0D8] hover:border-[#0C3823]/60'
                    }`}
                  >
                    {/* Thumbnail Image using CloudImage (CldImage wrapper) */}
                    <div className="relative aspect-square bg-[#F0EDE5]">
                      <CloudImage
                        src={item.public_id}
                        alt={item.public_id}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        crop={{ type: 'auto', source: true }}
                      />

                      {isSelected && (
                        <div className="absolute top-2 left-2 p-1.5 rounded-full bg-[#0C3823] text-[#CCFF00]">
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <button
                          onClick={(e) => handleCopyId(item.public_id, e)}
                          className="p-1 rounded-lg bg-white/20 text-white hover:bg-white/40 text-[10px] font-bold inline-flex items-center gap-1"
                          title="Copy Public ID"
                        >
                          {copiedId === item.public_id ? <Check className="w-3 h-3 text-[#CCFF00]" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => requestDelete(item.public_id, e)}
                          className="p-1 rounded-lg bg-red-600/80 text-white hover:bg-red-600"
                          title="Delete from Cloudinary"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border-t border-[#E5E0D8]">
                      <p className="text-[11px] font-bold text-[#141915] truncate font-mono" title={item.public_id}>
                        {item.public_id}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-[#666C64] mt-0.5">
                        <span>{item.format.toUpperCase()}</span>
                        <span>{item.width}×{item.height}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E0D8] bg-white flex items-center justify-between text-xs text-[#666C64]">
          <span>
            Click any image to select it for your project or blog post.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F0EDE5] text-[#141915] font-bold uppercase text-xs hover:bg-[#E5E0D8]"
          >
            Close Media Manager
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deletingPublicId)}
        title="Delete Cloudinary Image?"
        message="Are you sure you want to permanently delete this image from your Cloudinary account? This action cannot be undone."
        itemName={deletingPublicId || undefined}
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeletingPublicId(null)}
      />
    </div>,
    portalContainer
  );
}

export default MediaLibraryModal;
