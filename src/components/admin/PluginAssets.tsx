"use client";
import { useId } from 'react';
import { AlignLeft, Braces, CheckCircle2, AlertCircle } from 'lucide-react';
import { CloudinaryUploader } from './CloudinaryUploader';

export default function PluginAssets({ logo, manifest, onLogoChange, onManifestChange }: {
    logo: string; manifest: string; onLogoChange: (value: string) => void; onManifestChange: (value: string) => void;
}) {
    const id = useId();
    let parsed: Record<string, unknown> | null = null;
    let validation = 'Invalid JSON — check the syntax.';
    try {
        const value = JSON.parse(manifest);
        if (value && typeof value === 'object' && !Array.isArray(value)) parsed = value;
        else validation = 'Use a JSON object, rather than a list or value.';
    } catch { /* Keep an unfinished draft editable; the server validates publication too. */ }
    return <div className="pc-assets-grid">
        <CloudinaryUploader variant="logo" value={logo} onChange={onLogoChange} label="Plugin logo" folder="qubtic_plugins"/>
        <section className="pc-manifest-card" aria-labelledby={id + '-title'}>
            <header className="pc-manifest-header"><div><h4 id={id + '-title'}><Braces size={17} aria-hidden="true"/>Product manifest<span>JSON</span></h4><p>Additional settings for this plugin.</p></div><button type="button" disabled={!parsed} onClick={() => onManifestChange(JSON.stringify(parsed, null, 2))}><AlignLeft size={15} aria-hidden="true"/>Format</button></header>
            <label className="pc-sr-only" htmlFor={id}>Product manifest (JSON)</label>
            <textarea id={id} className="pc-manifest-editor" rows={7} maxLength={16000} spellCheck={false} value={manifest} onChange={event => onManifestChange(event.target.value)} aria-invalid={!parsed} aria-describedby={id + '-status ' + id + '-help'}/>
            <footer className="pc-manifest-footer"><span id={id + '-status'} role="status" className={parsed ? 'pc-manifest-status' : 'pc-manifest-status pc-manifest-status-error'}>{parsed ? <CheckCircle2 size={14} aria-hidden="true"/> : <AlertCircle size={14} aria-hidden="true"/>}{parsed ? 'Valid JSON' : validation}</span><span>{manifest.length.toLocaleString()} characters</span></footer>
            <p id={id + '-help'} className="pc-manifest-help">Use <code>{'{}'}</code> when no extra settings are needed.</p>
        </section>
    </div>;
}
