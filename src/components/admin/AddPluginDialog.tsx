"use client";
import { useEffect, useRef, useState } from 'react';
import { PackagePlus, X } from 'lucide-react';
import type { UndoAction } from './OperationUndo';

export default function AddPluginDialog({ onClose, onRegistered }: {
    onClose: () => void;
    onRegistered: (plugin: { slug: string; name: string; logo: string }, undo: UndoAction) => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const [name, setName] = useState(''), [slug, setSlug] = useState(''), [customId, setCustomId] = useState(false);
    const [busy, setBusy] = useState(false), [error, setError] = useState('');
    useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
    return <dialog className="ops-modal pc-register-modal" ref={ref} aria-labelledby="register-plugin-title" onCancel={event => { if (busy) event.preventDefault(); else onClose(); }}>
        <div className="pc-heading"><h3 id="register-plugin-title" className="pc-section-title"><PackagePlus size={21}/>Add plugin</h3><button type="button" aria-label="Close registration" disabled={busy} onClick={onClose}><X size={18}/></button></div>
        <p>Register a Framer plugin once, then configure its sandbox and live plans. Payments start disabled.</p>
        <form onSubmit={async event => {
            event.preventDefault(); setBusy(true); setError('');
            try {
                const response = await fetch('/api/admin/plugin-registry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', name: name.trim(), slug }) });
                const data = await response.json();
                if (!response.ok) throw Error(data.error || 'Unable to register plugin.');
                onClose(); onRegistered({ ...data.plugin, logo: '' }, data.undo);
            } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to register plugin.'); }
            finally { setBusy(false); }
        }}>
            <label>Plugin name<input autoFocus required maxLength={80} value={name} disabled={busy} onChange={event => {
                setName(event.target.value); setError('');
                if (!customId) setSlug(event.target.value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64));
            }}/></label>
            <label>Permanent plugin ID<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={64} value={slug} disabled={busy} spellCheck={false} autoCapitalize="none" aria-describedby="register-id-help" onChange={event => { setCustomId(true); setSlug(event.target.value); setError(''); }}/></label>
            <p id="register-id-help" className="pc-muted">Use this exact ID in the Framer plugin’s login and billing integration. It stays fixed after registration.</p>
            <p className="pc-muted">After registration, select the plugin to add its logo, product IDs, shared Pro benefit and manifest.</p>
            {error && <p role="alert" className="pc-notice">{error}</p>}
            <div className="ops-modal-actions"><button type="button" disabled={busy} onClick={onClose}>Cancel</button><button type="submit" disabled={busy}><PackagePlus size={16}/>{busy ? 'Registering…' : 'Register plugin'}</button></div>
        </form>
    </dialog>;
}
