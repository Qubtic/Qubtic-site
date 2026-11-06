import { requirePluginAdmin } from '@/lib/admin-guard';
import { supabase } from '@/lib/supabase';
import { REGISTERED_PLUGINS, getPluginMetadata } from '@/lib/plugins-registry';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
    try {
        const admin = await requirePluginAdmin(request);
        const text = await request.text();
        if (text.length > 4000) throw Error('Registration is too large.');
        let body;
        try { body = JSON.parse(text); } catch { throw Error('Invalid registration.'); }
        if (!body || !['create', 'undo', 'archive', 'restore', 'undo-archive'].includes(body.action)) throw Error('Invalid registration action.');
        if (['archive', 'restore', 'undo-archive'].includes(body.action)) {
            if (body.action === 'undo-archive' ? typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id) : typeof body.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug) || body.slug.length > 64 || !Number.isInteger(body.version))
                throw Error('Invalid plugin removal request.');
            const { data, error } = await supabase.rpc('manage_plugin_archive', { p_action: body.action, p_slug: body.slug || null, p_actor: admin.id, p_version: body.version ?? null, p_id: body.id || null } as never);
            if (error) throw Error(error.code === 'P0001' ? 'Plugin or settings changed, or undo expired. Reload before trying again.' : 'Unable to remove or restore plugin. Apply the plugin archive migration.');
            return Response.json({ success: true, ...(body.action === 'undo-archive' ? {} : { undo: { ...(data as object), action: 'undo-plugin-archive' } }) }, { headers });
        }
        if (body.action === 'create') {
            if (typeof body.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug) || body.slug.length > 64 || typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 80 || /[\u0000-\u001f\u007f<>"]/.test(body.name))
                throw Error('Enter a name (up to 80 characters) and lowercase plugin ID with hyphens.');
            if (Object.hasOwn(REGISTERED_PLUGINS, body.slug) || getPluginMetadata(body.slug).slug !== body.slug)
                throw Error('This plugin ID is already registered or reserved for an existing plugin.');
        } else if (typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) throw Error('Invalid undo reference.');
        const { data, error } = await supabase.rpc('manage_plugin_registration', {
            p_action: body.action, p_slug: body.action === 'create' ? body.slug : null,
            p_name: body.action === 'create' ? body.name.trim() : null, p_actor: admin.id,
            p_id: body.action === 'undo' ? body.id : null,
        } as never);
        if (error) {
            if (error.code === '23505') throw Error('This plugin ID is already registered. Choose another ID.');
            if (error.code === 'P0001') throw Error(body.action === 'undo' ? 'Undo expired or this plugin is already in use.' : 'Registration rejected. Check the ID or the 50-active-plugin limit.');
            throw Error('Unable to register this plugin. Apply the dashboard plugin registry migration.');
        }
        const { data: registration } = body.action === 'create' ? await supabase.from('plugin_registry').select('version').eq('slug', body.slug).maybeSingle() : { data: null };
        return Response.json({ success: true, ...(body.action === 'create' ? { plugin: { slug: body.slug, name: body.name.trim(), version: registration?.version }, undo: { ...(data as object), action: 'undo-registration' } } : {}) }, { headers });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to register plugin.';
        return Response.json({ error: message }, { status: message === 'Administrator access required.' ? 401 : 400, headers });
    }
}
