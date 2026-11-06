"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldCheck, Mail, Save, RefreshCw, CircleDollarSign, FlaskConical, Package, History, ChevronDown, ArrowUpRight, Send, LockKeyhole, Plus } from 'lucide-react';
import './plugin-dashboard.css';
import { CloudImage } from '@/components/ui/CloudImage';
import { CloudinaryUploader } from './CloudinaryUploader';
import PluginOperations from './PluginOperations';
import AddPluginDialog from './AddPluginDialog';
import OperationUndo, { type UndoAction } from './OperationUndo';
type Plan = {
    cadence: string;
    productId: string;
    benefitId: string;
};
type Plugin = {
    slug: string;
    name: string;
    enabled: boolean;
    logo?: string;
    manifest: string;
    testEmails: string;
    benefitId?: string;
    plans: Plan[];
};
type Settings = {
    enabled: boolean;
    organizationId: string;
    plugins: Plugin[];
    teamEmail: string;
    signup: boolean;
    signin: boolean;
    purchase: boolean;
};
type RecordRow = {
    id: string;
    settings: Settings;
    revision: number;
    configuredSecrets: string[];
};
const names = [['whatsapp-commerce', 'Email Commerce'], ['telegram-commerce', 'Telegram Commerce'], ['frame-drop', 'Frame Drop'], ['qube-auth', 'Qube Auth']];
function defaults(): Settings { return { enabled: false, organizationId: '', plugins: names.map(([slug, name]) => ({ slug, name, enabled: false, manifest: '{}', testEmails: '', plans: ['monthly', 'yearly', 'lifetime'].map(cadence => ({ cadence, productId: '', benefitId: '' })) })), teamEmail: '', signup: true, signin: false, purchase: true }; }
export default function PluginDashboard() {
    const [tab, setTab] = useState('polar:production'), [records, setRecords] = useState<RecordRow[]>([]), [settings, setSettings] = useState<Settings>(defaults), [secrets, setSecrets] = useState<Record<string, string>>({}), [audit, setAudit] = useState<{
        config_id: string;
        revision: number;
        created_at: string;
    }[]>([]), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [loaded, setLoaded] = useState(false);
    const [undo, setUndo] = useState<UndoAction | null>(null);
    const closeUndo = useCallback(() => setUndo(null), []);
    const [registry, setRegistry] = useState<{
        slug: string;
        name: string;
        logo: string;
    }[]>([]);
    const [operationsVersion, setOperationsVersion] = useState(0);
    const [section, setSection] = useState('operations');
    const [selectedPlugin, setSelectedPlugin] = useState('telegram-commerce');
    const [registerOpen, setRegisterOpen] = useState(false);
    const loadedSource = useRef<{ tab: string; records: RecordRow[] } | null>(null);
    async function reload() {
        setBusy(true);
        try {
            const r = await fetch('/api/admin/plugins', { cache: 'no-store' });
            const d = await r.json();
            if (!r.ok)
                throw Error(d.error);
            setRegistry(d.plugins || []);
            setRecords(d.records);
            setAudit(d.audit);
            setLoaded(true);
            setOperationsVersion(v => v + 1);
        }
        catch (e) {
            setMessage(e instanceof Error ? e.message : 'Unable to load settings.');
        }
        finally {
            setBusy(false);
        }
    }
    useEffect(() => { void reload(); }, []);
    useEffect(() => { const row = records.find(r => r.id === tab); const keepDraft = loadedSource.current?.tab === tab && loadedSource.current.records === records; loadedSource.current = { tab, records }; setSettings(current => { const base = { ...defaults(), ...(keepDraft ? current : row?.settings) }; base.plugins = registry.map(p => {
        const saved = base.plugins.find(v => v.slug === p.slug);
        const item = saved || { slug: p.slug, name: p.name, logo: p.logo, enabled: false, manifest: '{}', testEmails: '', plans: ['monthly', 'yearly', 'lifetime'].map(cadence => ({ cadence, productId: '', benefitId: '' })) };
        const benefits = [...new Set(item.plans.map(plan => plan.benefitId).filter(Boolean))];
        return { ...item, benefitId: item.benefitId ?? (benefits.length === 1 ? benefits[0] : '') };
    }); return base; }); if (!keepDraft) setSecrets({}); }, [tab, records, registry]);
    function field(key: keyof Settings, value: unknown) { setSettings(s => ({ ...s, [key]: value })); }
    function plugin(index: number, value: Partial<Plugin>) {
        if (value.slug)
            setSelectedPlugin(value.slug);
        setSettings(s => ({ ...s, plugins: s.plugins.map((p, i) => i === index ? { ...p, ...value } : p) }));
    }
    async function save() {
        setBusy(true);
        setMessage('Validating provider settings…');
        try {
            const r = await fetch('/api/admin/plugins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: tab, settings, secrets, revision: records.find(r => r.id === tab)?.revision || 0 }) });
            const d = await r.json();
            if (!r.ok)
                throw Error(d.error);
            setMessage('Configuration validated and published. New requests use these settings.');
            if (d.undo)
                setUndo(d.undo);
            await reload();
        }
        catch (e) {
            setMessage(e instanceof Error ? e.message : 'Unable to publish.');
        }
        finally {
            setBusy(false);
        }
    }
    const row = records.find(r => r.id === tab);
    const activePlugin = settings.plugins.some(p => p.slug === selectedPlugin) ? selectedPlugin : settings.plugins[0]?.slug;
    function secret(key: string, label: string) { return <label>{label}<input type="password" autoComplete="new-password" value={secrets[key] || ''} placeholder={row?.configuredSecrets.includes(key) ? 'Saved securely · leave blank to keep' : 'Enter credential'} onChange={e => setSecrets(s => ({ ...s, [key]: e.target.value }))}/></label>; }
    return <section className="plugin-control" aria-label="Plugin dashboard">
 <header className="pc-heading"><div><span className="pc-eyebrow"><ShieldCheck size={15}/> QUBTIC CONTROL CENTER</span><h2>Plugins & payments</h2><p>Manage live products, development testing and team notifications in one place.</p></div><div className="pc-heading-actions"><button type="button" disabled={busy || !loaded} onClick={() => setRegisterOpen(true)}><Plus size={16}/> Add plugin</button><button type="button" disabled={busy} onClick={reload}><RefreshCw size={16}/> Reload</button></div></header>
 <div className="pc-tabs" role="group" aria-label="Dashboard workspace"><button aria-pressed={section === 'operations'} onClick={() => setSection('operations')}>Users, payments & growth</button><button aria-pressed={section === 'configuration'} onClick={() => setSection('configuration')}>Credentials & plugin settings</button></div>
 {section === 'operations' ? <PluginOperations version={operationsVersion}/> : <>
 <div className="pc-overview">{[{ id: 'polar:production', label: 'Live payments', icon: CircleDollarSign }, { id: 'polar:sandbox', label: 'Development', icon: FlaskConical }, { id: 'mail', label: 'Team notifications', icon: Mail }].map(({ id, label, icon: Icon }) => { const saved = records.find(r => r.id === id); return <button type="button" className="pc-stat" key={id} onClick={() => setTab(id)}><span className="pc-stat-top"><span className="pc-icon-tile"><Icon size={20} aria-hidden="true"/></span><ArrowUpRight size={16} aria-hidden="true"/></span><span className="pc-stat-label">{label}</span><strong>{!loaded ? 'Loading…' : !saved ? 'Not configured' : id === 'mail' ? 'Alerts configured' : saved.settings.enabled ? 'Enabled' : 'Paused'}</strong><span className="pc-stat-detail">{saved && id !== 'mail' ? `${saved.settings.plugins.filter(p => p.enabled).length} enabled plugins · revision ${saved.revision}` : saved ? 'Manage recipients & event alerts' : 'Complete setup to get started'}</span></button>; })}</div>
 <div className="pc-tabs" role="group" aria-label="Configuration section">{[['polar:production', 'Live payments'], ['polar:sandbox', 'Sandbox testing'], ['mail', 'Team & email']].map(([id, label]) => <button key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setMessage(''); }} disabled={busy}>{id === 'mail' ? <Mail size={16} aria-hidden="true"/> : id === 'polar:sandbox' ? <FlaskConical size={16} aria-hidden="true"/> : <CircleDollarSign size={16} aria-hidden="true"/>} {label}</button>)}</div>
 {message && <p className="pc-notice" role="status">{message}</p>}
 {!loaded ? <p>Load the dashboard to configure your plugins.</p> : <form onSubmit={e => { e.preventDefault(); void save(); }}>
 {tab !== 'mail' ? <><details className="pc-card pc-connection"><summary><span className="pc-section-title"><LockKeyhole size={18} aria-hidden="true"/>Organization & credentials</span><span className="pc-connection-status">{row ? "Configuration saved" : "Setup required"}<ChevronDown size={16} aria-hidden="true"/></span></summary><div className="pc-connection-body"><h3 className="pc-section-title">{tab === 'polar:production' ? <CircleDollarSign size={20} aria-hidden="true"/> : <FlaskConical size={20} aria-hidden="true"/>}{tab === 'polar:production' ? 'Production organization' : 'Sandbox organization'}</h3><p>Each environment stays separate. Secret values are never returned to this browser.</p><label className="pc-toggle"><input type="checkbox" checked={settings.enabled} onChange={e => field('enabled', e.target.checked)}/> Enable this payment environment</label><div className="pc-grid"><label>Organization UUID<input value={settings.organizationId} onChange={e => field('organizationId', e.target.value)}/></label>{secret('accessToken', 'Polar access token')}{secret('webhookSecret', 'Webhook signing secret')}</div><p className="pc-muted">Webhook: {typeof window !== 'undefined' ? window.location.origin : ''}/api/billing/webhook/{tab.split(':')[1]}</p></div></details>
 <div className="pc-workspace"><aside className="pc-plugin-list" aria-label="Plugins"><div className="pc-list-heading"><span>Your plugins</span><span>{settings.plugins.length}</span></div>{settings.plugins.map(p => <button type="button" key={p.slug} aria-pressed={activePlugin === p.slug} onClick={() => setSelectedPlugin(p.slug)}><span className="pc-icon-tile">{p.logo ? <CloudImage src={p.logo} alt="" width={24} height={24}/> : p.slug === 'telegram-commerce' ? <Send size={18} aria-hidden="true"/> : p.slug === 'whatsapp-commerce' ? <Mail size={18} aria-hidden="true"/> : <Package size={18} aria-hidden="true"/>}</span><span><strong>{p.name}</strong><small>{p.enabled ? 'Plans enabled' : 'Not enabled'}</small></span></button>)}</aside><div className="pc-editor">
 {settings.plugins.map((p, i) => p.slug === activePlugin ? <article key={p.slug} className="pc-card"><div className="pc-heading"><div><h3 className="pc-section-title"><Package size={20} aria-hidden="true"/>{p.name}</h3><p>{p.slug === 'whatsapp-commerce' ? 'Existing Email Commerce account identity' : p.slug}</p></div><label className="pc-toggle"><input type="checkbox" checked={p.enabled} onChange={e => plugin(i, { enabled: e.target.checked })}/> Enable plans</label></div>
 <div className="pc-grid"><label>Plugin identifier<input value={p.slug} disabled onChange={e => plugin(i, { slug: e.target.value })}/></label><label>Display name<input value={p.name} readOnly/></label></div><div className="pc-plan-grid">{p.plans.map((plan, j) => <fieldset key={plan.cadence}><legend>{plan.cadence}</legend><label>Product UUID<input value={plan.productId} onChange={e => plugin(i, { plans: p.plans.map((v, k) => k === j ? { ...v, productId: e.target.value } : v) })}/></label></fieldset>)}</div><label className="pc-shared-benefit">Shared Pro benefit UUID<input value={p.benefitId || ''} onChange={e => plugin(i, { benefitId: e.target.value, plans: p.plans.map(plan => ({ ...plan, benefitId: e.target.value })) })}/><span className="pc-muted">One Pro benefit shared by monthly, yearly and lifetime plans in this environment.</span></label>
 {tab === 'polar:sandbox' && <label>Allowed developer emails (comma separated)<input value={p.testEmails || ''} onChange={e => plugin(i, { testEmails: e.target.value })}/><span className="pc-muted">Only these verified plugin accounts may use sandbox billing.</span></label>}
 <CloudinaryUploader value={p.logo || ''} onChange={logo => plugin(i, { logo })} label="Plugin logo" folder="qubtic_plugins"/>
 <label>Product manifest (JSON)<textarea rows={4} value={p.manifest || '{}'} onChange={e => plugin(i, { manifest: e.target.value })}/></label></article> : null)}
 </div></div></> : <article className="pc-card"><h3 className="pc-section-title"><Mail size={20} aria-hidden="true"/>Team notifications</h3><p>Choose who receives plugin activity alerts. SMTP delivery and sender settings are managed in Vercel environment variables.</p><div className="pc-grid"><label>Team notification email<input type="email" required value={settings.teamEmail} onChange={e => field('teamEmail', e.target.value)}/></label></div>{(['signup', 'signin', 'purchase'] as const).map(event => <label className="pc-toggle" key={event}><input type="checkbox" checked={settings[event]} onChange={e => field(event, e.target.checked)}/> Notify team on {event}</label>)}</article>}
 <footer className="pc-actions"><p>Changes publish together. Existing purchases and account identities are preserved.</p><button type="submit" disabled={busy}><Save size={16}/>{busy ? 'Validating…' : 'Validate & publish'}</button></footer></form>}
 <article className="pc-card"><h3 className="pc-section-title"><History size={20} aria-hidden="true"/>Recent changes</h3>{audit.length ? audit.map((a, i) => <p key={i} className="pc-muted">{a.config_id} · revision {a.revision} · {new Date(a.created_at).toLocaleString()}</p>) : <p>No configuration changes yet.</p>}</article>
 </>}
 {registerOpen && <AddPluginDialog onClose={() => setRegisterOpen(false)} onRegistered={(created, action) => {
        setRegistry(list => [...list, created]); setSelectedPlugin(created.slug); setSection('configuration'); if (tab === 'mail') setTab('polar:production');
        setOperationsVersion(value => value + 1); setMessage('Plugin registered. Configure and enable its plans when ready.'); setUndo(action);
    }}/>}
 <OperationUndo value={undo} onClose={closeUndo} onUndo={async () => { const registration = undo?.action === 'undo-registration'; const r = await fetch(registration ? '/api/admin/plugin-registry' : '/api/admin/plugins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'undo', id: undo?.id }) }); const d = await r.json(); if (!r.ok)
        setMessage(d.error);
    else {
        if (registration) { setRegistry(list => list.filter(plugin => plugin.slug !== undo?.slug)); setOperationsVersion(value => value + 1); setMessage('Plugin registration undone.'); }
        else { setMessage('Configuration restored.'); await reload(); }
    } setUndo(null); }}/>
 </section>;
}
