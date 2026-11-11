import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function load(name, deps = {}) {
    const exports = {};
    const code = ts.transpileModule(readFileSync(new URL(`../src/lib/billing/${name}.ts`, import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    new Function('require', 'exports', code)(name => {
        assert.ok(name in deps, `Unexpected runtime dependency: ${name}`);
        return deps[name];
    }, exports);
    return exports;
}
const discounts = load('discounts');
const { quotePlan } = load('pricing', { './discounts': discounts });
const row = { cadence: 'monthly', product_id: 'product', benefit_id: 'benefit' };
const config = { code: 'SAVE', cadences: ['monthly', 'yearly', 'lifetime'] };
const product = () => ({
    id: 'product', organization_id: 'org', is_archived: false,
    is_recurring: true, recurring_interval: 'month', recurring_interval_count: 1,
    trial_interval: null, trial_interval_count: null,
    benefits: [{ id: 'benefit' }],
    prices: [{ product_id: 'product', source: 'catalog', is_archived: false, amount_type: 'fixed', price_amount: 999, price_currency: 'usd', tax_behavior: null }],
});
const coupon = () => ({
    id: 'discount', code: 'SAVE', organization_id: 'org', starts_at: null, ends_at: null,
    max_redemptions: null, redemptions_count: 0, products: [],
    type: 'percentage', basis_points: 2500, duration: 'once',
});
function setup(p = product(), d = coupon()) {
    const calls = [];
    return {
        calls,
        sdk: {
            products: { get: async id => { calls.push(['get', id]); return p; } },
            discounts: { list: async query => {
                calls.push(['list', query]);
                return { items: d ? [d] : [], pagination: { max_page: 1 } };
            } },
        },
    };
}
const quote = (sdk, discount = config, plan = row) => quotePlan(sdk, plan, discount, 'org');

test('percentage quote uses live minor-unit prices and preserves checkout ID compatibility', async () => {
    const { sdk, calls } = setup();
    assert.deepEqual(await quote(sdk), {
        available: true, price_amount: 999, discount_amount: 250, amount_due: 749,
        currency: 'usd', discount_code: 'SAVE', discount_duration: 'once',
    });
    assert.equal((await discounts.resolveDiscount(sdk, config, 'monthly', 'product', 'org')).id, 'discount');
    assert.equal(await discounts.resolveCheckoutDiscount(sdk, config, 'monthly', 'product', 'org'), 'discount');
    assert.equal(calls[0][0], 'get');
});

test('no code and unselected plans do not read discounts; client prices are ignored', async () => {
    for (const discount of [undefined, { code: '', cadences: [] }, { code: 'SAVE', cadences: ['yearly'] }]) {
        const { sdk, calls } = setup();
        assert.deepEqual(await quote(sdk, discount, { ...row, price_amount: 1, currency: 'eur' }), {
            available: true, price_amount: 999, discount_amount: 0, amount_due: 999, currency: 'usd',
        });
        assert.deepEqual(calls, [['get', 'product']]);
        assert.equal(await discounts.resolveCheckoutDiscount(sdk, discount, 'monthly', 'product', 'org'), undefined);
    }
});

test('integer rounding is half away from zero including JPY and safe-integer boundaries', async () => {
    for (const [base, points, expected] of [
        [1, 4999, 0], [1, 5000, 1], [1, 5001, 1], [3, 5000, 2],
        [999, 2550, 255], [100, 10000, 100], [Number.MAX_SAFE_INTEGER, 9999, 9006298534815517],
    ]) {
        const p = product();
        Object.assign(p.prices[0], { price_amount: base, price_currency: 'jpy' });
        const result = await quote(setup(p, { ...coupon(), basis_points: points }).sdk);
        assert.equal(result.discount_amount, expected);
        assert.equal(result.amount_due, base - expected);
        assert.equal(result.currency, 'jpy');
        for (const amount of [result.price_amount, result.discount_amount, result.amount_due]) assert.ok(Number.isSafeInteger(amount));
    }
});

test('fixed discounts prefer currency map, support matching legacy amount and cap at base', async () => {
    for (const [patch, expected] of [
        [{ amounts: { usd: 123 }, amount: 50, currency: 'eur' }, 123],
        [{ amount: 50, currency: 'usd' }, 50],
        [{ amounts: { eur: 10 }, amount: 70, currency: 'usd' }, 70],
        [{ amounts: { usd: 5000 } }, 999],
    ]) {
        const result = await quote(setup(product(), { ...coupon(), type: 'fixed', ...patch }).sdk);
        assert.equal(result.discount_amount, expected);
        assert.equal(result.amount_due, 999 - expected);
    }
});

test('discount duration describes first invoice, all invoices or calendar months for every cadence', async () => {
    for (const cadence of ['monthly', 'yearly', 'lifetime']) {
        for (const duration of ['once', 'forever', 'repeating']) {
            const p = product();
            Object.assign(p, cadence === 'lifetime'
                ? { is_recurring: false, recurring_interval: null, recurring_interval_count: null }
                : { recurring_interval: cadence === 'monthly' ? 'month' : 'year' });
            const result = await quote(setup(p, { ...coupon(), duration, duration_in_months: 24 }).sdk, config, { ...row, cadence });
            assert.equal(result.discount_duration, duration);
            assert.equal(result.discount_duration_in_months, duration === 'repeating' ? 24 : undefined);
        }
    }
});

test('tax uncertainty never invents tax or claims a checkout total', async () => {
    for (const tax_behavior of [null, 'inclusive', 'exclusive']) {
        const p = product();
        p.prices[0].tax_behavior = tax_behavior;
        const result = await quote(setup(p).sdk);
        assert.equal(result.amount_due, 749);
        assert.equal('tax_amount' in result, false);
        assert.equal('total_amount' in result, false);
    }
});

test('invalid, expired, restricted and malformed coupons fail closed', async () => {
    for (const patch of [
        { ends_at: '2000-01-01T00:00:00Z' }, { starts_at: '2999-01-01T00:00:00Z' },
        { ends_at: 'invalid' }, { organization_id: 'other' }, { products: [{ id: 'other' }] },
        { max_redemptions: 1, redemptions_count: 1 }, { basis_points: undefined, rate: 0.25 },
        { basis_points: 0 }, { basis_points: 10001 }, { basis_points: 0.5 },
        { duration: 'unknown' }, { duration: 'repeating', duration_in_months: 0 },
        { duration: 'repeating', duration_in_months: 1.5 }, { duration: 'repeating' },
        { type: 'fixed', currency: 'eur', amount: 100 },
        { type: 'fixed', amounts: { usd: 1.5 } }, { type: 'fixed', amounts: { usd: 0 } },
        { type: 'fixed', amounts: { usd: -1 } }, { type: 'fixed', amounts: { usd: Number.MAX_SAFE_INTEGER + 1 } },
    ]) await assert.rejects(() => quote(setup(product(), { ...coupon(), ...patch }).sdk));
    await assert.rejects(() => quote(setup(product(), null).sdk), /exactly one/);
    await assert.rejects(() => quote(setup().sdk, { code: 'SAVE', cadences: [] }), /select/);
});

test('stale or ambiguous live catalog fails rather than selecting an arbitrary price', async () => {
    const mutations = [
        p => { p.id = 'other'; }, p => { p.organization_id = 'other'; }, p => { p.is_archived = true; },
        p => { p.benefits = []; }, p => { p.recurring_interval = 'year'; },
        p => { p.recurring_interval_count = 2; }, p => { p.is_recurring = false; },
        p => { p.trial_interval = 'day'; }, p => { p.prices = []; },
        p => { p.prices[0].is_archived = true; }, p => { p.prices[0].product_id = 'other'; },
        p => { p.prices[0].source = 'ad_hoc'; }, p => { p.prices[0].recurring_interval = 'year'; },
        ...['custom', 'seat_based', 'unit_based', 'metered_unit', 'metered_tiers'].map(type => p => { p.prices.push({ ...p.prices[0], amount_type: type }); }),
        p => { p.prices.push({ ...p.prices[0], price_currency: 'eur' }); },
        p => { p.prices.push({ ...p.prices[0] }); },
        ...[0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1].map(amount => p => { p.prices[0].price_amount = amount; }),
    ];
    for (const mutate of mutations) {
        const p = product(); mutate(p);
        await assert.rejects(() => quote(setup(p).sdk));
    }
    const p = product();
    p.prices.push({ ...p.prices[0], is_archived: true, price_currency: 'eur' });
    assert.equal((await quote(setup(p).sdk)).currency, 'usd');
    const live = product();
    const { sdk } = setup(live);
    assert.equal((await quote(sdk)).price_amount, 999);
    live.prices[0].price_amount = 2000;
    assert.equal((await quote(sdk)).price_amount, 2000);
    live.is_archived = true;
    await assert.rejects(() => quote(sdk), /archived/);
});

test('provider errors are actionable without leaking provider details', async () => {
    for (const [service, method, permission] of [['products', 'get', 'products:read'], ['discounts', 'list', 'discounts:read']]) {
        const { sdk } = setup();
        sdk[service][method] = async () => { throw Error('private provider response'); };
        await assert.rejects(() => quote(sdk), error => error.message.includes(permission) && !error.message.includes('private'));
    }
});
