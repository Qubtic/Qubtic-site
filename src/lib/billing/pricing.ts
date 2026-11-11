import type { Polar } from '@polar-sh/sdk/2026-10';
import { resolveDiscount, type DiscountCadence } from './discounts';

/** Live catalog amounts in integer minor units, not a tax-inclusive checkout total.
 * once = first invoice; forever = all invoices; repeating = calendar months, not cycles.
 * Checkout still determines tax, customer eligibility and the final charge.
 */
export type PlanQuote = {
    available: true;
    price_amount: number;
    discount_amount: number;
    amount_due: number;
    currency: string;
    discount_code?: string;
    discount_duration?: 'once' | 'forever' | 'repeating';
    discount_duration_in_months?: number;
};

export async function quotePlan(
    sdk: Pick<Polar, 'products' | 'discounts'>,
    row: { cadence: string; product_id: string; benefit_id?: string },
    discountConfig: unknown,
    organizationId: string,
): Promise<PlanQuote> {
    if (!row.product_id || !organizationId || !['monthly', 'yearly', 'lifetime'].includes(row.cadence))
        throw new Error('Configure a valid plan product, cadence and Polar organization first.');
    let product;
    try {
        product = await sdk.products.get(row.product_id);
    } catch {
        throw new Error('Unable to read the Polar product. Check the product, environment and products:read permission.');
    }
    if (product.id !== row.product_id || product.organization_id !== organizationId || product.is_archived !== false)
        throw new Error('Polar plan product is archived or belongs to a different organization or environment.');
    if (row.benefit_id !== undefined && !product.benefits.some(benefit => benefit.id === row.benefit_id))
        throw new Error('Polar plan product no longer grants the configured benefit.');
    const interval = row.cadence === 'monthly' ? 'month' : 'year';
    if (row.cadence === 'lifetime'
        ? product.is_recurring !== false || product.recurring_interval != null || product.recurring_interval_count != null
        : product.is_recurring !== true || product.recurring_interval !== interval || product.recurring_interval_count !== 1)
        throw new Error('Polar product recurring interval does not match the configured plan cadence.');
    if (product.trial_interval != null || product.trial_interval_count != null)
        throw new Error('Polar trial products cannot be quoted as an immediate plan charge.');
    const prices = product.prices.filter(price => price.is_archived === false);
    if (prices.length !== 1 || prices[0].amount_type !== 'fixed')
        throw new Error('Polar plan needs exactly one active fixed price in one currency; variable, metered, seat-based and multi-currency prices cannot be quoted.');
    const price = prices[0];
    if (price.product_id !== row.product_id || price.source !== 'catalog' ||
        ('recurring_interval' in price && (row.cadence === 'lifetime' || price.recurring_interval !== interval)))
        throw new Error('Polar price does not match the catalog product or plan cadence.');
    if (!Number.isSafeInteger(price.price_amount) || price.price_amount <= 0 || !/^[a-z]{3}$/.test(price.price_currency))
        throw new Error('Polar plan needs a positive integer minor-unit price and a valid currency.');
    const quote: PlanQuote = {
        available: true,
        price_amount: price.price_amount,
        discount_amount: 0,
        amount_due: price.price_amount,
        currency: price.price_currency,
    };
    const discount = await resolveDiscount(sdk, discountConfig, row.cadence as DiscountCadence, row.product_id, organizationId);
    if (!discount) return quote;
    if (!['once', 'forever', 'repeating'].includes(discount.duration))
        throw new Error('Polar discount has an unsupported duration. Check the saved discount.');
    if (discount.duration === 'repeating') {
        if (!('duration_in_months' in discount) || !Number.isSafeInteger(discount.duration_in_months) || discount.duration_in_months <= 0)
            throw new Error('Polar repeating discount needs a positive integer duration in months.');
        quote.discount_duration_in_months = discount.duration_in_months;
    }
    let amount: number;
    if (discount.type === 'percentage' && 'basis_points' in discount) {
        if (!Number.isSafeInteger(discount.basis_points) || discount.basis_points <= 0 || discount.basis_points > 10_000)
            throw new Error('Polar percentage discount needs valid basis_points between 1 and 10000.');
        // Polar get_discount_amount uses polar_round: nearest minor unit, half away from zero.
        // https://github.com/polarsource/polar/blob/main/server/polar/kit/math.py
        amount = Number((BigInt(price.price_amount) * BigInt(discount.basis_points) + 5_000n) / 10_000n);
    } else if (discount.type === 'fixed' && 'amount' in discount) {
        const mapped = discount.amounts?.[quote.currency];
        if (mapped !== undefined) amount = mapped;
        else {
            if (discount.currency !== quote.currency)
                throw new Error('Polar fixed discount does not support the plan currency. Update its currency amounts.');
            amount = discount.amount;
        }
        if (!Number.isSafeInteger(amount) || amount <= 0)
            throw new Error('Polar fixed discount needs a positive integer minor-unit amount for the plan currency.');
    } else {
        throw new Error('Polar discount type cannot be quoted safely. Check the saved discount.');
    }
    quote.discount_amount = Math.min(amount, quote.price_amount);
    quote.amount_due = quote.price_amount - quote.discount_amount;
    quote.discount_code = discount.code!;
    quote.discount_duration = discount.duration;
    return quote;
}
