/* ==========================================================================
   TreeResolve — Interactive Simulator, Analytics & Enterprise Form Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const docsConfig = window.__TREERESOLVE_DOCS__ || {};

  // 0. Privacy-respecting analytics (optional — tokens from docs/config.js)
  const analyticsCfg = docsConfig.analytics || {};
  initAnalytics(analyticsCfg);
  const track = createTracker(analyticsCfg);

  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const name = el.getAttribute('data-track');
      if (!name) return;
      const props = {};
      const placement = el.getAttribute('data-track-placement');
      const plan = el.getAttribute('data-track-plan');
      if (placement) props.placement = placement;
      if (plan) props.plan = plan;
      track(name, props);
    });
  });

  initMobileNav();

  // 1. Interactive Conflict Simulator Data
  const scenarios = {
    typescript: {
      name: 'TypeScript Imports',
      conflicted: `// src/controllers/OrderController.ts
<<<<<<< HEAD (Ours)
import { User, formatUser } from '../models/user';
import { Logger } from '../utils/logger';
||||||| Base
import { User } from '../models/user';
=======
import { User, validateRole } from '../models/user';
import { MetricsCollector } from '../utils/metrics';
>>>>>>> feature/checkout (Theirs)

export class OrderController {
  // ...
}`,
      resolved: `// src/controllers/OrderController.ts
// ✅ Deterministic AST Import Reconciliation
import { User, formatUser, validateRole } from '../models/user';
import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';

export class OrderController {
  // ...
}`,
      explanation: 'Disjoint named specifiers (`formatUser`, `validateRole`) unified without collision; independent modules preserved without duplicate `User` imports.'
    },
    python: {
      name: 'Python Scope & Imports',
      conflicted: `// app/services/report.py
<<<<<<< HEAD (Ours)
from datetime import datetime, timezone
import pandas as pd
||||||| Base
from datetime import datetime
=======
from datetime import datetime, timedelta
import numpy as np
>>>>>>> incoming (Theirs)

def generate_summary():
    pass`,
      resolved: `// app/services/report.py
// ✅ Deterministic 3-Way AST Import Reconciliation
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd

def generate_summary():
    pass`,
      explanation: 'Both branches add disjoint members to `datetime` while preserving deletions and module-level imports cleanly.'
    },
    json: {
      name: 'JSON Deep Keys',
      conflicted: `// config/settings.json
{
<<<<<<< HEAD (Ours)
  "theme": "dark",
  "fontSize": 14
||||||| Base
  "theme": "dark"
=======
  "theme": "dark",
  "tabSize": 2,
  "minimap": false
>>>>>>> incoming (Theirs)
}`,
      resolved: `// config/settings.json
// ✅ Recursive Non-Colliding Key Union
{
  "theme": "dark",
  "fontSize": 14,
  "tabSize": 2,
  "minimap": false
}`,
      explanation: 'Non-colliding sibling keys (`fontSize` vs `tabSize`, `minimap`) merged recursively into a single valid JSON object.'
    },
    go: {
      name: 'Go Import Blocks',
      conflicted: `// server/main.go
<<<<<<< HEAD (Ours)
import (
    "fmt"
    "net/http"
    "github.com/google/uuid"
)
||||||| Base
import (
    "fmt"
)
=======
import (
    "fmt"
    "time"
    "github.com/gin-gonic/gin"
)
>>>>>>> incoming (Theirs)`,
      resolved: `// server/main.go
// ✅ Standard Library & Third-Party Grouped Auto-Union
import (
    "fmt"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)`,
      explanation: 'Grouped Go imports unified with standard library and third-party separation, formatted to Go conventions.'
    }
  };

  let currentScenario = 'typescript';
  let isResolved = false;

  const codeDisplayOurs = document.getElementById('code-display-left');
  const codeDisplayResult = document.getElementById('code-display-right');
  const toggleBtn = document.getElementById('sim-toggle-action');
  const simExplanation = document.getElementById('sim-explanation');
  const tabs = document.querySelectorAll('.sim-tab');

  function updateSimulatorView() {
    const sc = scenarios[currentScenario];
    if (isResolved) {
      codeDisplayOurs.textContent = sc.conflicted;
      codeDisplayResult.textContent = sc.resolved;
      toggleBtn.innerHTML = '<span>⚡ Show Raw Conflicts</span>';
      simExplanation.textContent = sc.explanation;
    } else {
      codeDisplayOurs.textContent = sc.conflicted;
      codeDisplayResult.textContent = '// Click "Run Auto-Resolve" above to view deterministic result...\n\n' + sc.conflicted.split('\n').slice(0, 8).join('\n') + '\n// ...';
      toggleBtn.innerHTML = '<span>⚡ Run Auto-Resolve</span>';
      simExplanation.textContent = 'Standard Git triggers conflict markers on disjoint edits. TreeResolve parses the AST to resolve them instantly.';
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentScenario = tab.dataset.lang;
      isResolved = false;
      updateSimulatorView();
      track('simulator_tab', { lang: currentScenario });
    });
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isResolved = !isResolved;
      updateSimulatorView();
      track(isResolved ? 'simulator_resolve' : 'simulator_reset', { lang: currentScenario });
    });
  }

  // Initialize
  updateSimulatorView();

  // 2. Enterprise Contact Form Submission
  const inquiryForm = document.getElementById('enterprise-inquiry-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-inquiry-btn');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      formStatus.className = 'form-status';
      formStatus.style.display = 'none';

      const formData = new FormData(inquiryForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('https://treeresolve-licensing.still-systems.workers.dev/api/v1/inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          formStatus.className = 'form-status success';
          formStatus.innerHTML = '✅ <strong>Inquiry received!</strong> Thank you for reaching out. We will review your project requirements and follow up promptly.';
          inquiryForm.reset();
          track('inquiry_submit', { seats: data.seats || '', environment: data.security || '' });
        } else {
          throw new Error('Submission returned status ' + response.status);
        }
      } catch {
        formStatus.className = 'form-status error';
        formStatus.innerHTML = `⚠️ Submission temporarily unavailable. Please submit an inquiry on the <a href="https://github.com/stillsystems/treeresolve-community/discussions" target="_blank" rel="noopener" style="color: #60a5fa; text-decoration: underline;">TreeResolve Community Portal</a>.`;
        track('inquiry_error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enterprise Inquiry';
      }
    });
  }

  // 3. Paddle.js Checkout Integration (token injected via docs/config.js — never commit secrets)
  const paddleCfg = docsConfig.paddle || {};
  const paddleToken = paddleCfg.clientToken;
  const paddleEnvironment = paddleCfg.environment || 'sandbox';
  const prices = paddleCfg.prices || {};

  if (window.Paddle && paddleToken) {
    if (paddleEnvironment === 'sandbox') {
      Paddle.Environment.set('sandbox');
    }
    Paddle.Initialize({
      token: paddleToken,
      eventCallback: (data) => {
        const name = data && data.name;
        if (name === 'checkout.loaded') {
          track('checkout_loaded', { event: name });
        } else if (name === 'checkout.completed') {
          track('checkout_complete', { event: name });
        } else if (name === 'checkout.closed') {
          track('checkout_closed', { event: name });
        }
      }
    });
  } else if (!paddleToken) {
    console.warn('Paddle client token not configured. Copy docs/config.example.js to docs/config.js for local preview.');
  }

  function openCheckout(priceId) {
    if (!paddleToken) {
      console.warn('Checkout unavailable: Paddle client token not configured');
      return;
    }
    if (window.Paddle) {
      track('checkout_open', { priceId: priceId });
      Paddle.Checkout.open({
        items: [{ priceId: priceId, quantity: 1 }]
      });
    } else {
      console.warn('Paddle.js not loaded');
    }
  }

  document.querySelectorAll('[data-paddle-price]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const priceId = el.getAttribute('data-paddle-price');
      if (priceId) {
        openCheckout(priceId);
      }
    });
  });

  // Auto-open checkout if query parameter ?price= or ?checkout= is present
  const urlParams = new URLSearchParams(window.location.search);
  const directPrice = urlParams.get('price');
  const directCheckout = urlParams.get('checkout');
  if (directPrice) {
    setTimeout(() => openCheckout(directPrice), 500);
  } else if (directCheckout === 'pro' || directCheckout === 'yearly') {
    setTimeout(() => openCheckout(prices.proAnnual || 'pri_01m2zxfdbpg00xay389wj2pt1b'), 500);
  } else if (directCheckout === 'monthly') {
    setTimeout(() => openCheckout(prices.proMonthly || 'pri_01m2zxb0htcnexpf56mj140y4n'), 500);
  } else if (directCheckout === 'enterprise') {
    setTimeout(() => openCheckout(prices.enterprise || 'pri_01m2zxykkb4yp3qdz3bftd9wxq'), 500);
  }
});

function initMobileNav() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('nav-panel');
  if (!navbar || !toggle || !panel) return;

  function setOpen(open) {
    navbar.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', () => {
    setOpen(!navbar.classList.contains('nav-open'));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setOpen(false);
  });
}

/**
 * Load optional Cloudflare Web Analytics (pageviews) and Plausible (custom events).
 * Both are privacy-oriented and only activate when configured in docs/config.js.
 */
function initAnalytics(analyticsCfg) {
  const cfToken = analyticsCfg.cloudflareToken;
  if (cfToken) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: cfToken }));
    document.head.appendChild(script);
  }

  const plausibleDomain = analyticsCfg.plausibleDomain;
  if (plausibleDomain) {
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', plausibleDomain);
    script.src = 'https://plausible.io/js/script.tagged-events.js';
    document.head.appendChild(script);
  }
}

function createTracker(analyticsCfg) {
  const enabled = Boolean(analyticsCfg.plausibleDomain);
  return function track(eventName, props) {
    if (!eventName) return;
    try {
      if (enabled && typeof window.plausible === 'function') {
        if (props && Object.keys(props).length > 0) {
          window.plausible(eventName, { props: props });
        } else {
          window.plausible(eventName);
        }
      }
    } catch {
      // Analytics must never break checkout or forms
    }
  };
}
