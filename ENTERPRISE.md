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
| **Developer Identity & Credentials** | **NO** | No personal data or credentials collected. |
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

### 3.3. Internal Gateway / Proxy Deployment

For enterprises operating within strict egress-restricted VPCs or proxies:

1. Deploy an internal instance of the `services/licensing-worker` or an HTTP reverse proxy within your corporate intranet.
2. Configure the enterprise endpoint via MDM or VS Code configuration:

   ```json
   {
     "treeresolve.licensingEndpoint": "https://treeresolve-licensing.internal.company.com"
   }
   ```

---

## 4. Fleet Management & Automated Deployment

### 4.1. Silent Installation via MDM

TreeResolve can be packaged and distributed silently across your developer fleet.

#### Microsoft Intune / Windows MDM

Deploy via PowerShell script or Intune Win32 App:

```powershell
# Install extension silently for all users
code --install-extension still-systems.treeresolve --force
```

#### Jamf Pro / macOS Fleet

Deploy via Jamf shell policy:

```bash
#!/bin/bash
# Install extension silently under current logged-in user
sudo -u $(stat -f "%Su" /dev/console) code --install-extension still-systems.treeresolve --force
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

---

## 5. Procurement & Commercial Terms

Still Systems provides flexible procurement paths for enterprise organizations:

* **Payment Methods**: Invoicing with Net 30 or Net 60 payment terms, ACH transfers, wire transfers, and corporate purchasing cards.
* **Volume Seat Tiering**: Discounted seat pricing starting at 50 developer seats.
* **Enterprise Agreements**: Custom Master Services Agreements (MSA), Security Addendums, and Vendor Risk Assessment questionnaires.
* **Dedicated Support & Custom Grammar Normalizers**: Enterprise tiers include prioritized support SLAs and custom normalizer engineering for internal or proprietary DSLs.

For enterprise evaluations, custom quotes, or security reviews, submit an inquiry via the [Enterprise Portal](https://stillsystems.github.io/treeresolve-community/#enterprise) or contact the team on the [TreeResolve Community Tracker](https://github.com/stillsystems/treeresolve-community/issues).
