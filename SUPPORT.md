# TreeResolve Support

Thank you for using TreeResolve by Still Systems, LLC.

---

## Community (Free / Trial / Pro)

* **Bug reports & feature requests:** [GitHub Issues](https://github.com/stillsystems/treeresolve-community/issues)
* **Security vulnerabilities:** private disclosure via [SECURITY.md](.github/SECURITY.md) — do not file public issues for security bugs
* **Documentation:** [README.md](README.md), [ENTERPRISE.md](ENTERPRISE.md), [PRIVACY.md](PRIVACY.md)

Before opening an issue, include:

1. TreeResolve version (VS Code Extensions view or `npx treeresolve --version`)
2. VS Code version
3. OS
4. Steps to reproduce (sample conflict snippet if possible — redact proprietary code)

---

## Pro subscribers

Self-serve billing, invoices, and cancellations are handled through **Paddle** (Merchant of Record):

* VS Code: Command Palette → `TreeResolve: Open Billing Portal`
* CLI: `npx treeresolve portal [licenseKey]` (prints `GET /api/v1/portal?licenseKey=` URL)
* Product site checkout: [pricing](https://stillsystems.github.io/treeresolve-community/#pricing)

License activation:

* VS Code: Command Palette → `TreeResolve: Install Pro License Key`
* CLI / CI: `npx treeresolve license <token>` or `TREERESOLVE_LICENSE`

After a laptop migration or salt reset, reclaim your floating lease:

* VS Code: `TreeResolve: Reclaim Floating Lease (Machine Migration)`
* CLI: `npx treeresolve reclaim [licenseKey]`

---

## Enterprise

For volume quotes, MDM rollout, air-gapped keys, InfoSec questionnaires, and private support channels, use the [Enterprise Portal](https://stillsystems.github.io/treeresolve-community/#enterprise) or see [ENTERPRISE.md](ENTERPRISE.md).

---

## Response targets

| Channel | Typical acknowledgment |
| :--- | :--- |
| Security advisory | Within 48 hours |
| Community GitHub issues | Best effort |
| Enterprise inquiries | As agreed in your commercial terms |

Marketplace Q&A is monitored; for actionable bugs, prefer GitHub Issues so we can track repro steps and version details.
