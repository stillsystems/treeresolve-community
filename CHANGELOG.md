# Changelog

All notable changes to the "TreeResolve" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.5] - 2026-09-22

### Licensing & Billing

- **Paddle Billing Integration**: Migrated checkout and license delivery from Stripe to Paddle Billing, including automated license issuance on purchase and automated revocation on cancellation or failed payment.
- **In-Page Checkout**: The community page now opens checkout in an in-page overlay instead of redirecting to an external page, with support for deep-linked checkout via URL parameters.

### Marketplace Compliance

- **Trial Pricing Label**: Declared `"pricing": "Trial"` in the extension manifest for accurate Visual Studio Marketplace labeling of the reverse-trial model.
- **Privacy & Support Policies**: Added `PRIVACY.md` and `SUPPORT.md`, linked from the README and community sync set.
- **Manifest Hygiene**: Set publisher author metadata, gallery banner, Q&A URL, and corrected Marketplace categories to `Other`.
- **Documentation Alignment**: Synchronized version badges, VS Code engine requirement (`^1.138.0`), workspace-trust (`limited`), and default licensing endpoint copy with runtime behavior.
- **Packaging Guardrails**: Fixed prepublish checkout-link scan path (`tools/check-no-stripe-test-links.js`).
- **Licensing Default**: Standardized the default licensing gateway to `https://licensing.treeresolve.still.systems`.

## [0.4.4] - 2026-09-11

### Security & Hardening

- **WebAssembly Integrity Checks**: Hardened verification of bundled WebAssembly grammar files before load.
- **Release Hygiene**: Cut a clean `v0.4.4` release with freshly packaged binaries.
- **CLI Reliability**: Added a fail-fast check that gives a clear error on unsupported Node.js versions instead of failing deep in module loading.
- **Manifest Cleanup**: Standardized marketplace metadata categories and keyword tags.
- **Adversarial VSIX Review & Compliance Remediation**:
  - Removed the bundled `undici` dependency in favor of Node 20's native `fetch`, shrinking the extension bundle by ~70%.
  - Added `THIRD_PARTY_LICENSES.md` with complete open-source attributions for bundled dependencies.
  - Corrected marketplace copy to accurately describe our privacy posture instead of unsubstantiated compliance claims.
  - Optimized the marketplace icon asset, reducing its size by over 90%.
  - Excluded the standalone CLI binary from the `.vsix` package, reducing packaged extension size by ~60%.
  - Added a user-visible notice when batch conflict scanning falls back to a bounded workspace search.
  - Documented in `ARCHITECTURE.md`/`README.md` why the custom editor is registered broadly rather than for specific file types.

## [0.4.3] - 2026-09-10

### Security & Hardening

- **Save Reliability**: Reworked how hunk resolutions and document saves are sequenced to eliminate race conditions between rapid keyboard-driven resolutions and commit actions, ensuring no user decisions are ever dropped.
- **Parser Safety Limits**: Added execution time and line-length limits to the syntax parser to prevent the editor from hanging on minified bundles, lockfiles, or other unusually large single lines.
- **WebAssembly Integrity Checks**: Verified grammar binaries against known-good checksums before use.
- **Canvas Rendering Performance**: Restructured diff-ribbon rendering to batch layout work separately from drawing, and throttled updates, eliminating frame drops and input stutter on conflicts with 150+ hunks.
- **Manifest Cleanup**: Tightened marketplace category listing.

## [0.4.2] - 2026-09-10

### Security & Hardening

