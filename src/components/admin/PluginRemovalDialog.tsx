"use client";
import { useEffect, useRef, useState } from 'react';
import { Archive, RotateCcw, X } from 'lucide-react';

export default function PluginRemovalDialog({ plugin, action, onClose, onConfirm }: {
    plugin: { name: string; slug: string };
    action: 'archive' | 'restore';
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const ref = useRef<HTMLDialogElement>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
    useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
    const restoring = action === 'restore';
    return <dialog ref={ref} className="ops-modal pc-removal-modal" aria-labelledby="plugin-removal-title" onCancel={event => { if (busy) event.preventDefault(); else onClose(); }}>
        <div className="pc-heading"><span className="pc-icon-tile">{restoring ? <RotateCcw size={22}/> : <Archive size={22}/>}</span><button type="button" disabled={busy} onClick={onClose} aria-label="Close plugin removal"><X size={18}/></button></div>
        <h3 id="plugin-removal-title">{restoring ? 'Restore' : 'Remove'} {plugin.name}?</h3>
        <p>{restoring ? 'Bring this plugin back to the active list. Its saved configuration stays available, and payment plans remain disabled until you validate and publish them.' : 'Remove this plugin from the active list and stop creating new checkouts in live and sandbox. Its saved configuration, users, purchases and paid access are preserved.'}</p>
        {!restoring && <p>Existing Polar subscriptions continue billing. Already-open checkouts can still complete.</p>}
        <div className="pc-removal-reference"><span>Permanent plugin ID</span><code>{plugin.slug}</code></div>
        <p className="pc-muted">Saved settings will reload, discarding unsaved edits. You can undo this action for five seconds.</p>
        {error && <p role="alert" className="pc-notice">{error}</p>}
        <div className="ops-modal-actions"><button type="button" disabled={busy} onClick={onClose}>Cancel</button><button type="button" className={restoring ? '' : 'pc-danger-button'} disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await onConfirm(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to update plugin.'); } finally { setBusy(false); } }}>{restoring ? <RotateCcw size={16}/> : <Archive size={16}/>} {busy ? 'Saving…' : restoring ? 'Restore plugin' : 'Remove plugin'}</button></div>
    </dialog>;
}
