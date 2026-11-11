import type { Polar } from '@polar-sh/sdk/2026-10';

export type DiscountCadence = 'monthly' | 'yearly' | 'lifetime';
export type DiscountConfig = { code: string; cadences: DiscountCadence[] };

export function validateDiscountConfig(value: unknown): DiscountConfig {
    if (value === undefined) return { code: '', cadences: [] };
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('Invalid discount configuration. Enter a Polar discount code and select its plans.');
    const { code, cadences } = value as Record<string, unknown>;
    if (typeof code !== 'string' || code.length > 128 || /[\p{Cc}\p{Cf}]/u.test(code))
        throw new Error('Polar discount code must be at most 128 characters with no control characters.');
    if (!Array.isArray(cadences) || cadences.some(c => !['monthly', 'yearly', 'lifetime'].includes(c)) || new Set(cadences).size !== cadences.length)
        throw new Error('Select unique monthly, yearly or lifetime discount plans.');
    const trimmed = code.trim();
    if (Boolean(trimmed) !== Boolean(cadences.length))
        throw new Error('Enter a Polar discount code and select at least one plan, or clear both.');
    return { code: trimmed, cadences: cadences as DiscountCadence[] };
}

export async function resolveCheckoutDiscount(
    sdk: Pick<Polar, 'discounts'>,
    config: unknown,
    cadence: string,
    productId: string,
    organizationId: string,
): Promise<string | undefined> {
    const discount = validateDiscountConfig(config);
    if (!discount.cadences.includes(cadence as DiscountCadence)) return undefined;
    if (!productId || !organizationId) throw new Error('Configure the discount plan product and Polar organization first.');
    const matches = [];
    try {
        // This SDK uses a search query, not a code filter; exact-match every page before trusting uniqueness.
        for (let page = 1; ; page++) {
            const result = await sdk.discounts.list({ organization_id: organizationId, query: discount.code, limit: 100, page });
            matches.push(...result.items.filter(item => item.code === discount.code));
            if (page >= result.pagination.max_page) break;
        }
    } catch {
        throw new Error('Unable to validate the Polar discount. Check the code, environment and discounts:read permission.');
    }
    if (matches.length !== 1)
        throw new Error('Polar discount code must match exactly one discount in this organization and environment.');
    const match = matches[0];
    if (!match.id || match.organization_id !== organizationId)
        throw new Error('Polar discount belongs to a different organization.');
    const now = Date.now();
    if (match.starts_at !== null && (!Number.isFinite(Date.parse(match.starts_at)) || Date.parse(match.starts_at) > now))
        throw new Error('Polar discount is not active yet. Check its start time.');
    if (match.ends_at !== null && (!Number.isFinite(Date.parse(match.ends_at)) || Date.parse(match.ends_at) <= now))
        throw new Error('Polar discount has expired. Check its end time.');
    if (match.max_redemptions !== null && match.redemptions_count >= match.max_redemptions)
        throw new Error('Polar discount has reached its redemption limit.');
    if (match.products.length && !match.products.some(product => product.id === productId))
        throw new Error(`Polar discount does not allow the ${cadence} product. Update its product restrictions or uncheck this plan.`);
    return match.id;
}