- **Save Reliability**: Serialized document mutations and switched to atomic full-document snapshot edits, eliminating race conditions and truncation during rapid sequential operations.
- **Parser Safety Limits**: Added execution timeouts and recursion/size guards to the syntax parser to prevent hangs on pathological input.
- **Packaging Hygiene**: Release packaging now strips internal scripts and development-only files from the shipped package.
- **Rendering Performance**: Large diffs now stream into view progressively instead of rendering all at once, eliminating UI stutter on very large files.
- **Memory Management**: Fixed a memory leak in the syntax parser affecting large batch operations.
- **CLI Packaging**: Ensured the bundled CLI binary has correct executable permissions when installed.
- **Canvas Rendering**: Fixed a rendering edge case when merge panes are collapsed to zero size.
- **Air-Gapped & Corporate Proxy Support**: Documented configuration for corporate proxy environments and fully offline license activation.
- **Large Repository Performance**: Replaced unbounded workspace file scans with targeted Git queries, improving performance and responsiveness on large repositories.
- **Save-Time Safety Check**: The extension now refuses to stage a file to Git if it still contains unresolved conflict markers.
- **Privacy**: Removed local hostnames and usernames from anonymous usage identifiers.
- **Large File Safety**: Files over 10MB, containing binary data, or recognized as Git LFS pointers are now safely skipped by both the interactive editor and batch auto-resolve.
- **Workspace Trust**: The extension now supports VS Code's restricted/untrusted workspace mode, allowing read-only diffing while blocking writes until trust is granted.

## [0.4.1] - 2026-09-10

### Added

- **Commercial Licensing for the CLI**: Advanced auto-merge and whole-file resolution features in the standalone CLI now require a Pro license, matching the extension. Added commands to check license status and install a license token, plus CI/CD-friendly credential support.
- **Improved Repository Detection**: Unified and improved how the CLI resolves the repository root, remote URL, and submodule status, including better handling of repos without an `origin` remote.
- **Standalone CLI Bundling**: The CLI is now bundled as a self-contained executable and shipped inside the `.vsix` package.
- **Batch Auto-Resolve Cancellation**: Batch conflict resolution can now be cancelled mid-run, and streams live progress to a dedicated output channel.
- **Security Hardening**:
  - Locked down the licensing endpoint setting so untrusted repositories can't redirect it.
  - Disabled the extension in untrusted workspaces pending trust.
  - Usage telemetry now sends only structured error categories — never raw error text, file paths, or code snippets.
  - Removed `innerHTML` usage in the merge editor in favor of safe DOM construction.
  - Hardened internal Git command execution against path-argument injection.

### Changed

- **Production Payment Links**: Switched all checkout links from test mode to live production links.
- **Marketplace Badges**: Updated to current, branded marketplace badges.

## [0.4.0] - 2026-09-08

### Added

- **Automated Release Pipeline**: Tag-driven CI/CD now publishes automatically to Open VSX, VS Code Marketplace, and GitHub Releases.
- **Native Git Merge Driver**: TreeResolve can now be configured as a Git merge driver for preemptive AST-level conflict resolution, with one-command setup.
- **Yarn & PNPM Lockfile Support**: Added deterministic 3-way resolution for `yarn.lock` and `pnpm-lock.yaml`.
- **Merge Editor Ergonomics**: Added keyboard navigation, a focused-hunk highlight, a live completion progress bar, and an in-editor shortcut reference.

## [0.3.1] - 2026-09-08

### Changed

- **Open VSX Publication**: TreeResolve is now officially published on the Open VSX Registry.
- **Publisher Identifier**: Standardized the extension's publisher identifier across manifest and documentation.

## [0.3.0] - 2026-09-08

### Added

#### Intra-Line Token Micro-Diffing

- **Visual Token Highlighting**: Word/token-level diff highlighting within conflicting lines in the merge view.

#### Java & C# Deterministic Normalizers

- **Java 3-Way Import Resolver**: Deterministic resolution for Java imports, including static and third-party imports.
- **C# 3-Way Using Directive Resolver**: Deterministic resolution for C# `using` directives, aliases, and namespaces.

#### Repository-Level Configuration

- **Project Policy Engine**: Support for a `.treeresolverc` (or `treeresolve.json`) config file with glob-based rules for auto-merge and auto-staging behavior.

#### Standalone Git Mergetool CLI Companion & Batch Resolver

- **CLI Companion**: A `npx treeresolve` command-line tool for terminal-based Git merge workflows.
- **Git Mergetool Backend**: Implements Git's mergetool protocol for use as an external merge tool.
- **One-Step Git Configuration**: `treeresolve setup-git` configures Git to use TreeResolve automatically.
- **Headless Batch Auto-Resolver**: `treeresolve auto` scans a repo for conflicts and auto-resolves the deterministic ones.

#### Workspace Batch Conflict Auto-Resolver

- **Batch Command**: Auto-resolve deterministic syntax conflicts across an entire workspace in one step, with progress notification.

