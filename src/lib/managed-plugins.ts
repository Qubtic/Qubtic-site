import 'server-only';
import { supabase } from './supabase';
import { REGISTERED_PLUGINS, getPluginMetadata, type FramerPluginMetadata } from './plugins-registry';

export async function registeredPlugins(): Promise<FramerPluginMetadata[]> {
    const builtins = [...new Map(Object.values(REGISTERED_PLUGINS).map(plugin => [plugin.slug, plugin])).values()];
    const { data, error } = await supabase.from('plugin_registry').select('slug,name').is('cancelled_at', null).eq('builtin', false).order('created_at');
    if (error) throw new Error('Apply the dashboard plugin registry migration before registering plugins.');
    const known = new Set(builtins.map(plugin => plugin.slug));
    return [...builtins, ...(data || []).filter(plugin => !known.has(plugin.slug)).map(plugin => ({ ...getPluginMetadata(plugin.slug), name: plugin.name, shortName: plugin.name, logo: '' }))];
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
