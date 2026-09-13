# TreeResolve Enterprise Deployment & Security Guide

This document provides technical, architectural, and security details for enterprise engineering organizations, InfoSec assessment teams, and IT administrators evaluating or deploying TreeResolve.

---

## 1. Executive Summary

TreeResolve is an **offline-first, deterministic 3-way merge conflict resolution engine** for VS Code and Git workflows. Unlike generative AI coding assistants, TreeResolve uses mathematical syntax-tree reconciliation to eliminate merge conflicts without code hallucination or data egress.

### Core Value Proposition for Enterprises

* **Zero Data Egress**: 100% of parsing, AST analysis, micro-diffing, and resolution executes locally on developer workstations or internal CI runners.
* **Deterministic Guarantees**: Merges are provably correct. Only disjoint, non-colliding syntax elements are auto-resolved; logical collisions are presented clearly to the developer.
* **Air-Gapped & Offline Ready**: Complies with air-gapped security policies in defense, financial services, healthcare, and critical infrastructure.
* **Seamless Fleet Rollout**: Deployable silently via Microsoft Intune, Jamf Pro, Munki, or Ansible, with repository-level governance via `.treeresolverc`.

---

## 2. Security & Compliance Architecture

### 2.1. Zero Data Egress Guarantee

| Data Category | Transmitted Over Network? | Destination |
| :--- | :---: | :--- |
| **Source Code** | **NO** | Never leaves local workstation memory. |
| **Concrete Syntax Trees (CST / AST)** | **NO** | Kept in local worker threads; never stored or sent. |
| **File Names & File Paths** | **NO** | Never transmitted or logged. |
| **Git Repositories, Branches & Commits** | **NO** | Handled purely through local Git plumbing. |
| **Device Fingerprint (Trial/Floating Leases)** | Conditional | SHA-256 hash (`platform:arch:machineId`, 32 hex chars derived from VS Code machine ID or anonymous UUID; zero PII, no usernames/hostnames) sent only on reverse trial issuance or floating lease renewals. Offline wildcard enterprise keys bypass network requests entirely. |
| **Anonymous Aggregate Metrics** | Optional | Only if telemetry is explicitly enabled (can be disabled). |

### 2.2. Deterministic AST Analysis vs. Generative AI

Traditional line-based merge tools frequently fail on trivial disjoint changes, while generative AI merge tools carry substantial risks:

* **Hallucination Risk**: LLMs can invent arguments, omit security guards, or subtly alter logic during conflict reconciliation.
* **Intellectual Property Leakage**: Cloud LLM prompts expose proprietary source code to external servers and third-party models.
* **Non-Deterministic Merges**: The same conflict resolved twice by an LLM can yield different code.

**TreeResolve's Approach**:
TreeResolve parses source files into concrete syntax trees using pre-compiled, sandboxed WebAssembly grammars (`@vscode/tree-sitter-wasm`). Changes are merged using formal set-difference logic against the common ancestor (`Base`). If an operation cannot be proven syntactically disjoint, TreeResolve preserves the conflict for human review.

### 2.3. WebAssembly Sandboxing & CSP Enforcement

* **Sandboxed Execution**: Language grammars execute within isolated WebAssembly virtual environments with strict memory boundaries.
* **Webview Security**: The 3-way visual merge canvas enforces a strict Content Security Policy (CSP):

  ```text
  default-src 'none'; connect-src 'none'; object-src 'none'; frame-ancestors 'none';
  ```

  The editor webview cannot initiate outbound network requests, run arbitrary remote scripts, or leak buffer contents.

---

## 3. Enterprise Licensing Architecture

TreeResolve uses an **offline-first cryptographic licensing model** that eliminates the requirement for continuous internet connectivity.

### 3.1. Ed25519 Asymmetric Verification

* Licenses and trial tokens are issued as JSON Web Tokens (JWT) signed by Still Systems using an **Ed25519 private key**.
* The VS Code extension verifies signatures locally using the bundled Ed25519 public key.
* **Air-Gapped Operation**: Developer machines never need to connect to Still Systems servers to validate an enterprise license.

