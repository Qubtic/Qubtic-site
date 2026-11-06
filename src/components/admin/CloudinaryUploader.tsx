'use client';

import React, { useState, useRef, useId } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, FolderOpen, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { CloudImage } from '@/components/ui/CloudImage';
import { MediaLibraryModal } from './MediaLibraryModal';
import { TechLoader } from '@/components/ui/TechLoader';
import './cloudinary-uploader.css';
import { canPreviewPluginLogo } from '@/lib/plugin-logo';

interface CloudinaryUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  folder?: string;
  variant?: 'default' | 'logo';
}

export function CloudinaryUploader({
  value = '',
  onChange,
  label = 'Image Asset',
  folder = 'qubtic_uploads',
  variant = 'default',
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setImageError(false);
  }
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceId = useId();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image to Cloudinary');
      }

      onChange(data.public_id || data.secure_url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isLocalFile = value.startsWith('/');
  const isCloudinary = value && !isLocalFile;
  const supportedLocal = isLocalFile;
  const supportedUrl = value.startsWith('https:');
  const canPreviewLogo = canPreviewPluginLogo(value);
  const unavailableLogo = imageError || Boolean(value && !canPreviewLogo);

  if (variant === 'logo') return <>
    <section className="asset-logo" aria-label={label} aria-busy={uploading}>
      <header className="asset-logo__header"><h4><ImageIcon size={17} aria-hidden="true"/>{label}</h4>{value && <span className="asset-logo__source">{isLocalFile ? 'Site asset' : 'Cloudinary'}</span>}</header>
      <div className="asset-logo__content">
        <div className="asset-logo__preview">
          {value && !unavailableLogo ? supportedLocal || supportedUrl ?
            <Image src={value} alt="Plugin logo preview" width={112} height={112} className="asset-logo__image" onError={() => setImageError(true)}/> :
            <CloudImage src={value} alt="Plugin logo preview" width={112} height={112} className="asset-logo__image" crop={{ type: 'fit', source: true }} onError={() => setImageError(true)}/> :
            <div className="asset-logo__empty">{unavailableLogo ? <AlertCircle size={26} aria-hidden="true"/> : <ImageIcon size={26} aria-hidden="true"/>}<span>{unavailableLogo ? 'Preview unavailable' : 'No logo yet'}</span></div>}
        </div>
        <div className="asset-logo__controls">
          <p>Use a square logo. Your full image stays visible.</p>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="asset-logo__file" aria-label="Choose plugin logo file" disabled={uploading}/>
          <div className="asset-logo__buttons">
            <button type="button" className="asset-logo__upload" disabled={uploading} onClick={() => fileInputRef.current?.click()}><UploadCloud size={16} aria-hidden="true"/>{uploading ? 'Uploading…' : value ? 'Replace logo' : 'Upload logo'}</button>
            <button type="button" disabled={uploading} onClick={() => setIsMediaModalOpen(true)}><FolderOpen size={16} aria-hidden="true"/>Media library</button>
          </div>
          {value && <button type="button" className="asset-logo__remove" aria-label="Remove plugin logo" disabled={uploading} onClick={() => onChange('')}><Trash2 size={14} aria-hidden="true"/>Remove logo</button>}
        </div>
      </div>
      {error && <p className="asset-logo__error" role="alert"><AlertCircle size={15} aria-hidden="true"/>{error}</p>}
      <details className="asset-logo__reference"><summary>Asset reference</summary><label htmlFor={referenceId}>Cloudinary ID or image path<input id={referenceId} value={value} onChange={event => onChange(event.target.value)} disabled={uploading} spellCheck={false} placeholder="Choose an image or paste its reference"/></label></details>
    </section>
    <MediaLibraryModal isOpen={isMediaModalOpen} onClose={() => setIsMediaModalOpen(false)} selectedPublicId={value} onSelect={publicId => { onChange(publicId); setIsMediaModalOpen(false); }}/>
  </>;

  return (
    <>
      <div className="space-y-4 p-5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-[24px] shadow-2xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#0C3823] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#0C3823]" />
            <span>{label}</span>
          </label>

          <div className="flex items-center gap-2">
            {isCloudinary && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#0C3823] text-[#CCFF00] text-[10px] font-extrabold uppercase tracking-wider">
                Cloudinary Asset
              </span>
            )}
            {isLocalFile && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EDE5] text-[#666C64] text-[10px] font-bold uppercase tracking-wider">
                Local Static Asset
              </span>
            )}
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold flex items-center gap-1"
                title="Clear image"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Action Buttons & Input */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-[#0C3823] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#164E33] transition-all inline-flex items-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {uploading ? (
                  <TechLoader size="inline" text="Uploading File" />
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-[#CCFF00]" />
                    <span>Upload New Image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-[#0C3823] bg-white text-[#0C3823] text-xs font-bold uppercase tracking-wider hover:bg-[#0C3823] hover:text-white transition-all inline-flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse Media Library</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. qubtic_uploads/sample_image or /images/work-1.jpg"
                className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono text-[#141915] focus:outline-none focus:border-[#0C3823]"
              />
            </div>

            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          </div>

          {/* Live Preview Box */}
          <div className="md:col-span-4">
            <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-white border border-[#E5E0D8] flex items-center justify-center shadow-2xs">
              {value && !imageError ? (
                <div className="relative w-full h-full">
                  {isLocalFile ? (
                    <Image
                      src={value}
                      alt="Local asset preview"
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <CloudImage
                      src={value}
                      alt="Cloudinary asset preview"
                      fill
                      className="object-cover"
                      crop={{ type: 'auto', source: true }}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center p-3 text-[#666C64] space-y-1">
                  {imageError ? (
                    <>
                      <AlertCircle className="w-6 h-6 mx-auto text-amber-500" />
                      <span className="text-[11px] font-bold text-amber-800 block">Invalid Image Path</span>
                      <span className="text-[9px] text-[#666C64]">Click &quot;Browse Media Library&quot; to pick an asset</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 mx-auto opacity-30 text-[#0C3823]" />
                      <span className="text-[11px] font-bold block text-[#141915]">No Image Selected</span>
                      <span className="text-[9px] text-[#666C64]">Upload a file or pick from Cloudinary</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cloudinary Media Library Modal Picker */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        selectedPublicId={value}
        onSelect={(publicId) => {
          onChange(publicId);
          setIsMediaModalOpen(false);
        }}
      />
    </>
  );
}

export default CloudinaryUploader;
