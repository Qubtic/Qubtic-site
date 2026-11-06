import 'server-only';
import { supabase } from './supabase';
import { REGISTERED_PLUGINS, getPluginMetadata, type FramerPluginMetadata } from './plugins-registry';

export type ManagedPlugin = FramerPluginMetadata & { archived: boolean; registryVersion: number };
export async function registeredPlugins(includeArchived = false): Promise<ManagedPlugin[]> {
    const builtins = [...new Map(Object.values(REGISTERED_PLUGINS).map(plugin => [plugin.slug, plugin])).values()];
    const { data, error } = await supabase.from('plugin_registry').select('slug,name,builtin,archived_at,version').is('cancelled_at', null).order('created_at');
    if (error) throw new Error('Apply the plugin archive migration before managing plugins.');
    const known = new Set(builtins.map(plugin => plugin.slug));
    const rows = data || [];
    const result: ManagedPlugin[] = builtins.map(plugin => { const row = rows.find(item => item.slug === plugin.slug); return { ...plugin, archived: Boolean(row?.archived_at), registryVersion: row?.version || 0 }; });
    for (const row of rows) if (!known.has(row.slug)) result.push({ ...getPluginMetadata(row.slug), name: row.name, shortName: row.name, logo: '', archived: Boolean(row.archived_at), registryVersion: row.version || 0 });
    return includeArchived ? result : result.filter(plugin => !plugin.archived);
}

export async function serverPluginMetadata(rawSlug: string): Promise<FramerPluginMetadata> {
    const fallback = getPluginMetadata(rawSlug);
    // Existing installed plugins keep their established metadata and auth behavior.
    if (Object.hasOwn(REGISTERED_PLUGINS, fallback.slug)) return fallback;
    const { data, error } = await supabase.from('plugin_registry').select('name').eq('slug', fallback.slug).is('cancelled_at', null).maybeSingle();
    if (error) throw new Error('Plugin registration is unavailable.');
    if (!data) return fallback;
    const { data: control, error: settingsError } = await supabase.from('plugin_control').select('settings').eq('id', 'polar:production').maybeSingle();
    if (settingsError) throw new Error('Plugin settings are unavailable.');
    const configured = control?.settings?.plugins?.find((plugin: { slug: string }) => plugin.slug === fallback.slug);
    const value = typeof configured?.logo === 'string' ? configured.logo : '';
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const logo = !value ? fallback.logo : value.startsWith('/') || value.startsWith('https://res.cloudinary.com/') ? value : cloud ? `https://res.cloudinary.com/${cloud}/image/upload/${value}` : fallback.logo;
    return { ...fallback, name: data.name, shortName: data.name, logo };
}