### 3.2. License Tiers & Domain Hard-Caps

* **Organization Wildcard Licenses (`domainId: '*'`)**: Authorized for enterprise-wide rollout across all internal repositories.
* **90-Day Offline Hard-Cap**: In compliance with enterprise security hygiene, wildcard leases carry a maximum offline validity window of 90 days.
* **Revocation Manifests**: The extension periodically checks edge-cached revocation manifests when network connectivity is available, immediately disabling revoked tokens (`jti`).

### 3.3. Internal Gateway / Proxy Deployment & Air-Gapped Environments

For enterprises operating within strict egress-restricted VPCs, corporate TLS-intercepting forward proxies, or air-gapped enclaves:

1. **Air-Gapped Workstations & Offline Keys**:
   * Organizations running completely disconnected networks can bypass all outbound telemetry and ticket requests by installing an offline enterprise wildcard license key.
   * In VS Code, run `TreeResolve: Install License Key` (`treeresolve.installLicense`) or provision via CLI:

     ```bash
     npx treeresolve license <JWT_TOKEN>
     ```

   * The Ed25519 asymmetric signature is verified purely in-process; zero outbound network calls are attempted once an offline license is activated.

2. **Corporate Forward Proxies (`HTTPS_PROXY` / TLS Interception)**:
   * If floating trial leases or telemetry are enabled in an enterprise environment using TLS-inspecting forward proxies, ensure developers or MDM profiles define standard proxy environment variables (`HTTPS_PROXY` / `HTTP_PROXY`).
   * When using corporate private Certificate Authorities (CAs), launch VS Code with standard corporate root trust or configure `NODE_EXTRA_CA_CERTS` / `--use-openssl-ca` so outbound license verification cleanly traverses the proxy without TLS negotiation failures.
   * Network requests feature strict 3–4 second bounded timeouts via `AbortController` to guarantee no editor hanging or command degradation in restrictive network topologies.

3. **Internal Licensing Mirror**:
   * Deploy an internal instance of the TreeResolve enterprise licensing service or an HTTP reverse proxy within your corporate intranet.
   * Configure the enterprise endpoint via MDM or VS Code configuration:

     ```json
     {
       "treeresolve.licensingEndpoint": "https://treeresolve-licensing.internal.company.com"
     }
     ```

### 3.4. Workstation Migration, Salt Invalidation & Floating Seat Reconciliation

To eliminate repository name leakage under network inspection, TreeResolve derives domain identifiers using a local 32-byte installation salt stored in VS Code `secretsStorage` (or `~/.treeresolve/installation_salt`).

* **Workstation Migration & Salt Regeneration**: If an engineer migrates laptops, re-images an operating system, or clears local application storage, a new random installation salt is generated. This alters the locally derived repository `domainId`.
* **Enterprise Mitigation**:
  * **Organization Wildcard Licenses (`domainId: '*'`)**: Enterprise accounts are authenticated at the organization tier and are completely unaffected by local salt rotation across developer laptops.
  * **Floating Lease Reclaiming**: The Still Systems licensing gateway reconciles floating seats against authenticated user identity and lease expiration timestamps rather than client-generated repository salts, preventing duplicate seat consumption during machine refreshes.

---

## 4. Fleet Management & Automated Deployment

### 4.1. Silent Installation via MDM

TreeResolve can be packaged and distributed silently across your developer fleet.

#### Microsoft Intune / Windows MDM

Deploy via PowerShell script or Intune Win32 App:

```powershell
# Install extension silently for all users
code --install-extension stillsystems.treeresolve --force
```

#### Jamf Pro / macOS Fleet

Deploy via Jamf shell policy:

```bash
#!/bin/bash
# Install extension silently under current logged-in user
sudo -u $(stat -f "%Su" /dev/console) code --install-extension stillsystems.treeresolve --force
```

### 4.2. Centralized VS Code Settings Configuration

