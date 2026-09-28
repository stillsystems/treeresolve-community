/**
 * Local / deploy-time docs checkout config.
 *
 * Setup (local preview):
 *   copy docs/config.example.js docs/config.js
 *   set paddle.clientToken to your Paddle *client* token (Dashboard → Developer Tools)
 *   optionally set analytics.cloudflareToken (Cloudflare Web Analytics → Manage site)
 *
 * docs/config.js is gitignored. Community sync injects it from GitHub Actions secrets:
 *   PADDLE_CLIENT_TOKEN, PADDLE_ENVIRONMENT (sandbox|production)
 *   PADDLE_PRICE_PRO_ANNUAL / PADDLE_PRICE_PRO_MONTHLY / PADDLE_PRICE_ENTERPRISE (optional overrides)
 *   CF_WEB_ANALYTICS_TOKEN (optional)
 *
 * Sandbox tokens start with test_; live tokens start with live_.
 * Keep PADDLE_ENVIRONMENT=sandbox on public Pages until domain approval + go-live.
 *
 * Do not commit real client tokens. Rotate any token that was previously committed.
 */
window.__TREERESOLVE_DOCS__ = {
  paddle: {
    environment: 'sandbox',
    clientToken: 'REPLACE_WITH_PADDLE_CLIENT_TOKEN',
    // Optional Retain: Paddle customer id only (ctm_...), set when the buyer is known.
    // pwCustomerId: 'ctm_...',
    prices: {
      // Defaults below are sandbox. Live cutover overrides via Actions PADDLE_PRICE_* secrets.
      proAnnual: 'pri_01m2zxfdbpg00xay389wj2pt1b',
      proMonthly: 'pri_01m2zxb0htcnexpf56mj140y4n',
      enterprise: 'pri_01m2zxykkb4yp3qdz3bftd9wxq'
    }
  },
  // After DNS cutover: set to 'https://licensing.stillsystems.com'
  // (leave unset to keep workers.dev for enterprise inquiry POSTs).
  licensingEndpoint: '',
  analytics: {
    // Cookie-free pageviews (GitHub Pages is not CF-proxied — manual beacon required)
    cloudflareToken: ''
  }
};
