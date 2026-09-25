# TreeResolve Privacy Policy

**Effective date:** 2026-09-24  
**Controller:** Still Systems, LLC (“Still Systems”, “we”, “us”)

This Privacy Policy describes how TreeResolve (the VS Code extension, standalone CLI, and related licensing services) handles information when you install or use the Software. It supplements the [Commercial End-User License Agreement](LICENSE).

---

## 1. Summary

* **Source code never leaves your machine.** Merge parsing, AST analysis, and conflict resolution run locally.
* **Optional anonymous product telemetry** may be sent when enabled.
* **Licensing / trial requests** may send an anonymized machine fingerprint to our licensing gateway.
* **Payments** are processed by our Merchant of Record (Paddle); we do not store full payment card numbers.
* **Marketing site analytics** (optional) may measure aggregate pageviews and conversion events on the public documentation site only — never inside the extension or CLI.

---

## 2. Information We Process

### 2.1. Not collected

We do **not** collect or transmit:

* Source code, ASTs, conflict hunks, or file contents
* Repository URLs, branch names, commit hashes, or file paths
* VS Code account identity, emails, or usernames (except where you voluntarily submit them via support or checkout)

### 2.2. Licensing and reverse-trial fingerprint

To issue 14-day reverse trials and renew floating leases without requiring an account, TreeResolve may send an anonymized SHA-256 fingerprint derived from `platform:arch:machineId` (VS Code machine ID, or a persistent anonymous UUID in the CLI), truncated to 32 hex characters, plus a salted domain identifier for seat binding.

This request goes only to the configured licensing endpoint (default: `https://treeresolve-licensing.still-systems.workers.dev`, or your enterprise gateway). Offline wildcard / air-gapped licenses do not contact the network for validation.

### 2.3. Anonymous product telemetry (optional)

When `treeresolve.enableTelemetry` is `true` **and** VS Code’s global telemetry is not disabled (`telemetry.telemetryLevel` / `vscode.env.isTelemetryEnabled`), TreeResolve may send aggregate events such as:

* Auto-merge acceptance rate and session duration
* Coarse language ID
* Structured error codes (never raw error text, paths, or snippets)

Telemetry is posted to the same licensing gateway under `/api/v1/telemetry`.

**Opt out:**

```json
"treeresolve.enableTelemetry": false
```

Or disable VS Code telemetry globally. Either setting stops telemetry transmission.

### 2.4. Checkout and billing

Pro and Enterprise purchases are processed by **Paddle** as Merchant of Record. Paddle may collect name, email, billing address, and payment details under [Paddle’s privacy policy](https://www.paddle.com/legal/privacy). Still Systems receives license entitlement metadata (e.g. email for license delivery, subscription status) as needed to issue and revoke licenses.

### 2.5. Support and enterprise inquiries

If you contact us (GitHub issues, enterprise inquiry forms, email), we process the information you voluntarily provide to respond.

### 2.6. Public documentation site analytics (optional)

The marketing / documentation site at [stillsystems.github.io/treeresolve-community](https://stillsystems.github.io/treeresolve-community/) may load privacy-oriented web analytics when configured by Still Systems:

* **Cloudflare Web Analytics** — cookie-free aggregate pageviews and performance (no advertising profile)
* **Plausible Analytics** (optional) — cookie-free custom events such as install clicks, checkout opens, and enterprise inquiry submissions

These scripts run only on the public site. They are **not** bundled into the VS Code extension or CLI, and they do not receive source code or repository contents. If analytics tokens are unset, no third-party analytics scripts are loaded.

---

## 3. Purpose and legal bases

We process the data above to:

* Provide trials, floating leases, and paid entitlements
* Prevent trial abuse and enforce seat limits
* Improve product reliability (optional telemetry)
* Fulfill purchases and customer support
* Meet legal and tax obligations via our payment processor

Where GDPR or similar laws apply, bases include contract performance, legitimate interests (abuse prevention, product improvement), and consent or contractual necessity for billing.

---

## 4. Retention

* Trial fingerprints and lease records: retained only as long as needed for abuse prevention and active entitlements (typically aligned with trial/subscription lifetime plus a short operational buffer).
* Telemetry: aggregate operational metrics; not used to identify individuals.
* Billing records: retained by Paddle / Still Systems as required for accounting and tax.

---

## 5. Processors and subprocessors

| Role | Provider | Purpose |
| :--- | :--- | :--- |
| Licensing / telemetry gateway | Still Systems (Cloudflare Workers / edge hosting) | Trials, leases, telemetry ingestion |
| Payments | Paddle | Checkout, tax, subscription billing |
| Issue tracking (optional) | GitHub | Public community support |
| Documentation site analytics (optional) | Cloudflare Web Analytics / Plausible | Aggregate pageviews and conversion events on the public docs site only |

---

## 6. International transfers

Licensing and payment infrastructure may process data in the United States and other regions where our providers operate. Where required, appropriate transfer safeguards are applied by those providers.

---

## 7. Your choices

* Disable telemetry as described in §2.3
* Use offline enterprise license keys to avoid licensing network calls
* Configure `treeresolve.licensingEndpoint` (machine scope) for an approved internal gateway
* Request access, correction, or deletion of personal data you provided via support or checkout by contacting us (see §9)

---

## 8. Children

TreeResolve is not directed to children under 16. We do not knowingly collect personal information from children.

---

## 9. Contact

* **Security:** see [SECURITY.md](.github/SECURITY.md)
* **Support:** see [SUPPORT.md](SUPPORT.md)
* **Publisher / product site:** [https://stillsystems.github.io/treeresolve-community/](https://stillsystems.github.io/treeresolve-community/)
* **Community issues:** [https://github.com/stillsystems/treeresolve-community/issues](https://github.com/stillsystems/treeresolve-community/issues)

For privacy requests, open a private security advisory or enterprise inquiry and mark the subject “Privacy Request”.

---

## 10. Changes

We may update this policy when product behavior or processors change. Material changes will be reflected in this file and noted in [CHANGELOG.md](CHANGELOG.md). Continued use after an update constitutes acceptance of the revised policy where permitted by law.
