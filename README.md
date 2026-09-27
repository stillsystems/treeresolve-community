# TreeResolve

[![npm](https://img.shields.io/npm/v/treeresolve?color=cb3837&label=npm)](https://www.npmjs.com/package/treeresolve)
[![VS Code Marketplace](https://badgen.net/vs-marketplace/v/still-systems.ss-treeresolve?label=VS%20Code%20Marketplace&color=007acc)](https://marketplace.visualstudio.com/items?itemName=still-systems.ss-treeresolve)
[![Open VSX](https://img.shields.io/badge/Open_VSX-Coming_soon-purple)](#getting-started)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.90.0-brightgreen)](https://code.visualstudio.com)
[![Website](https://img.shields.io/badge/Website-stillsystems.github.io%2Ftreeresolve--community-blueviolet)](https://stillsystems.github.io/treeresolve-community)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/stillsystems/treeresolve-community/badge)](https://scorecard.dev/viewer/?uri=github.com/stillsystems/treeresolve-community)

**Lead with lockfiles. Review what was auto-resolved.**  
Deterministic, syntax-aware 3-way merge for VS Code—strongest on `package-lock.json`, partial helpers for yarn/pnpm, zero AI, local-first, no source-code egress.

---

## Why TreeResolve?

The highest-signal merge pain is lockfile conflicts: concurrent dependency bumps turn `package-lock.json` into a wall of false conflicts. TreeResolve auto-resolves what is safely disjoint, then makes every auto-resolution easy to review before you save.

**TreeResolve replaces line-based guesswork with local syntax comprehension:**

* **Lockfile-first auto-merge**: Dedicated 3-way semver / integrity alignment for `package-lock.json`. `yarn.lock` / `pnpm-lock.yaml` stay **partial** (thinner key-union / YAML helpers; denser cases stay manual—see [community #6](https://github.com/stillsystems/treeresolve-community/issues/6)).
* **Review auto-resolutions**: After batch or single-file auto-resolve, use **TreeResolve: Review Auto-Resolved Conflicts**. In the 3-way canvas, Tier-1 cards show policy labels (e.g. Lockfile) and remind you to review before save.
* **Deterministic Syntax Auto-Resolution**: Disjoint imports, JSON keys, and other structural hunks merge only when provably safe—never LLM rewriting.
* **Zero AI / Zero Hallucinations**: 100% programmatic and rule-driven. Your code is never transmitted to an LLM or third-party cloud merge service.
* **Synchronized 3-Way Canvas**: Dynamic Bézier ribbons linking `Ours`, `Merged Result`, and `Theirs`.

---

![TreeResolve 3-Way Merge Editor Viewport](https://stillsystems.github.io/treeresolve-community/images/preview.png)

---

## Features

### ⚡ Lockfiles & Deterministic Syntax Auto-Merge

TreeResolve identifies the structural context of conflicting blocks. If two changes are syntactically disjoint, they are resolved automatically—and surfaced for review:

* **npm Lockfile (`package-lock.json`)**: Dedicated 3-way semver range comparison and integrity hash alignment for non-breaking package additions and bumps.
* **yarn.lock / pnpm-lock.yaml (partial)**: Thinner entry / key-union and YAML 3-way helpers; complex or format-edge conflicts stay for human review.
* **ES / TypeScript / Python Imports**: Deterministic 3-way set difference against Base, honoring deletions and deduplicating imports.
* **JSON / JSONC Configuration**: Deep recursive 3-way merge combining non-colliding keys while safely detecting delete-modify conflicts.
* **Review affordance**: Command Palette → **TreeResolve: Review Auto-Resolved Conflicts**; merge-editor status shows “N auto — review before save.”

### 🎨 Visual 3-Pane Viewport

![3-Way Diff with Base Common Ancestor](https://stillsystems.github.io/treeresolve-community/images/diff3-base.png)

* **Dynamic Bézier Ribbons**: Visually connects changes between `Current (Ours)`, `Merged Result`, and `Incoming (Theirs)` panes with hardware-accelerated curves.
* **Base Ancestor Inspection**: 1-click expandable drawer revealing the exact common ancestor code both branches diverged from.
* **Proportional Scrolling**: Intercepts scroll events to maintain alignment across massive insertions without visual jumps.
* **1-Click Overrides**: Accept Ours, Accept Theirs, or combine both with intuitive inline controls.

### 🔒 Offline-First & Enterprise-Ready

* **Local Merge Execution**: Parsing, AST analysis, and conflict resolution run entirely on your machine. Source code is never transmitted for merging.
* **Air-Gapped Licensing**: Offline wildcard / enterprise keys verify via Ed25519 locally with no network calls. Reverse trials and floating leases contact the licensing gateway only for ticket issuance/renewal (see [Privacy](PRIVACY.md)).
* **Native Undo/Redo**: Integrates directly with VS Code's `WorkspaceEdit` API—standard `Cmd+Z`, `Cmd+Shift+Z`, and `Cmd+S` work seamlessly out of the box.

---

## Supported Languages

| Language | Deterministic Auto-Resolution | 3-Way Visual Diffing |
| :--- | :---: | :---: |
| **TypeScript / JavaScript** | ✅ AST Disjoint Imports & Structural Declarations | ✅ Supported |
| **Python** | ✅ AST Disjoint Imports & Functions | ✅ Supported |
| **JSON / JSONC** | ✅ Deep Non-colliding Keys | ✅ Supported |
| **npm Lockfile (`package-lock.json`)** | ✅ Dedicated 3-way semver / integrity alignment | ✅ Supported |
| **yarn.lock / pnpm-lock.yaml** | ⚙️ Partial key-union / YAML 3-way (denser cases stay manual) | ✅ Supported |
| **Go** | ✅ AST Disjoint Imports, Structs & Member Fields | ✅ Supported |
| **Rust** | ✅ AST Use Trees, Structs & Enum Variants | ✅ Supported |
| **YAML** | ✅ Indentation-Safe 3-Way Key Union & Comments | ✅ Supported |
| **Java** | ✅ 3-Way Package & Static Import Merge | ✅ Supported |
| **C#** | ✅ 3-Way Using, Static & Global Directives | ✅ Supported |
| **All Other Languages** | ⚙️ *Graceful degradation to line-based 3-way visual diff* | ✅ Supported |

---

## 🗺️ Roadmap & Upcoming Languages

TreeResolve's syntax engine expands language support by shipping dedicated language-specific normalizers.

### Currently Supported (v1.0.0)

* [x] **TypeScript / JavaScript**: Disjoint imports (named, aliased, side-effect, and type-only) with true 3-way deletion handling and AST declaration merging.
* [x] **JSON / JSONC**: Nested recursive 3-way key deduplication and conflict detection.
* [x] **Python**: Module and from-import normalization with true 3-way deletion handling.
* [x] **Go**: Grouped `import (...)` block auto-union, struct declarations, and member-level field merging with deletion preservation.
* [x] **Rust**: `use` declaration tree merging, struct declarations, and enum variant unions with deletion preservation.
* [x] **YAML**: Indentation-safe 3-way key-value merging for Kubernetes manifests, Docker Compose, and CI/CD pipelines with comment preservation.
* [x] **Java**: 3-way package and static import normalization with group ordering and deletion preservation.
* [x] **C#**: 3-way `global using`, `using static`, alias declarations, and namespace directives with deletion preservation.
* [x] **npm Lockfile (`package-lock.json`)**: Dedicated 3-way semver / integrity alignment.
* [x] **yarn.lock / pnpm-lock.yaml (partial)**: Entry / key-union and YAML 3-way helpers; coverage is thinner than `package-lock.json` (see [community known limitations](https://github.com/stillsystems/treeresolve-community/issues/6)).
* [x] **Standalone Git Mergetool CLI (`treeresolve`)**: Zero-dependency command-line interface for terminal Git merges and headless CI pipelines.
* [x] **Batch Conflict Auto-Resolver**: Headless scanning and 1-step resolution across entire worktrees.
* [x] **Intra-Line Token Micro-Diffing**: Visual word/token-level diff highlighting in the 3-way merge canvas.
* [x] **Intra-Line Interactive Token Acceptance**: Micro-level sub-line segment picking with 3-way token reconciliation.
* [x] **Semantic Intra-Line Token Highlighting**: Host-classified AST/heuristic badges on the merge canvas.
* [x] **Project Configuration (`.treeresolverc`)**: Repository-level glob policies and custom auto-merge rules.
* [x] **Universal Line-based 3-Way Diff**: Visual fallback for all other file types.

### Next

* [ ] **Yarn (`yarn.lock`) / pnpm (`pnpm-lock.yaml`) parity with npm**: Deepen the existing partial helpers to match dedicated `package-lock.json` coverage—first priority before we can honestly claim Yarn/pnpm are fully covered.
* [ ] **Other lockfile ecosystems (by demand)**: Formats such as `Cargo.lock`, Poetry/uv, `Gemfile.lock`, and `composer.lock` may follow when community demand justifies them—not a commitment to ship every ecosystem now.

Roadmap items and language requests are tracked in the [TreeResolve Community Tracker](https://github.com/stillsystems/treeresolve-community/issues).

> 💡 **Have a feature idea, language request, or bug report?**  
> Join the conversation or open an issue in the [TreeResolve Community Tracker](https://github.com/stillsystems/treeresolve-community/issues).

---

## Getting Started

### 1. Installation

**CLI (live on npm @ 1.0.0):**

```bash
npx treeresolve --version
# or: npm install -g treeresolve
```

**VS Code extension:** Install [`still-systems.ss-treeresolve`](https://marketplace.visualstudio.com/items?itemName=still-systems.ss-treeresolve) from the Marketplace (or Extensions view → search *TreeResolve*). Open VSX realign for VSCodium is next; until then use the CLI above for mergetool / headless workflows.

### 2. Resolving a Merge Conflict in VS Code

When a Git merge or rebase encounters a conflict, open the conflicted file, then open the TreeResolve canvas from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), or use **Reopen Editor With… → TreeResolve 3-Way Merge**:

```plaintext
TreeResolve: Open 3-Way Merge Editor
```

Non-colliding structural changes (especially `package-lock.json` hunks) auto-resolve instantly. Tier-1 cards show a policy label—**review auto-resolutions before Save & Stage**. Remaining logical conflicts stay in the center pane.

### 3. Batch Auto-Resolve, Then Review

To scan your workspace for lockfile and other deterministic conflicts:

```plaintext
TreeResolve: Batch Auto-Resolve Lockfiles & Deterministic Conflicts
```

After a successful run, choose **Review Auto-Resolved** on the notification (or run the command below) to reopen touched files and eye-check the Batch log:

```plaintext
TreeResolve: Review Auto-Resolved Conflicts
```

* **Graceful Cancellation**: Cancel long-running monorepo scans from the progress notification.
* **Live Observability**: Per-hunk policies (e.g. lockfile) stream to **TreeResolve Batch** (`View` → `Output` → `TreeResolve Batch`).
* **Safe Exclusions**: Skips build outputs and binaries (`node_modules`, `dist`, `.git`, `*.wasm`, `*.zip`, etc.).

Or resolve the active conflicted file:

```plaintext
TreeResolve: Auto-Resolve Lockfiles & Deterministic Conflicts
```

### 4. Git Mergetool & CLI Companion

TreeResolve includes a standalone Node.js CLI companion executable via `npx treeresolve` or global install.

To configure Git to use TreeResolve as your default terminal merge tool:

```bash
npx treeresolve setup-git
```

To configure Git to use TreeResolve as an automated native merge driver (`%O %A %B %L %P`):

```bash
npx treeresolve setup-driver
```

To run a headless batch auto-resolver across your current Git repository before opening manual merge editors:

```bash
npx treeresolve auto
```

To check repository domain licensing status and active entitlement tier:

```bash
npx treeresolve status
```

To install or update a commercial license token for headless CLI environments:

```bash
npx treeresolve license <token>
```

#### Headless Licensing in CI/CD & Automated Pipelines

In headless environments (terminal runs, CI/CD runners, Git hooks), TreeResolve operates in **Community Tier** by default. To unlock full Pro AST auto-merging and lockfile reconciliation in headless runs:

* Set the `TREERESOLVE_LICENSE` environment variable in your CI runner (e.g. GitHub Actions secret, GitLab CI variable).
* Or configure `~/.treeresolve/license.json` locally using `npx treeresolve license <token>`.

---

## Subscription & Licensing

TreeResolve uses a Reverse Trial model: install the extension and enjoy all Pro features unrestricted for 14 days without entering a credit card or signing up.

| Feature | Community Tier (Free Forever) | Pro Tier ($10/mo or $99/yr) | Enterprise Tier ($20/seat/mo or $199/seat/yr)* |
| :--- | :---: | :---: | :---: |
| **Direct Checkout** | Free forever · [Install extension](https://marketplace.visualstudio.com/items?itemName=still-systems.ss-treeresolve) · [CLI on npm](https://www.npmjs.com/package/treeresolve) | [**Get Pro ($99/yr)**](https://stillsystems.github.io/treeresolve-community/?checkout=pro) · [($10/mo)](https://stillsystems.github.io/treeresolve-community/?checkout=monthly) | [**Buy Fleet Seats**](https://stillsystems.github.io/treeresolve-community/?checkout=enterprise) · [Inquire](https://stillsystems.github.io/treeresolve-community/#enterprise) |
| **Target User** | Open Source / Hobbyists | Individual Professionals | Engineering Teams & Enterprise Fleets |
| **License Binding** | N/A | **Per person** — any repo, up to 3 machines | **Seats + org wildcards** (fleet / MDM) |
| **3-Pane Visual Diffing** | ✅ Included | ✅ Included | ✅ Included |
| **Dynamic Ribbon Alignment** | ✅ Included | ✅ Included | ✅ Included |
| **Native Undo/Redo & Save Hooks** | ✅ Included | ✅ Included | ✅ Included |
| **Import Auto-Merge (TS / JS / Python)** | ✅ Free taste | ✅ Included | ✅ Included |
| **Full Syntax Auto-Merge (all languages + declarations)** | ❌ | ✅ Unlimited Deterministic Merges | ✅ Unlimited Deterministic Merges |
| **Lockfile Auto-Merge (npm dedicated; Yarn/PNPM partial)** | ❌ | ✅ Included | ✅ Included |
| **Batch / CLI / CI Merge Driver** | ❌ | ✅ Included | ✅ Included |
| **Repo Governance (`.treeresolverc`)** | ❌ | ✅ Included | ✅ Included |
| **Intra-Line Token Alignment** | ❌ Line-based only | ✅ Token-level syntax highlighting | ✅ Token-level syntax highlighting |
| **Offline Cryptographic Leases** | ✅ Yes | ✅ Ed25519 offline verification | ✅ Wildcard / Multi-repo domain lease |
| **Centralized / MDM Deployment** | ❌ | ❌ | ✅ Automated dotfile / container rollout |
| **Volume Discounts** | ❌ | ❌ | ✅ Tiered discounts at 50+, 200+, 1,000+ seats |
| **Billing & Payment Options** | ❌ (Free forever) | Self-serve Credit Card (Paddle) | Self-serve card, or invoiced / PO by quote for qualifying fleets |

*\*Enterprise pricing reflects standard base list price. Volume discounting and fleet licensing apply automatically for teams of 50 to 1,000+ developers via custom quote or PO.*

When your 14-day trial ends, TreeResolve automatically degrades to the Community tier (you keep the 3-pane canvas **and** TS/JS/Python import auto-merge). Your editor will never be locked or blocked from resolving conflicts manually. **Pro is a per-person license** — install once, use in any repository on up to three machines. Commercial licenses utilize 30-day offline-first floating leases; person/org wildcard tokens carry a maximum 90-day offline validity window.

For organizational procurement, volume quotes, InfoSec assessments, and MDM rollout instructions, refer to the [Enterprise Deployment & Security Guide](ENTERPRISE.md) or submit an inquiry on the [Enterprise Portal](https://stillsystems.github.io/treeresolve-community/#enterprise).

---

## Workspace Trust & Security

TreeResolve supports **limited** operation in untrusted workspaces (`capabilities.untrustedWorkspaces.supported = "limited"`). You can view and analyze 3-way AST diffs in Restricted Mode; automatic staging and disk write-backs remain disabled until the workspace is trusted. Full merge write-back and Git plumbing require a Trusted Workspace because Tree-sitter parsers and local Git operations run against repository contents.

Enterprise buyers: see the [Trust Pack](docs/trust/README.md) (data-flow, CAIQ lite, offline VSIX / allow-list, SBOM + Sigstore) and [SECURITY.md](.github/SECURITY.md) (VDP).

### Security Hardening & Defense-in-Depth (v1.0.0)

* **Atomic Save Architecture**: User resolutions (`Accept Ours`, `Accept Theirs`, `Accept Both`) are accumulated safely in memory without intermediate buffer rewrites. All decisions commit atomically upon save via a single `WorkspaceEdit` with conflict marker integrity validation, completely eliminating state desynchronization races.
* **Bounded Tree-sitter WASM Execution**: Parsers enforce a strict 30ms CPU execution ceiling (`parser.setTimeoutMicros(30000)`) with an upfront 5,000-character line pre-flight filter that safely bypasses minified bundles and pathological lines.
* **Cryptographic WebAssembly Integrity Verification**: All shipped Tree-sitter `.wasm` grammars are validated against compiled SHA-256 digests prior to runtime compilation and instantiation, blocking execution of tampered or altered binaries.
* **Unified Salted Domain Identifiers**: Repository domain keys are salted using a unified workstation-unique secret (`HMAC-SHA256`) synchronized across VS Code `secretsStorage` and `~/.treeresolve/installation_salt`, preventing rainbow-table enumeration of internal project paths while eliminating split-identity lease exhaustion between GUI and CLI.
* **Decoupled Two-Phase Ribbon Layout Engine**: Visual Bézier connectors batch DOM reads separately from canvas drawing via `requestAnimationFrame` with viewport culling (+/- 100px), eliminating layout thrashing and preserving steady 60fps interaction on large files.
* **Headless CLI Runtime Requirements & Engine Guard**: Standalone CLI runner enforces Node.js >= 20.0.0 via manifest declaration and fail-fast runtime entry check to guarantee native WebCrypto API support in bare container environments.

---

## Extension Settings

| Setting | Default | Description |
| :--- | :---: | :--- |
| `treeresolve.autoMergeImports` | `true` | Automatically resolve non-colliding import statements on file open. |
| `treeresolve.renderRibbons` | `true` | Render dynamic Bézier ribbons between diff panes. |
| `treeresolve.scrollSynchronization` | `true` | Synchronize viewport scrolling based on aligned code blocks. |
| `treeresolve.stageOnSave` | `false` | Automatically run `git add` when saving a fully resolved merge file (strictly blocked if raw conflict markers remain). |
| `treeresolve.licensingEndpoint` | `https://treeresolve-licensing.still-systems.workers.dev` | Licensing and trial ticketing gateway URL (`scope: machine`). Launch target after DNS cutover: `https://licensing.stillsystems.com` (flip `USE_CUSTOM_LICENSING_DOMAIN` in `src/licensing/endpoints.ts`). |
| `treeresolve.enableTelemetry` | `true` | Enable anonymous telemetry reporting of auto-merge acceptance rates and resolution time. |

### Custom Editor Registration & Scoping

TreeResolve contributes a custom 3-way merge editor (`treeresolve.mergeEditor`) configured with `priority: "option"` and `filenamePattern: "*"`. Because Git merge conflicts can emerge in any textual file type across diverse programming languages, configuration formats, and documentation (TypeScript, Python, Go, Rust, JSON, YAML, Markdown, Dockerfiles, etc.), registering against `*` ensures TreeResolve is universally available whenever conflicts occur. By configuring `priority: "option"`, TreeResolve never overrides the user's default language editor and is strictly accessed on-demand via **Open With...** or the `treeresolve.openMergeEditor` command.

---

## Telemetry, Licensing & Privacy Disclosure

TreeResolve is built with an **offline-first, privacy-respecting** architecture. Full details are in [PRIVACY.md](PRIVACY.md).

* **Zero Source Code Transmission**: Source code, AST tokens, file paths, repository URLs, branch names, and developer identities are **never** collected or transmitted for merge analysis.
* **Anonymous Heuristic Metrics**: When `treeresolve.enableTelemetry` is active, TreeResolve measures the aggregate percentage of deterministic auto-merges accepted (`autoAcceptanceRatePercent`), resolution duration (`durationMs`), and coarse syntax error codes (e.g. `ERR_PARSE_SYNTAX_ERROR` without raw text snippets).
* **Licensing & Reverse Trial Device Fingerprinting**: To validate 14-day reverse trials and renew floating enterprise leases without requiring user account registration or passwords, TreeResolve computes an anonymized SHA-256 hash of the machine environment (`platform:arch:machineId`, derived from VS Code's anonymous machine identifier or an anonymous persistent UUID in standalone CLI, truncated to 32 hex characters). It transmits **no usernames, hostnames, or MAC addresses** solely to the configured `licensingEndpoint` (default today: `https://treeresolve-licensing.still-systems.workers.dev`; launch target: `https://licensing.stillsystems.com`). This fingerprint is never linked to source code, repositories, or telemetry metrics. Paid offline wildcard licenses and air-gapped deployments never contact the endpoint for validation.
* **Workspace Trust**: Supports Restricted Mode (`"limited"`). You can safely view and analyze 3-way AST diffs in untrusted workspaces; direct disk write-backs and Git staging commands are disabled until workspace trust is granted.
* **Full User Control (Opt-Out)**: You can disable anonymous telemetry reporting at any time by configuring:

  ```json
  "treeresolve.enableTelemetry": false
  ```

  TreeResolve also automatically respects VS Code's global telemetry setting (`telemetry.telemetryLevel: "off"`). If either setting is disabled, zero telemetry is recorded or sent.

---

## Support

See [SUPPORT.md](SUPPORT.md) for community issues, Pro billing, and Enterprise contact paths.

---

## License

Proprietary. Copyright (c) 2026 Still Systems, LLC. All rights reserved. See [LICENSE](LICENSE) for terms, [PRIVACY.md](PRIVACY.md) for privacy practices, and [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for open-source notices.
