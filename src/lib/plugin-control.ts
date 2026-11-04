import 'server-only';
import { supabase } from './supabase';
import { decryptSecrets } from './plugin-secrets.mjs';
import type { BillingEnvironment } from './billing/config.mjs';
export async function controlRecord(id: string) {
    const { data, error } = await supabase.from('plugin_control').select('*').eq('id', id).maybeSingle();
    if (error)
        throw new Error('Plugin dashboard database unavailable. Apply the plugin control migration.');
    return data;
}
export function recordSecrets(row: {
    id: string;
    secrets: string;
}) { return decryptSecrets(row.secrets, process.env.PLUGIN_CONFIG_ENCRYPTION_KEY, row.id); }
export async function loadManagedBilling(environment: BillingEnvironment) {
    const row = await controlRecord('polar:' + environment);
    if (!row || !row.settings.enabled)
        throw new Error('Enable and validate this Polar environment in the plugin dashboard.');
    const secrets = recordSecrets(row);
    return Object.freeze({ POLAR_ENVIRONMENT: environment, POLAR_ACCESS_TOKEN: secrets.accessToken,
        POLAR_WEBHOOK_SECRET: secrets.webhookSecret, POLAR_ORGANIZATION_ID: row.settings.organizationId,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL, managed: 'true', MANAGED_PLUGINS: JSON.stringify(row.settings.plugins) });
}
export async function loadManagedMail() {
    const row = await controlRecord('mail');
    // Delivery credentials always come from ENV. Legacy database secrets are never read.
    return {
        teamEmail: row?.settings.teamEmail || process.env.TEAM_NOTIFICATION_EMAIL || process.env.SMTP_FROM_EMAIL,
        signup: row?.settings.signup ?? true,
        signin: row?.settings.signin ?? false,
        purchase: row?.settings.purchase ?? true,
    };
}
