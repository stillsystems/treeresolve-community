# Security Policy

Still Systems and the TreeResolve team take security and privacy seriously. TreeResolve is designed with an offline-first architecture, air-gapped cryptographic licensing, and a strict Content Security Policy to protect your source code. See [PRIVACY.md](../PRIVACY.md) for data-handling practices.

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
2. **Submit a Private Report**: Use GitHub's native confidential reporting tool:
   👉 **[Report a Vulnerability](https://github.com/stillsystems/treeresolve-community/security/advisories/new)**
3. **What to Include**:
   * A clear description of the vulnerability and its potential impact.
   * Steps or minimal reproduction files to demonstrate the behavior.
   * The version of TreeResolve and VS Code used during discovery.

---

## Response & Disclosure Process

* **Acknowledgment**: We aim to acknowledge receipt of vulnerability reports within **48 hours**.
* **Triage & Patching**: Validated issues are triaged immediately, and a patch is prepared off-channel.
* **Release & Advisory**: Once a fix is packaged and published to the VS Code Marketplace, a coordinated GitHub Security Advisory will be published crediting the reporter.