#### Anonymous Merge Telemetry & Privacy Opt-Out

- **Usage Metrics**: Anonymous, aggregate metrics on auto-merge acceptance rate and resolution time, with zero collection of source code or identifying data.
- **Opt-Out**: Configurable independently and automatically respects VS Code's global telemetry setting.

## [0.2.0] - 2026-09-08

### Added

#### Concrete Syntax Tree (CST) Engine

- **Cross-Platform WASM Parsing**: Adopted Microsoft's official Tree-sitter WASM build across TypeScript, TSX, JavaScript, Python, Go, and Rust, with no native compilation required.
- **Improved Import Merging**: Upgraded import normalization to a full syntax-tree basis, supporting multi-line imports, inline comments, and aliases.
- **Structural Merging**: Deterministic auto-merging of independently added functions, classes, and methods.
- **Go & Rust Support**: Added deterministic import and structural-declaration merging for Go and Rust.

#### YAML 3-Way Auto-Resolver

- **YAML Merging**: Deterministic 3-way conflict resolution for YAML files (Kubernetes manifests, Docker Compose, CI/CD workflows) with indentation- and comment-preserving merges.

#### Lockfile Semantic Auto-Resolver

- **npm Lockfile Merging**: Deterministic 3-way semantic merging for `package-lock.json`, resolving non-conflicting additions/upgrades and flagging real breaking conflicts for review.

#### Licensing & Trial Architecture

- **14-Day Pro Trial**: Automatic trial activation with offline-first verification.
- **Fail-Open Design**: The extension never blocks or stalls on license checks — it falls back gracefully if network verification is unavailable.

#### Production Build

- Bundled and minified the extension for a smaller, faster install.

### Removed

- Cleaned up obsolete prototype UI code no longer used by the production merge editor.

## [0.1.0] - 2026-09-07

### Added

#### Core Merge Experience & Visual UI

- **3-Way Merge Editor**: A native 3-column merge view (Ours | Result | Theirs) with a collapsible base/ancestor view and synchronized scrolling.
- **Smooth Large-File Performance**: Virtualized rendering and hardware-accelerated canvas connectors for smooth performance on large files and high-DPI/high-refresh displays.
- **Reliable Undo/Redo**: Robust action sequencing so rapid hunk decisions are never lost or applied out of order, with full undo/redo support.

#### Deterministic Syntax Auto-Resolution (Zero AI)

- **Rule-Based Auto-Resolution**: Safe, deterministic auto-resolution of non-conflicting changes — no LLM involved.
- **Import Normalization**: 3-way-aware import merging for TypeScript/JavaScript and Python that respects intentional deletions.
- **JSON Merging**: Deep recursive 3-way merging for JSON configuration files.
- **Git LFS Awareness**: Automatically skips structural parsing on Git LFS pointer files.

#### Git Plumbing & Submodule Isolation

- **Robust Conflict Extraction**: Reliable extraction of base/ours/theirs content via the Git API, with plumbing-command fallback.
- **Submodule & Multi-Root Support**: Correctly isolates conflict state across multi-root workspaces and nested submodules.

#### Security & Privacy

- **Zero-Cloud Architecture**: Fully local execution — no telemetry, no analytics, and a strict content-security policy blocking external network calls from the editor UI.
- **Offline Trial Licensing**: A 14-day Pro trial that works fully offline.

#### Community & Ecosystem

- **Public Companion Tracker**: A public [issue tracker](https://github.com/stillsystems/treeresolve-community) for bug reports, feature requests, and discussion.
- **Public Roadmap**: Community voting on upcoming language support (Go, Rust, YAML, Java/C#).

### Fixed

- **Save Safety**: Fixed an issue where unreviewed hunks could be lost or partially resolved files could be staged prematurely.
- **Deletion Handling**: Fixed import merging to correctly honor intentional deletions instead of resurrecting removed imports.
- **Nested Conflict Parsing**: Fixed parsing of nested/recursive Git conflict markers.
- **Auto-Resolve Safety**: Fixed a case where the import auto-resolve command could truncate unrelated, non-import conflicts.

### Changed

- **Accurate Documentation**: Corrected documentation to match actual behavior.
- **Repository Cleanup**: General housekeeping of unused files and build artifacts.
