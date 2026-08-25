'use client';

import React, { useState, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import {
  Eye,
  Edit3,
  Columns,
  Upload,
  Image as ImageIcon,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { MediaLibraryModal } from './MediaLibraryModal';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  label = 'Content (Markdown Supported)',
  placeholder = 'Write your article or case study content in Markdown format...',
  minHeight = 'min-h-[480px]',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'split' | 'preview'>('split');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Insert markdown tag at current cursor position
  const insertTag = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length + (selectedText ? 0 : 4));
    }, 0);
  };

  // Handle .md file upload import
  const handleMdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown') && !file.name.endsWith('.txt')) {
      alert('Please select a valid .md or .markdown file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content);
      }
    };
    reader.readAsText(file);
  };

  // Insert selected Cloudinary image into markdown
  const handleSelectCloudinaryImage = (publicId: string) => {
    const imageUrl = publicId.startsWith('http')
      ? publicId
      : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'lcdpn0a9'}/image/upload/${publicId}`;

    const mdImage = `\n![${publicId}](${imageUrl})\n`;
    if (textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart;
      const newValue = value.substring(0, start) + mdImage + value.substring(start);
      onChange(newValue);
    } else {
      onChange(value + mdImage);
    }
  };

  // Render markdown to safe HTML
  const renderedHtml = md.render(value || '_No content written yet..._');

  const copyMarkdown = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label and Toolbar header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#141915] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0C3823]" />
          <span>{label}</span>
        </label>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-[#F0EDE5] p-1 rounded-xl text-xs font-semibold text-[#666C64]">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${mode === 'write' ? 'bg-white text-[#0C3823] shadow-xs font-bold' : 'hover:text-[#141915]'
              }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${mode === 'split' ? 'bg-white text-[#0C3823] shadow-xs font-bold' : 'hover:text-[#141915]'
              }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${mode === 'preview' ? 'bg-white text-[#0C3823] shadow-xs font-bold' : 'hover:text-[#141915]'
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview MD</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="border border-[#E5E0D8] rounded-2xl bg-white overflow-hidden shadow-xs flex flex-col">
        {/* Formatting Toolbar */}
        {mode !== 'preview' && (
          <div className="p-2 bg-[#F8F6F0] border-b border-[#E5E0D8] flex flex-wrap items-center justify-between gap-1.5 text-xs text-[#141915]">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertTag('# ', '')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4 text-[#0C3823]" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('## ', '')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4 text-[#0C3823]" />
              </button>
              <span className="h-4 w-px bg-[#E5E0D8] mx-1" />
              <button
                type="button"
                onClick={() => insertTag('**', '**')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('*', '*')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <span className="h-4 w-px bg-[#E5E0D8] mx-1" />
              <button
                type="button"
                onClick={() => insertTag('- ', '')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('1. ', '')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('> ', '')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('```\n', '\n```')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('[Link Title](', ')')}
                className="p-1.5 rounded-lg hover:bg-[#E5E0D8] transition-colors"
                title="Insert Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <span className="h-4 w-px bg-[#E5E0D8] mx-1" />
              <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0C3823] text-white font-semibold text-[11px] hover:bg-[#164E33] transition-colors flex items-center gap-1.5"
                title="Insert Image from Cloudinary"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Add Cloudinary Image</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-2.5 py-1.5 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#F0EDE5] text-[11px] font-semibold text-[#141915] transition-colors flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#0C3823]" />
                <span>Import .md File</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleMdFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={copyMarkdown}
                className="p-1.5 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#F0EDE5] transition-colors"
                title="Copy Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0C3823]" /> : <Copy className="w-3.5 h-3.5 text-[#666C64]" />}
              </button>
            </div>
          </div>
        )}

        {/* Editor Main Content Container */}
        <div className={`grid ${mode === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8]' : 'grid-cols-1'}`}>
          {/* Write Textarea */}
          {mode !== 'preview' && (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full ${minHeight} p-4 font-mono text-xs leading-relaxed text-[#141915] bg-[#FDFBF7] focus:outline-none resize-y`}
            />
          )}

          {/* Rendered Preview Box */}
          {mode !== 'write' && (
            <div className={`w-full ${minHeight} p-5 bg-white overflow-y-auto prose prose-sm max-w-none`}>
              <div
                className="markdown-rendered-body"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Cloudinary Media Manager Modal Picker */}
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleSelectCloudinaryImage}
      />
    </div>
  );
}

export default MarkdownEditor;
