"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Search, Mail, Trash2, Pencil, UserPlus, TrendingUp, CreditCard, X, ArrowUpRight } from 'lucide-react';
import OperationUndo, { type UndoAction } from './OperationUndo';
type User = {
    id: string;
    email: string;
    name: string;
    company_name: string;
    website_url: string;
    plugin_slug: string;
    plugin_name: string;
    status: string;
    framer_user_id: string;
    framer_project_id: string;
    created_at: string;
    last_login_at: string;
    updated_at: string;
    email_verified: boolean;
    purchases: number;
};
type Order = {
    polar_order_id: string;
    email: string;
    plugin_slug: string;
    cadence: string;
    status: string;
    amount: number;
    refunded_amount: number;
    currency: string;
    purchased_at: string;
    site_id: string;
};
type Event = {
    id: string;
    email: string;
    recipient?: string;
    plugin: string;
    event: string;
    subject?: string;
    body?: string;
    created_at: string;
    delivered_at: string;
    cancelled_at: string;
    attempts: number;
};
type Snapshot = {
    users: User[];
    orders: Order[];
    mail: Event[];
    mailLog: {
        email: string;
        plugin: string;
        event: string;
        status: string;
        created_at: string;
    }[];
    daily: {
        date: string;
        signups: number;
    }[];
    totalUsers: number;
    totalOrders: number;
    newUsers: number;
    activeUsers: number;
    revenue: {
        currency: string;
        net: number;
    }[];
};
const date = (value: string) => value ? new Date(value).toLocaleString() : 'Not provided';
const money = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(value / 100);
export default function PluginOperations({ version = 0 }: {
    version?: number;
}) {
    const [environment, setEnvironment] = useState('production'), [plugin, setPlugin] = useState(''), [search, setSearch] = useState(''), [query, setQuery] = useState(''), [page, setPage] = useState(0), [view, setView] = useState('users'), [data, setData] = useState<Snapshot | null>(null), [registry, setRegistry] = useState<{
        slug: string;
        name: string;
    }[]>([]), [loading, setLoading] = useState(true), [message, setMessage] = useState(''), [reload, setReload] = useState(0), [modal, setModal] = useState<{
        mode: string;
        user: Partial<User>;
    } | null>(null), [draft, setDraft] = useState<Partial<User>>({}), [subject, setSubject] = useState(''), [body, setBody] = useState(''), [busy, setBusy] = useState(false), [undo, setUndo] = useState<UndoAction | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const closeUndo = useCallback(() => setUndo(null), []);
    useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(0); }, 350); return () => clearTimeout(timer); }, [search]);
    useEffect(() => { const controller = new AbortController(); setLoading(true); fetch('/api/admin/plugin-operations?' + new URLSearchParams({ environment, plugin, search: query, page: String(page) }), { signal: controller.signal, cache: 'no-store' }).then(async (r) => { const d = await r.json(); if (!r.ok)
        throw Error(d.error); setData(d.snapshot); setRegistry(d.plugins); setMessage(''); }).catch(e => { if (e.name !== 'AbortError')
        setMessage(e.message); }).finally(() => { if (!controller.signal.aborted)
        setLoading(false); }); return () => controller.abort(); }, [environment, plugin, query, page, reload, version]);
    useEffect(() => { if (modal)
        dialog.current?.showModal();
    else
        dialog.current?.close(); }, [modal]);
    function open(mode: string, user: Partial<User> = {}) { setDraft({ ...user, name: user.name || '', company_name: user.company_name || '', website_url: user.website_url || '', status: user.status || 'pending_verification', plugin_slug: user.plugin_slug || registry[0]?.slug }); setSubject(''); setBody(''); setModal({ mode, user }); }
    async function mutate(action: string, extra: object) { setBusy(true); try {
        const r = await fetch('/api/admin/plugin-operations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) });
        const d = await r.json();
        if (!r.ok)
            throw Error(d.error);
        setModal(null);
        setMessage('Change saved.');
        if (d.undo)
            setUndo(d.undo);
        setReload(v => v + 1);
    }
    catch (e) {
        setMessage(e instanceof Error ? e.message : 'Action failed.');
    }
    finally {
        setBusy(false);
    } }
    function profile() { return { name: draft.name || '', company_name: draft.company_name || '', website_url: draft.website_url || '', status: draft.status, expected_updated_at: modal?.user.updated_at, email: draft.email, plugin_slug: draft.plugin_slug }; }
    const max = Math.max(1, ...(data?.daily || []).map(v => Number(v.signups)));
    return <section className="ops-panel" aria-label="Plugin operations"><div className="pc-overview">{[{ label: 'Plugin accounts', value: data?.totalUsers, icon: Users }, { label: 'New accounts · 7 days', value: data?.newUsers, icon: TrendingUp }, { label: 'Active accounts · 7 days', value: data?.activeUsers, icon: ArrowUpRight }].map(({ label, value, icon: Icon }) => <article className="pc-stat" key={label}><span className="pc-icon-tile"><Icon size={20}/></span><span className="pc-stat-label">{label}</span><strong>{loading ? '…' : value ?? '—'}</strong></article>)}</div>
 <div className="ops-toolbar"><label>Payment environment<select value={environment} onChange={e => { setEnvironment(e.target.value); setPage(0); }}><option value="production">Live production</option><option value="sandbox">Sandbox testing</option></select></label><label>Plugin<select value={plugin} onChange={e => { setPlugin(e.target.value); setPage(0); }}><option value="">All registered plugins</option>{registry.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label><label className="ops-search"><span><Search size={15}/>Search accounts or payments</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Email, name, Framer ID or order ID"/></label></div>
 <p className="pc-muted">Account registration is shared across environments. Payments and revenue use the selected environment. Mail history includes shared account messages.</p>
 {message && <p className="pc-notice" role="status">{message}</p>}
 <article className="pc-card"><div className="pc-heading"><h3 className="pc-section-title"><TrendingUp size={20}/>Account growth · last 30 days</h3><span className="pc-muted">Daily registrations (UTC)</span></div><svg className="ops-chart" viewBox="0 0 600 115" role="img" aria-label="Daily new plugin accounts during the last 30 days">{data?.daily.map((v, i) => <rect className="ops-bar" key={v.date} x={i * 20 + 2} y={100 - Number(v.signups) / max * 90} width={14} height={Math.max(1, Number(v.signups) / max * 90)} rx={3}><title>{v.date}: {v.signups} registrations</title></rect>)}</svg><div className="ops-revenue"><CreditCard size={17}/>{environment === 'production' ? 'Live' : 'Sandbox'} orders: {data?.totalOrders ?? '—'}{data?.revenue.map(r => <span key={r.currency}>Net {money(Number(r.net), r.currency)}</span>)}</div></article>
 <div className="pc-heading"><div className="pc-tabs" role="group" aria-label="Operations section">{[['users', 'Users'], ['payments', 'Payments'], ['mail', 'Email history']].map(([id, label]) => <button key={id} aria-pressed={view === id} onClick={() => { setView(id); setPage(0); }}>{label}</button>)}</div><button disabled={busy || !registry.length} onClick={() => open('create')}><UserPlus size={16}/>Create account</button></div>
 <div className="ops-table-wrap" aria-busy={loading}>{view === 'users' ? <table className="ops-table"><thead><tr><th>Account</th><th>Plugin</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{data?.users.map(u => <tr key={u.id}><td><button className="ops-link" onClick={() => open('details', u)}>{u.name || 'Unnamed user'}</button><small>{u.email}</small></td><td>{u.plugin_name || u.plugin_slug}</td><td><span className="ops-badge">{u.status}</span><small>{u.email_verified ? 'Verified email' : 'Unverified email'}</small><small>{u.purchases || 0} payments · {environment}</small></td><td>{date(u.created_at)}</td><td className="ops-row-actions"><button aria-label={'Edit ' + u.email} onClick={() => open('update', u)}><Pencil size={15}/></button><button aria-label={'Email ' + u.email} onClick={() => open('mail', u)}><Mail size={15}/></button><button aria-label={'Deactivate ' + u.email} onClick={() => open('delete', u)}><Trash2 size={15}/></button></td></tr>)}</tbody></table> : view === 'payments' ? <table className="ops-table"><thead><tr><th>Payer</th><th>Plugin / site</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead><tbody>{data?.orders.map(o => <tr key={o.polar_order_id}><td>{o.email}<small>{o.polar_order_id}</small></td><td>{registry.find(p => p.slug === o.plugin_slug)?.name || o.plugin_slug}<small>{o.site_id || 'No site binding'}</small></td><td>{money(o.amount, o.currency)}<small>{o.cadence} · refunded {money(o.refunded_amount, o.currency)}</small></td><td>{o.status}</td><td>{date(o.purchased_at)}</td></tr>)}</tbody></table> : <><table className="ops-table"><thead><tr><th>Recipient</th><th>Message</th><th>Status</th><th>Date</th></tr></thead><tbody>{data?.mail.map(m => <tr key={m.id}><td>{m.recipient || (m.event === 'manual' ? m.email : 'Team inbox')}<small>Account: {m.email}</small><small>{registry.find(p => p.slug === m.plugin)?.name || m.plugin}</small></td><td>{m.subject || m.event}{m.body && <details><summary>View message</summary><p>{m.body}</p></details>}</td><td>{m.cancelled_at ? 'Cancelled' : m.delivered_at ? 'Accepted by SMTP' : m.attempts >= 10 ? 'Needs attention' : 'Queued'}<small>{m.attempts} attempts</small></td><td>{date(m.created_at)}</td></tr>)}</tbody></table><h4>Account email delivery</h4><table className="ops-table"><thead><tr><th>Recipient</th><th>Category</th><th>Status</th><th>Date</th></tr></thead><tbody>{data?.mailLog.map((m, i) => <tr key={i}><td>{m.email}</td><td>{m.event}</td><td>{m.status}</td><td>{date(m.created_at)}</td></tr>)}</tbody></table></>}</div>
 {!loading && data && !(view === 'users' ? data.users.length : view === 'payments' ? data.orders.length : data.mail.length + data.mailLog.length) && <p className="pc-notice">No matching records.</p>}
 <div className="ops-pagination"><button disabled={page === 0 || loading} onClick={() => setPage(v => v - 1)}>Previous</button><span>Page {page + 1}</span><button disabled={loading || (view === 'users' ? (data?.totalUsers || 0) <= (page + 1) * 25 : view === 'payments' ? (data?.totalOrders || 0) <= (page + 1) * 25 : (data?.mail.length || 0) < 25 && (data?.mailLog.length || 0) < 25)} onClick={() => setPage(v => v + 1)}>Next</button></div>
 <dialog className="ops-modal" ref={dialog} onCancel={() => setModal(null)} aria-labelledby="ops-modal-title"><div className="pc-heading"><h3 id="ops-modal-title">{modal?.mode === 'delete' ? 'Deactivate this user?' : modal?.mode === 'mail' ? 'Compose email' : modal?.mode === 'create' ? 'Create pending account' : modal?.mode === 'details' ? 'Account details' : 'Edit account'}</h3><button type="button" aria-label="Close dialog" disabled={busy} onClick={() => setModal(null)}><X size={18}/></button></div>
 {modal?.mode === 'details' ? <><dl className="ops-details">{Object.entries(modal.user).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{String(value ?? 'Not provided')}</dd></div>)}</dl><div className="ops-modal-actions"><button onClick={() => { setSearch(modal.user.email || ''); setView('payments'); setModal(null); }}>View payments</button><button onClick={() => { setSearch(modal.user.email || ''); setView('mail'); setModal(null); }}>Email history</button><button onClick={() => open('mail', modal.user)}><Mail size={16}/>Email this user</button></div></> : modal?.mode === 'delete' ? <><p>{modal.user.name} · {modal.user.email}</p><p>The account will be deactivated. Purchases, subscriptions and audit history remain intact. A five-second restore window follows confirmation.</p><div className="ops-modal-actions"><button disabled={busy} onClick={() => setModal(null)}>Cancel</button><button disabled={busy} onClick={() => mutate('delete', { userId: modal.user.id, patch: profile() })}>Confirm deactivation</button></div></> : <form onSubmit={e => { e.preventDefault(); void mutate(modal?.mode || '', modal?.mode === 'mail' ? { userId: modal.user.id, subject, message: body } : { userId: modal?.user.id, patch: profile() }); }}>
 {modal?.mode === 'mail' ? <><p>To: {modal.user.email}</p><label>Subject<input required maxLength={160} value={subject} onChange={e => setSubject(e.target.value)}/></label><label>Message<textarea required maxLength={6000} rows={8} value={body} onChange={e => setBody(e.target.value)}/></label><p className="pc-muted">The email waits five seconds before delivery is eligible. Sent email cannot be recalled.</p></> : <><label>Name<input required maxLength={300} value={draft.name || ''} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}/></label>{modal?.mode === 'create' && <><label>Email<input type="email" required value={draft.email || ''} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}/></label><label>Registered plugin<select value={draft.plugin_slug} onChange={e => setDraft(d => ({ ...d, plugin_slug: e.target.value }))}>{registry.map(p => <option value={p.slug} key={p.slug}>{p.name}</option>)}</select></label><p className="pc-muted">The account starts unverified and must complete the normal signup flow. Creating it grants no paid access.</p></>}<label>Company<input value={draft.company_name || ''} onChange={e => setDraft(d => ({ ...d, company_name: e.target.value }))}/></label><label>Website<input type="url" value={draft.website_url || ''} onChange={e => setDraft(d => ({ ...d, website_url: e.target.value }))}/></label>{modal?.mode === 'update' && <label>Account status<select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}>{['active', 'inactive', 'suspended', 'pending_verification'].map(s => <option key={s}>{s}</option>)}</select></label>}</>}
 {message && <p role="status">{message}</p>}<div className="ops-modal-actions"><button type="button" disabled={busy} onClick={() => setModal(null)}>Cancel</button><button disabled={busy} type="submit">{busy ? 'Saving…' : modal?.mode === 'mail' ? 'Queue email' : 'Save account'}</button></div></form>}
 </dialog><OperationUndo value={undo} onClose={closeUndo} onUndo={async () => { if (undo) {
        await mutate(undo.action, { id: undo.id });
        setUndo(null);
    } }}/>
 </section>;
}
