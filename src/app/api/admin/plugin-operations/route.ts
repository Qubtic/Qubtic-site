import { requirePluginAdmin } from '@/lib/admin-guard';
import { supabase } from '@/lib/supabase';
import { registeredPlugins } from '@/lib/managed-plugins';
import { randomBytes, randomUUID } from 'node:crypto';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
function failure(error: unknown) { const message = error instanceof Error ? error.message : 'Request failed.'; return Response.json({ error: message }, { status: message === 'Administrator access required.' ? 401 : 400, headers }); }
export async function GET(request: Request) { try {
    await requirePluginAdmin();
    const plugins = await registeredPlugins(true);
    const params = new URL(request.url).searchParams;
    const environment = params.get('environment') || 'production', plugin = params.get('plugin') || '', search = (params.get('search') || '').trim(), page = Number(params.get('page') || 0);
    if (!['production', 'sandbox'].includes(environment) || plugin && !plugins.some(item => item.slug === plugin) || search.length > 200 || !Number.isInteger(page) || page < 0 || page > 10000)
        throw Error('Invalid filters.');
    const { data, error } = await supabase.rpc('plugin_operations_snapshot', { p_environment: environment, p_plugin: plugin, p_search: search, p_page: page } as never);
    if (error)
        throw Error('Unable to load operations. Apply the plugin operations migration.');
    return Response.json({ snapshot: data, plugins: plugins.map(p => ({ slug: p.slug, name: p.archived ? p.name + ' (removed)' : p.name, logo: p.logo, archived: p.archived })) }, { headers });
}
catch (error) {
    return failure(error);
} }
export async function POST(request: Request) {
    try {
        const admin = await requirePluginAdmin(request);
        const text = await request.text();
        if (text.length > 12000)
            throw Error('Request too large.');
        let body;
        try {
            body = JSON.parse(text);
        }
        catch {
            throw Error('Invalid request.');
        }
        const action = body.action;
        if (action === 'undo') {
            const { error } = await supabase.rpc('undo_plugin_admin_action', { p_id: body.id, p_actor: admin.id } as never);
            if (error)
                throw Error('Undo expired or the user was changed by another action.');
            return Response.json({ success: true }, { headers });
        }
        if (action === 'cancel-mail') {
            const { error } = await supabase.rpc('cancel_plugin_admin_mail', { p_id: body.id, p_actor: admin.id } as never);
            if (error)
                throw Error('Email cancellation window expired.');
            return Response.json({ success: true }, { headers });
        }
        if (action === 'mail') {
            if (typeof body.subject !== 'string' || !body.subject.trim() || body.subject.length > 160 || /[\r\n]/.test(body.subject) || typeof body.message !== 'string' || !body.message.trim() || body.message.length > 6000)
                throw Error('Enter a subject and message (up to 6,000 characters).');
            const { data: user, error } = await supabase.from('framer_users').select('email,plugin_slug').eq('id', body.userId).maybeSingle();
            if (error || !user)
                throw Error('User not found.');
            const id = 'manual:' + randomUUID(), until = new Date(Date.now() + 5000).toISOString();
            const { error: saveError } = await supabase.from('plugin_team_events').insert({ id, event: 'manual', plugin: user.plugin_slug, email: user.email, recipient: user.email, subject: body.subject.trim(), body: body.message.trim(), actor: admin.id, available_at: until });
            if (saveError)
                throw Error('Unable to queue email.');
            return Response.json({ success: true, undo: { id, undoUntil: until, action: 'cancel-mail' } }, { headers });
        }
        if (!['create', 'update', 'delete'].includes(action))
            throw Error('Unsupported action.');
        const patch = body.patch || {};
        const clean: Record<string, unknown> = {};
        for (const key of ['name', 'company_name', 'website_url']) {
            if (typeof patch[key] !== 'string' || patch[key].length > 300 || /[\r\n]/.test(patch[key]))
                throw Error('Invalid profile fields.');
            clean[key] = patch[key].trim();
        }
        if (clean.website_url) {
            try {
                const u = new URL(String(clean.website_url));
                if (u.protocol !== 'https:')
                    throw Error();
            }
            catch {
                throw Error('Website must be an HTTPS URL.');
            }
        }
        if (action === 'create') {
            const plugins = await registeredPlugins();
            const registered = plugins.find(item => item.slug === patch.plugin_slug);
            if (typeof patch.email !== 'string' || patch.email.length > 254 || !/^\S+@[^\s@,;]+\.[^\s@,;]+$/.test(patch.email) || !registered)
                throw Error('Choose a registered plugin and valid email.');
            clean.email = patch.email.trim().toLowerCase();
            clean.plugin_slug = patch.plugin_slug;
            clean.plugin_name = registered!.name;
            const prefix = patch.plugin_slug.split('-')[0];
            clean.auth_token = 'qbt_fr_' + prefix + '_' + randomBytes(24).toString('hex');
        }
        else {
            if (!['active', 'inactive', 'suspended', 'pending_verification'].includes(patch.status) || typeof patch.expected_updated_at !== 'string')
                throw Error('Invalid account state.');
            clean.status = patch.status;
            clean.expected_updated_at = patch.expected_updated_at;
        }
        const { data, error } = await supabase.rpc('plugin_admin_mutate', { p_action: action, p_user: body.userId || null, p_patch: clean, p_actor: admin.id } as never);
        if (error)
            throw Error('Account changed or update rejected. Reload before trying again.');
        return Response.json({ success: true, undo: { ...(data as object), action: 'undo' } }, { headers });
    }
    catch (error) {
        return failure(error);
    }
}
