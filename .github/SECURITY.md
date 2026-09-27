# Security Policy

Still Systems and the TreeResolve team take security and privacy seriously. TreeResolve is designed with an offline-first architecture, air-gapped cryptographic licensing, and a strict Content Security Policy to protect your source code. See [PRIVACY.md](../PRIVACY.md) for data-handling practices and the [Trust Pack](../docs/trust/README.md) for enterprise vendor-risk materials (data-flow, SBOM, Sigstore, CAIQ lite).

This document is the **Vulnerability Disclosure Policy (VDP)**. Machine-readable contact info: [security.txt](../docs/security.txt) (also served at `/.well-known/security.txt` on the docs site).

---

## Supported Versions

Only the latest active minor release receives security patches:

| Version | Supported          |
| :---    | :---:              |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability, subresource integrity issue, or token validation bug in TreeResolve:

1. **Do NOT disclose publicly**: Please do not open a public GitHub issue or discuss potential vulnerabilities in public forum threads.
2. **Submit a Private Report** (preferred): Use GitHub's confidential advisory form on the public tracker:
   **[Report a Vulnerability](https://github.com/stillsystems/treeresolve-community/security/advisories/new)**
3. **Email fallback**: [billy.kidd34@gmail.com](mailto:billy.kidd34@gmail.com) with subject `TreeResolve security`.
4. **What to Include**:
   * A clear description of the vulnerability and its potential impact.
   * Steps or minimal reproduction files to demonstrate the behavior (redact proprietary customer code).
   * The version of TreeResolve and VS Code used during discovery.

We do **not** operate a paid bug bounty. Good-faith reporters will be credited in the advisory unless they prefer to remain anonymous.

---

## Response & Disclosure Process

* **Acknowledgment**: We aim to acknowledge receipt of vulnerability reports within **48 hours** (solo maintainer; best effort).
* **Triage & Patching**: Validated issues are triaged off-channel; we may ask clarifying questions privately.
* **Release & Advisory**: Once a fix is packaged (and published to the VS Code Marketplace when that channel is live), a coordinated GitHub Security Advisory will be published, crediting the reporter when appropriate.
* **No retaliation**: We will not pursue legal action against reporters who make a good-faith, private disclosure and give us a reasonable window to fix before public discussion.