IT administrators can push global default settings to `/etc/vscode/settings.json` (Linux), `C:\ProgramData\Code\settings.json` (Windows), or via MDM profiles:

```json
{
  "treeresolve.autoMergeImports": true,
  "treeresolve.stageOnSave": true,
  "treeresolve.enableTelemetry": false,
  "treeresolve.licensingEndpoint": "https://treeresolve-licensing.internal.company.com"
}
```

### 4.3. Repository-Level Policy Governance (`.treeresolverc`)

Security and platform teams can check a `.treeresolverc` or `treeresolve.json` file into the root of any repository to enforce uniform conflict handling:

```json
{
  "$schema": "https://treeresolve.still.systems/schema/treeresolverc.json",
  "rules": [
    {
      "pattern": "**/*.lock",
      "autoMerge": true,
      "stageOnSave": true
    },
    {
      "pattern": "security/auth/**",
      "autoMerge": false,
      "stageOnSave": false
    }
  ],
  "features": {
    "offlineVerification": true,
    "submoduleTraversal": true
  }
}
```

### 4.4. Headless CI/CD & CLI Deployment

For headless build systems, containerized CI runners, and terminal merge workflows:

* **CI/CD Credential Injection**: Provide the license token via the `TREERESOLVE_LICENSE` environment variable. In GitHub Actions, configure as a repository or organization secret:

  ```yaml
  - name: Auto-Resolve Git Conflicts
    env:
      TREERESOLVE_LICENSE: ${{ secrets.TREERESOLVE_LICENSE }}
    run: npx treeresolve auto
  ```

* **Automated Git Merge Driver Setup**: In runner base images or developer setup scripts, run:

  ```bash
  npx treeresolve setup-driver
  ```

  This configures Git's native 5-parameter merge driver (`merge.treeresolve.driver`) globally.

* **Workstation Credential Provisioning**: Install license tokens using:

  ```bash
  npx treeresolve license <token>
  ```

  Credentials are saved to `~/.treeresolve/license.json` with restricted file permissions (`0o600`).

* **Anti-Tamper Monotonic Clock Guard**: Monotonic execution watermarks are persisted to `~/.treeresolve/state.json`, ensuring local clock tampering cannot circumvent license expiration.

### 4.5. Headless CI/CD Runner Prerequisites & Node.js Runtime Isolation

The standalone TreeResolve CLI executable (`bin/treeresolve.js`) runs natively in headless environments without requiring VS Code:

* **Node.js Runtime Requirement**: The CLI bundle targets Node.js 20+ runtime environments (`node >= 20.0.0`) to utilize native cryptographic subroutines (`crypto.subtle`, `crypto.createHmac`) and modern WebAssembly features. Ensure CI/CD runner container base images provide Node.js 20.x LTS or higher.
* **Hermetic Environment Shims**: When executed outside the VS Code Extension Host, the CLI automatically provides isolated mock shims (`vscode-mock.ts`) to maintain deterministic parsing, diffing, and merge driver compatibility without external editor dependencies.

---

## 5. Procurement & Commercial Terms

Still Systems provides flexible procurement paths for enterprise organizations:

* **Payment Methods**: Invoicing with Net 30 or Net 60 payment terms, ACH transfers, wire transfers, and corporate purchasing cards.
* **Volume Seat Tiering**: Discounted seat pricing starting at 50 developer seats.
* **Enterprise Agreements**: Custom Master Services Agreements (MSA), Security Addendums, and Vendor Risk Assessment questionnaires.
* **Dedicated Support & Custom Grammar Normalizers**: Enterprise tiers include prioritized support SLAs and custom normalizer engineering for internal or proprietary DSLs.

For enterprise evaluations, custom quotes, or security reviews, submit an inquiry via the [Enterprise Portal](https://stillsystems.github.io/treeresolve-community/#enterprise) or contact the team on the [TreeResolve Community Tracker](https://github.com/stillsystems/treeresolve-community/issues).
