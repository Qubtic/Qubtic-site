(() => {
  'use strict';
  const channel = window.location.hash.slice(1);
  const status = document.getElementById('launch-status');
  const spinner = document.getElementById('launch-spinner');
  const recovery = document.getElementById('launch-recovery');
  const hosts = new Set(['polar.sh', 'buy.polar.sh', 'sandbox.polar.sh', 'sandbox-api.polar.sh', 'api.polar.sh', 'sandbox.buy.polar.sh']);
  let stopped = false;
  let controller;
  let timer;
  let deadline;
  const opener = window.opener;
  const started = Date.now();

  function stop(hideSpinner = true) {
    stopped = true;
    clearTimeout(timer);
    clearTimeout(deadline);
    controller?.abort();
    window.removeEventListener('message', receive);
    if (hideSpinner) spinner.hidden = true;
  }
  function fail(message) {
    stop();
    status.textContent = message;
    recovery.hidden = false;
  }
  function navigateTo(targetUrl) {
    if (stopped) return false;
    try {
      const url = new URL(targetUrl);
      if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.username || url.password) return false;
      const link = document.getElementById('launch-link');
      link.href = url.href;
      document.getElementById('launch-link-container').hidden = false;
      // Stop resolving, but keep showing progress until the destination commits.
      // The browser keeps this document visible while Polar returns its response.
      stop(false);
      status.textContent = 'Connecting to Polar’s secure payment page…';
      timer = setTimeout(() => {
        status.textContent = 'Polar is taking longer to respond. Your checkout is opening automatically; please keep this tab open.';
      }, 8000);
      try { window.location.replace(url.href); } catch {
        stop();
        status.textContent = 'Your browser could not open checkout automatically. Select Open Polar checkout to continue.';
      }
      return true;
    } catch { return false; }
  }
  function receive(event) {
    if (!opener || event.source !== opener || event.data?.channel !== channel) return;
    if (event.data.type === 'qubtic-billing-checkout' && typeof event.data.url === 'string') navigateTo(event.data.url);
  }
  if (!/^[0-9a-f-]{36}$/i.test(channel)) {
    fail('This checkout link is invalid.');
    return;
  }
  window.addEventListener('message', receive);
  window.addEventListener('pagehide', stop, { once: true });
  // Notify opener if available; the channel and source bind the handoff to this tab.
  try { opener?.postMessage({ type: 'qubtic-billing-ready', channel }, '*'); } catch { /* Opener inaccessible */ }
  // Direct API polling fallback: resolves checkout even when cross-window communication is blocked.
  async function poll() {
    if (stopped) return;
    controller = new AbortController();
    const requestTimer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`/api/billing/resolve?channel=${encodeURIComponent(channel)}`, { cache: 'no-store', signal: controller.signal });
      if (stopped) return;
      if (res.status === 200) {
        const data = await res.json();
        if (stopped) return;
        if (!navigateTo(data.url)) fail('The checkout service returned an invalid destination.');
        return;
      }
      if (res.status === 410) { fail('This checkout has expired or is no longer available.'); return; }
      if (res.status === 429) { fail('Too many attempts. Please wait a minute before trying again.'); return; }
      // A tab opens before checkout creation starts. Allow that race, but never spin indefinitely.
      if (res.status === 404 && Date.now() - started >= 25000) { fail('No checkout was created for this link.'); return; }
      if (![202, 404].includes(res.status)) status.textContent = 'The checkout service is slow to respond. Retrying…';
    } catch {
      if (!stopped) status.textContent = 'Waiting for a connection to the checkout service…';
    } finally { clearTimeout(requestTimer); }
    if (!stopped) timer = setTimeout(poll, 1500);
  }
  deadline = setTimeout(() => fail('Checkout could not be opened in time. Please return to the plugin.'), 35000);
  void poll();
})();
