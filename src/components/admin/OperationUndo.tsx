"use client";
import { useEffect, useRef, useState } from 'react';
import { Undo2, Check } from 'lucide-react';
export type UndoAction = {
    id: string;
    undoUntil: string;
    action: string;
};
export default function OperationUndo({ value, onUndo, onClose }: {
    value: UndoAction | null;
    onUndo: () => Promise<void>;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null), [remaining, setRemaining] = useState(5), [busy, setBusy] = useState(false);
    useEffect(() => { if (!value)
        return; ref.current?.showModal(); const tick = () => { const left = Math.max(0, Math.ceil((Date.parse(value.undoUntil) - Date.now()) / 1000)); setRemaining(left); if (!left) {
        ref.current?.close();
        onClose();
    } }; tick(); const timer = setInterval(tick, 100); return () => { clearInterval(timer); ref.current?.close(); }; }, [value, onClose]);
    return <dialog className="ops-modal ops-undo" ref={ref} onCancel={onClose} aria-labelledby="undo-title"><span className="pc-icon-tile"><Check size={24}/></span><h3 id="undo-title">{value?.action === 'cancel-mail' ? 'Email queued' : 'Change saved'}</h3><p>{value?.action === 'cancel-mail' ? 'Delivery waits until this cancellation window closes.' : 'You can restore this change during the undo window.'}</p><p className="ops-countdown" role="timer">{remaining} seconds remaining</p><div className="ops-modal-actions"><button type="button" onClick={onClose}>Keep change</button><button type="button" disabled={busy || remaining === 0} onClick={async () => { setBusy(true); try {
        await onUndo();
    }
    finally {
        setBusy(false);
    } }}><Undo2 size={16}/>Undo</button></div></dialog>;
}
