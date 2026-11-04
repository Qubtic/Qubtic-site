import { REGISTERED_PLUGINS } from '@/lib/plugins-registry';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin-session';
import { supabase } from '@/lib/supabase';
import { controlRecord, recordSecrets } from '@/lib/plugin-control';
import { encryptSecrets } from '@/lib/plugin-secrets.mjs';
import { configuredCatalog } from '@/lib/billing/config.mjs';
import { createPolar } from '@polar-sh/sdk/2026-10';
export const runtime = 'nodejs';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'no-store' };
async function admin() {
    const session = verifyAdminSession((await cookies()).get('qubtic_admin_session')?.value);
    if (!session || !['admin', 'owner', 'ceo', 'superadmin'].includes(session.role.toLowerCase()))
        throw new Error('Unauthorized');
    return session;
}
export async function GET() {
    try {
        await admin();
        const { data, error } = await supabase.from('plugin_control').select('id,settings,secrets,revision,updated_at');
        if (error)
            throw new Error('Apply the plugin control migration before opening this panel.');
        const { data: audit } = await supabase.from('plugin_control_audit').select('config_id,revision,actor,created_at').order('created_at', { ascending: false }).limit(20);
        return Response.json({ plugins: Object.values(REGISTERED_PLUGINS).filter((p, i, all) => all.findIndex(other => other.slug === p.slug) === i).map(p => ({ slug: p.slug, name: p.name, logo: p.logo })), records: (data || []).map(row => ({ ...row, settings: row.id === 'mail' ? mailSettings(row.settings) : row.settings, secrets: undefined, configuredSecrets: row.id === 'mail' ? [] : Object.keys(recordSecrets(row)) })), audit: audit || [] }, { headers });
    }
    catch (error) {
        return failure(error);
    }
}
function mailSettings(settings: Record<string, unknown>) {
    return { teamEmail: settings.teamEmail, signup: settings.signup, signin: settings.signin, purchase: settings.purchase };
}
function failure(error: unknown) { const unauthorized = error instanceof Error && error.message === 'Unauthorized'; return Response.json({ error: unauthorized ? 'Administrator access required.' : error instanceof Error && !('statusCode' in error) && !('code' in error) ? error.message : 'Provider validation failed. Check the credentials, organization and product permissions.' }, { status: unauthorized ? 401 : 400, headers }); }
export async function POST(request: Request) {
    try {
        const session = await admin();
        if (request.headers.get('origin') !== new URL(request.url).origin)
            throw new Error('Invalid request origin.');
        if (Number(request.headers.get('content-length') || 0) > 65536)
            throw new Error('Configuration is too large.');
        const text = await request.text();
        if (text.length > 65536)
            throw new Error('Configuration is too large.');
        let body;
        try {
            body = JSON.parse(text);
        }
        catch {
            throw new Error('Invalid configuration JSON.');
        }
        if (body.action === 'undo') {
            const { error } = await supabase.rpc('undo_plugin_control', { p_id: body.id, p_actor: session.id } as never);
            if (error)
                throw new Error('Undo expired or the configuration changed.');
            return Response.json({ success: true }, { headers });
        }
        const { id, revision } = body;
        let settings = body.settings;
        if (!['polar:production', 'polar:sandbox', 'mail'].includes(id) || !Number.isInteger(revision) || !settings || typeof settings !== 'object')
            throw new Error('Invalid configuration.');
        const { error: undoSchemaError } = await supabase.from('plugin_control_audit').select('undo_until').limit(0);
        if (undoSchemaError)
            throw new Error('Apply the plugin operations migration before publishing settings.');
        const previous = await controlRecord(id);
        const secrets = { ...(id !== 'mail' && previous ? recordSecrets(previous) : {}) };
        const allowed = id === 'mail' ? [] : ['accessToken', 'webhookSecret'];
        if (id === 'mail' && (Object.keys(body.secrets || {}).length || ['host', 'port', 'secure', 'from', 'user', 'password'].some(key => key in settings)))
            throw new Error('Manage SMTP delivery settings in Vercel environment variables.');
        for (const key of allowed)
            if (body.secrets?.[key]) {
                if (typeof body.secrets[key] !== 'string')
                    throw new Error('Invalid secret.');
                secrets[key] = body.secrets[key].trim();
            }
        let catalog = null;
        if (id.startsWith('polar:')) {
            const environment = id === 'polar:production' ? 'production' : 'sandbox';
            if (!Array.isArray(settings.plugins) || settings.plugins.length > 50 || typeof settings.enabled !== 'boolean')
                throw new Error('Invalid plugin list.');
            for (const plugin of settings.plugins) {
                if (!REGISTERED_PLUGINS[plugin.slug])
                    throw new Error('Register new plugins in the backend before configuring them.');
                plugin.name = REGISTERED_PLUGINS[plugin.slug].name;
                if (!Array.isArray(plugin.plans))
                    throw new Error('Each plugin needs a plan list.');
                // Read legacy per-plan benefits, but require one shared Pro benefit on publication.
                const benefits = [...new Set(plugin.plans.map((plan: { benefitId?: string }) => plan.benefitId?.trim()).filter(Boolean))];
                if (plugin.benefitId !== undefined && typeof plugin.benefitId !== 'string')
                    throw new Error('Invalid shared Pro benefit UUID.');
                if (plugin.benefitId === undefined && benefits.length > 1)
                    throw new Error(`Choose one shared Pro benefit UUID for ${plugin.name}.`);
                plugin.benefitId = plugin.benefitId?.trim() ?? benefits[0] ?? '';
                plugin.plans = plugin.plans.map((plan: { cadence: string; productId: string }) => ({ ...plan, benefitId: plugin.benefitId }));
                if (plugin.brandColor && !/^#[0-9a-f]{6}$/i.test(plugin.brandColor))
                    throw new Error('Brand color must be a six-digit hex color.');
                if (plugin.logo && (typeof plugin.logo !== 'string' || plugin.logo.length > 1000 || !/^(?:https:\/\/res\.cloudinary\.com\/[^?#\s]+|\/?[a-zA-Z0-9_/-]+(?:\.[a-zA-Z0-9]+)?)$/.test(plugin.logo)))
                    throw new Error('Select a logo from the image manager.');
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plugin.slug) || typeof plugin.name !== 'string' || typeof plugin.enabled !== 'boolean' || typeof plugin.manifest !== 'string' || plugin.manifest.length > 16000)
                    throw new Error('Invalid plugin metadata.');
                try {
                    const manifest = JSON.parse(plugin.manifest);
                    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest))
                        throw Error();
                }
                catch {
                    throw new Error('Product manifest must be a JSON object.');
                }
                if (typeof plugin.testEmails !== 'string' || plugin.testEmails.length > 4000)
                    throw new Error('Invalid developer list.');
                for (const email of plugin.testEmails.split(',').map((v: string) => v.trim()).filter(Boolean))
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                        throw new Error('Invalid developer email.');
            }
            if (new Set(settings.plugins.map((p: {
                slug: string;
            }) => p.slug)).size !== settings.plugins.length)
                throw new Error('Plugin identities must be unique.');
            const rows = settings.plugins.filter((p: {
                enabled: boolean;
            }) => p.enabled).flatMap((p: {
                slug: string;
                plans: {
                    cadence: string;
                    productId: string;
                    benefitId: string;
                }[];
            }) => {
                if (!Array.isArray(p.plans))
                    throw new Error('Each enabled plugin needs three plans.');
                return p.plans.map(plan => ({ plugin_slug: p.slug, cadence: plan.cadence, product_id: plan.productId, benefit_id: plan.benefitId }));
            });
            catalog = configuredCatalog({ POLAR_ENVIRONMENT: environment, POLAR_EXTRA_CATALOG_JSON: JSON.stringify(rows) });
            if (settings.enabled) {
                if (!secrets.accessToken || !secrets.webhookSecret || !settings.organizationId)
                    throw new Error('Enter the organization, access token and webhook secret.');
                const polar = createPolar({ accessToken: secrets.accessToken, environment, timeout: 10 });
                const organization = await polar.organizations.get(settings.organizationId);
                if (organization.id !== settings.organizationId)
                    throw new Error('Organization mismatch.');
                await Promise.all(catalog.map(async (row) => {
                    const p = await polar.products.get(row.product_id);
                    if (p.organization_id !== settings.organizationId || p.is_archived || !p.benefits.some(b => b.id === row.benefit_id) || (row.cadence === 'lifetime' ? p.is_recurring : !p.is_recurring || p.recurring_interval !== (row.cadence === 'monthly' ? 'month' : 'year') || p.recurring_interval_count !== 1) || !p.prices.some(price => !price.is_archived && price.amount_type === 'fixed' && typeof price.price_amount === 'number' && price.price_amount > 0))
                        throw new Error(`Invalid product or benefit for ${row.plugin_slug}/${row.cadence}.`);
                }));
            }
            else
                catalog = [];
        }
        else {
            if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(settings.teamEmail) || !['signup', 'signin', 'purchase'].every(key => typeof settings[key] === 'boolean'))
                throw new Error('Enter a valid team email and notification preferences.');
            settings = mailSettings(settings);
        }
        const { error } = await supabase.rpc('publish_plugin_control', { p_id: id, p_settings: settings, p_secrets: id === 'mail' ? '' : encryptSecrets(secrets, process.env.PLUGIN_CONFIG_ENCRYPTION_KEY, id), p_revision: revision, p_actor: session.id, p_catalog: catalog } as never);
        if (error)
            throw new Error(error.code === 'P0001' ? 'Configuration changed. Reload before saving.' : 'Unable to publish configuration. No changes were saved.');
        const { data: auditRow } = await supabase.from('plugin_control_audit').select('id,undo_until').eq('config_id', id).eq('revision', revision + 1).eq('actor', session.id).maybeSingle();
        return Response.json({ success: true, undo: auditRow ? { id: String(auditRow.id), undoUntil: auditRow.undo_until, action: 'undo' } : null }, { headers });
    }
    catch (error) {
        return failure(error);
    }
}
