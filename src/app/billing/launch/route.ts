// A checkout handoff must not wait for the marketing site's hydration or animations.
export function GET() {
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Opening secure checkout | Qubtic</title><meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="/billing-launch.css?v=3"><script src="/billing-launch.js?v=3" defer></script></head>
<body><main class="billing-launch"><section class="billing-launch__content" aria-labelledby="billing-launch-title">
<span id="launch-spinner" class="billing-launch__spinner" aria-hidden="true"></span>
<h1 id="billing-launch-title">Opening Polar checkout</h1>
<p id="launch-status" role="status" aria-live="polite">Preparing your secure checkout…</p>
<p id="launch-link-container" hidden><a id="launch-link" class="billing-launch__link">Open Polar checkout</a></p>
<p id="launch-recovery" class="billing-launch__recovery" hidden>Return to the plugin and select Purchase Pro again. If a checkout link is already available there, select Open Polar checkout.</p>
<noscript><p>Enable JavaScript or open the checkout link from the plugin.</p></noscript>
</section></main></body></html>`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    },
  });
}
