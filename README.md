# TreeResolve

[![Version](https://img.shields.io/visual-studio-marketplace/v/stillsystems.treeresolve)](https://marketplace.visualstudio.com/items?itemName=stillsystems.treeresolve)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.85.0-brightgreen)](https://code.visualstudio.com)
[![Website](https://img.shields.io/badge/Website-stillsystems.github.io%2Ftreeresolve--community-blueviolet)](https://stillsystems.github.io/treeresolve-community)

**Deterministic, syntax-aware 3-way merge conflict resolution for VS Code.**  
Turn tedious manual rebase slogs into effortless operations with zero hallucinations, zero cloud lock-in, and instant local execution.

---

## Why TreeResolve?

Standard Git and native merge tools operate strictly on raw text lines. When two branches both insert an import, add an enum flag, or update adjacent JSON properties, line-based diff engines flag false conflicts and force you to manually click through hundreds of trivial hunks.

**TreeResolve replaces line-based guesswork with local syntax comprehension:**

* **Deterministic Syntax Auto-Resolution**: Analyzes code structurally to safely auto-resolve non-colliding syntax elements (disjoint imports and JSON keys).
* **Zero AI / Zero Hallucinations**: 100% programmatic and rule-driven. Your code is never transmitted to an LLM or third-party cloud service—merges are provably correct, offline-ready, and reproducible.
* **Synchronized 3-Way Canvas**: A smooth visual editor with dynamic Bézier ribbons linking your branches (`Ours`, `Merged Result`, and `Theirs`).
* **Responsive Local Performance**: Efficient diff alignment and canvas rendering without external cloud dependencies.

---

![TreeResolve 3-Way Merge Editor Viewport](images/preview.png)

---

## Features

### ⚡ Deterministic Syntax Auto-Merge

TreeResolve identifies the structural context of conflicting blocks. If two changes are syntactically disjoint, they are resolved automatically before the merge editor even opens:

* **ES / TypeScript / Python Imports**: Deterministic 3-way set difference against Base, honoring deletions and deduplicating imports.
* **JSON / JSONC Configuration**: Deep recursive 3-way merge combining non-colliding keys while safely detecting delete-modify conflicts.
* **Lockfiles (`package-lock.json`)**: 3-way semver range comparison and integrity hash alignment for non-breaking package additions and bumps.

### 🎨 Visual 3-Pane Viewport

![3-Way Diff with Base Common Ancestor](images/diff3-base.png)

* **Dynamic Bézier Ribbons**: Visually connects changes between `Current (Ours)`, `Merged Result`, and `Incoming (Theirs)` panes with hardware-accelerated curves.
* **Base Ancestor Inspection**: 1-click expandable drawer revealing the exact common ancestor code both branches diverged from.
* **Proportional Scrolling**: Intercepts scroll events to maintain alignment across massive insertions without visual jumps.
* **1-Click Overrides**: Accept Ours, Accept Theirs, or combine both with intuitive inline controls.

### 🔒 Offline-First & Enterprise-Ready

* **Air-Gapped Operation**: Runs entirely on your local machine. Zero telemetry, zero cloud dependencies.
* **Native Undo/Redo**: Integrates directly with VS Code's `WorkspaceEdit` API—standard `Cmd+Z`, `Cmd+Shift+Z`, and `Cmd+S` work seamlessly out of the box.

---

## Supported Languages

| Language | Deterministic Auto-Resolution | 3-Way Visual Diffing |
| :--- | :---: | :---: |
| **TypeScript / JavaScript** | ✅ AST Disjoint Imports & Structural Declarations | ✅ Supported |
| **Python** | ✅ AST Disjoint Imports & Functions | ✅ Supported |
| **JSON / JSONC** | ✅ Deep Non-colliding Keys | ✅ Supported |
| **Lockfiles (package-lock.json)** | ✅ 3-Way Semver Merge & Integrity Alignment | ✅ Supported |
| **Go** | ✅ AST Disjoint Imports, Structs & Member Fields | ✅ Supported |
| **Rust** | ✅ AST Use Trees, Structs & Enum Variants | ✅ Supported |
| **YAML** | ✅ Indentation-Safe 3-Way Key Union & Comments | ✅ Supported |
| **Java** | ✅ 3-Way Package & Static Import Merge | ✅ Supported |
| **C#** | ✅ 3-Way Using, Static & Global Directives | ✅ Supported |
| **All Other Languages** | ⚙️ *Graceful degradation to line-based 3-way visual diff* | ✅ Supported |

---

## 🗺️ Roadmap & Upcoming Languages

TreeResolve's syntax engine expands language support by shipping dedicated language-specific normalizers.

### Currently Supported (v0.3.0)

* [x] **TypeScript / JavaScript**: Disjoint imports (named, aliased, side-effect, and type-only) with true 3-way deletion handling and AST declaration merging.
* [x] **JSON / JSONC**: Nested recursive 3-way key deduplication and conflict detection.
* [x] **Python**: Module and from-import normalization with true 3-way deletion handling.
* [x] **Go**: Grouped `import (...)` block auto-union, struct declarations, and member-level field merging with deletion preservation.
* [x] **Rust**: `use` declaration tree merging, struct declarations, and enum variant unions with deletion preservation.
* [x] **YAML**: Indentation-safe 3-way key-value merging for Kubernetes manifests, Docker Compose, and CI/CD pipelines with comment preservation.
* [x] **Java**: 3-way package and static import normalization with group ordering and deletion preservation.
* [x] **C#**: 3-way `global using`, `using static`, alias declarations, and namespace directives with deletion preservation.
* [x] **Lockfiles (`package-lock.json`)**: 3-way semver range comparison and integrity alignment.
* [x] **Standalone Git Mergetool CLI (`treeresolve`)**: Zero-dependency command-line interface for terminal Git merges and headless CI pipelines.
* [x] **Batch Conflict Auto-Resolver**: Headless scanning and 1-step resolution across entire worktrees.
* [x] **Intra-Line Token Micro-Diffing**: Visual word/token-level diff highlighting in the 3-way merge canvas.
* [x] **Project Configuration (`.treeresolverc`)**: Repository-level glob policies and custom auto-merge rules.
* [x] **Universal Line-based 3-Way Diff**: Visual fallback for all other file types.

### In Active Development

* [ ] **Intra-Line Interactive Token Acceptance**: Micro-level sub-line segment picking.
* [ ] **Semantic Intra-Line Token Highlighting**: Visual micro-highlighting for variable and argument renames.

> 💡 **Have a feature idea, language request, or bug report?**  
> Join the conversation or open an issue in the [TreeResolve Community Tracker](https://github.com/stillsystems/treeresolve-community/issues).

---

## Getting Started

### 1. Installation

Install **TreeResolve** from the VS Code Marketplace or by running:

```bash
ext install stillsystems.treeresolve
```

### 2. Resolving a Merge Conflict in VS Code

When a Git merge or rebase encounters a conflict, open the conflicted file. Click the **Resolve with TreeResolve** editor button in the top-right tab bar, or run from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

```plaintext
TreeResolve: Open 3-Way Merge Editor
```

Non-colliding structural changes will auto-resolve instantly. Review any remaining logical conflicts in the center pane and click **Save & Stage**.

### 3. Batch Auto-Resolving Conflicts

To scan your entire workspace and auto-resolve all 100% deterministic syntax conflicts in one click:

```plaintext
TreeResolve: Batch Auto-Resolve All Deterministic Conflicts
```

Or quickly resolve disjoint imports in the active file:

```plaintext
TreeResolve: Auto-Resolve Disjoint Imports
```

### 4. Git Mergetool & CLI Companion

TreeResolve includes a standalone Node.js CLI companion executable via `npx treeresolve` or global install.

To configure Git to use TreeResolve as your default terminal merge tool:

```bash
npx treeresolve setup-git
```

To run a headless batch auto-resolver across your current Git repository before opening manual merge editors:

```bash
npx treeresolve auto
```

To invoke TreeResolve manually as a 3-way backend:

```bash
npx treeresolve merge <base> <local> <remote> <merged>
```

---

## Subscription & Licensing

TreeResolve uses a Reverse Trial model: install the extension and enjoy all Pro features unrestricted for 14 days without entering a credit card or signing up.

| Feature | Community Tier (Free Forever) | Pro Tier ($10/mo or $99/yr) | Enterprise Tier ($20/seat/mo or $199/seat/yr) |
| :--- | :---: | :---: | :---: |
| **3-Pane Visual Diffing** | ✅ Included | ✅ Included | ✅ Included |
| **Dynamic Ribbon Alignment** | ✅ Included | ✅ Included | ✅ Included |
| **Native Undo/Redo & Save Hooks** | ✅ Included | ✅ Included | ✅ Included |
| **Deterministic Syntax Auto-Merge** | ❌ (Manual Hunk Clicks) | ✅ Unlimited Deterministic Merges | ✅ Unlimited Deterministic Merges |
| **Intra-Line Token Alignment** | ❌ Line-based only | ✅ Token-level syntax highlighting | ✅ Token-level syntax highlighting |
| **Offline Cryptographic Leases** | ✅ Yes | ✅ Ed25519 offline verification | ✅ Wildcard / Multi-repo domain lease |
| **Centralized / MDM Deployment** | ❌ | ❌ | ✅ Automated dotfile / container rollout |
| **Billing & Payment Options** | ❌ (Free forever) | Self-serve Credit Card | Self-serve Credit Card, ACH, or PO / Invoicing (Net 30) |

When your 14-day trial ends, TreeResolve automatically degrades to the Community tier. Your editor will never be locked or blocked from resolving conflicts manually. Commercial licenses utilize 30-day offline-first floating leases, and wildcard licenses carry a maximum 90-day validity window.

For organizational procurement, InfoSec assessments, and MDM rollout instructions, refer to the [Enterprise Deployment & Security Guide](ENTERPRISE.md).

---

## Extension Settings

| Setting | Default | Description |
| :--- | :---: | :--- |
| `treeresolve.autoMergeImports` | `true` | Automatically resolve non-colliding import statements on file open. |
| `treeresolve.renderRibbons` | `true` | Render dynamic Bézier ribbons between diff panes. |
| `treeresolve.scrollSynchronization` | `true` | Synchronize viewport scrolling based on aligned code blocks. |
| `treeresolve.stageOnSave` | `false` | Automatically run `git add` when saving a fully resolved merge file. |
| `treeresolve.licensingEndpoint` | `https://treeresolve-licensing.still-systems.workers.dev` | Licensing and trial ticketing gateway URL. |
| `treeresolve.enableTelemetry` | `true` | Enable anonymous telemetry reporting of auto-merge acceptance rates and resolution time. |

---

## Telemetry & Privacy

TreeResolve is built with an **offline-first, privacy-respecting** architecture:

* **Metrics Recorded**: When enabled, TreeResolve measures the percentage of deterministic auto-merges accepted (`autoAcceptanceRatePercent`) and the elapsed time spent resolving conflicts (`durationMs`) to improve normalizer heuristics.
* **Zero Source Code Transmission**: Source code, AST tokens, file paths, repository URLs, branch names, and developer identities are **never** collected or transmitted.
* **Full User Control (Opt-Out)**: You can disable telemetry at any time by configuring:

  ```json
  "treeresolve.enableTelemetry": false
  ```

  TreeResolve also automatically respects VS Code's global setting (`telemetry.telemetryLevel: "off"`). If either setting is disabled, zero telemetry is recorded or sent.
