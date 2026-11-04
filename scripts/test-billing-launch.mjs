import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/billing-launch.js', import.meta.url), 'utf8');
function harness({ code = 202, url = 'https://sandbox.polar.sh/checkout/test', hung = false, hash = '#44d7729b-f5ae-455b-be9d-e09ee5aeec65', search = '?environment=sandbox' } = {}) {
  const elements = new Map();
  const timers = new Map();
  const listeners = new Map();
  const navigations = [];
  const signals = [];
  let now = 0, next = 0, calls = 0;
  const opener = { postMessage() {} };
  const window = { opener, location: { hash, search, replace: url => navigations.push(url) }, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const element = id => {
    if (!elements.has(id)) elements.set(id, { hidden: id !== 'launch-spinner', textContent: '' });
    return elements.get(id);
  };
  runInNewContext(source, { window, document: { getElementById: element }, URL, URLSearchParams, AbortController,
    Date: { now: () => now },
    setTimeout: (fn, delay) => { timers.set(++next, { fn, at: now + delay }); return next; },
    clearTimeout: id => timers.delete(id),
    fetch: async (_url, options) => { calls++; signals.push(options.signal); return hung ? new Promise(() => {}) : { status: code, json: async () => ({ url }) }; },
  });
  const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  return { element, timers, listeners, navigations, signals, opener, window, calls: () => calls, flush,
    async advance(ms) {
      const end = now + ms;
      await flush();
      while (true) {
        const item = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!item) break;
        now = item[1].at; timers.delete(item[0]); item[1].fn(); await flush();
      }
      now = end; await flush();
    },
  };
}
test('ready checkout redirects immediately and keeps progress visible while Polar responds', async () => {
  const h = harness({ code: 200 }); await h.flush();
  assert.deepEqual(h.navigations, ['https://sandbox.polar.sh/checkout/test']);
  assert.equal(h.element('launch-spinner').hidden, false);
  assert.equal(h.signals[0].aborted, true);
  await h.advance(8000);
  assert.match(h.element('launch-status').textContent, /opening automatically/);
  assert.equal(h.calls(), 1);
  assert.equal(h.navigations.length, 1);
  h.listeners.get('pagehide')();
  assert.equal(h.timers.size, 0);
});
test('missing checkout allows creation race then stops with recovery', async () => {
  const h = harness({ code: 404 }); await h.advance(26000);
  assert.match(h.element('launch-status').textContent, /No checkout/);
  assert.equal(h.element('launch-recovery').hidden, false);
  const calls = h.calls(); await h.advance(60000); assert.equal(h.calls(), calls);
});
test('hung lookup is aborted and overall deadline stops the spinner', async () => {
  const h = harness({ hung: true }); await h.advance(35000);
  assert.equal(h.signals[0].aborted, true);
  assert.equal(h.element('launch-spinner').hidden, true);
  assert.match(h.element('launch-status').textContent, /in time/);
});
test('expired checkout stops immediately; invalid links make no requests', async () => {
  const h = harness({ code: 410 }); await h.flush();
  assert.match(h.element('launch-status').textContent, /expired/);
  assert.equal(h.timers.size, 0);
  assert.equal(harness({ hash: '#invalid' }).calls(), 0);
});
test('rejects unsafe redirects and messages from unrelated windows', async () => {
  const h = harness();
  const receive = h.listeners.get('message');
  const data = { channel: h.window.location.hash.slice(1), type: 'qubtic-billing-checkout', url: 'https://sandbox.buy.polar.sh/test' };
  receive({ source: {}, data }); assert.equal(h.navigations.length, 0);
  receive({ source: h.opener, data: { ...data, url: 'https://buy.polar.sh.evil.test/' } }); assert.equal(h.navigations.length, 0);
  receive({ source: h.opener, data }); assert.equal(h.navigations.length, 1);
  const bad = harness({ code: 200, url: 'https://buy.polar.sh@evil.test/' }); await bad.flush();
  assert.equal(bad.navigations.length, 0);
  assert.match(bad.element('launch-status').textContent, /invalid destination/);
});
