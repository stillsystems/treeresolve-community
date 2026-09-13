# Changelog

All notable changes to the "TreeResolve" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.4] - 2026-09-11

### Security & Hardening

- **Compiled WebAssembly SRI Cryptographic Byte Assertions**:
  - Validated that `TreeSitterService.getLanguage` computes SHA-256 digests over `Uint8Array` bytes and checks against `EXPECTED_WASM_HASHES` prior to calling `Language.load`, aborting immediately upon binary tampering.
  - Verified that runtime loader assert functions are compiled directly into the production distribution bundle (`dist/src/extension.js`).
- **Release Hygiene & Clean Semantic Release Cut**:
  - Cut clean release `v0.4.4`, stopping metadata-only point release churn and packaging fresh verified binaries.
- **Unified Workstation Installation Salting Store**:
  - Unified the installation salt backing store across the VS Code Extension Host and the standalone CLI: canonical workstation secret is persisted to `~/.treeresolve/installation_salt` with strict `0o600` file permissions and synchronized with VS Code `context.secrets`.
  - Eliminates split-identity drift between GUI merge sessions and terminal/git-hook CLI merges, preventing duplicate seat consumption and premature quota lockout.
- **Fail-Fast Runtime Engine Guard for Standalone CLI**:
  - Enforced `"engines": { "vscode": "^1.85.0", "node": ">=20.0.0" }` in `package.json`.
  - Added an upfront, fail-fast Node.js runtime version check at CLI process entry in `src/cli/cli.ts` (`nodeMajorVersion < 20`), outputting an explicit error message and exiting before module loading in older CI runner environments.
- **Manifest Hygiene & Keyword Standardization**:
  - Standardized marketplace metadata categories and trimmed keyword tags in `package.json`.
- **Adversarial VSIX Review & Compliance Remediation**:
  - **Eliminated Bundled Undici Network Stack**: Dropped dynamic `require('undici')` from `TelemetryService.ts`, switching completely to Node 20 runtime native WHATWG `fetch` and adding `--external:undici` to esbuild scripts. Shrunk `dist/src/extension.js` from 746.7KB to 227.9KB (-69.5%) and purged all undeclared networking dependencies.
  - **Bundled Third-Party Open Source Notices (`THIRD_PARTY_LICENSES.md`)**: Consolidated complete MIT license attributions for `jose`, `@vscode/tree-sitter-wasm`, and the 7 bundled Tree-sitter WebAssembly language grammars, ensuring full redistribution license compliance across marketplaces.
  - **Reconciled Licensing Endpoints**: Unified the single source of truth for the default licensing endpoint to `https://licensing.treeresolve.still.systems` across `FloatingLeaseClient.ts`, `TelemetryService.ts`, and `package.json`, documenting the secondary Cloudflare Workers fallback (`https://treeresolve-licensing.still-systems.workers.dev`).
  - **Factual Privacy & Non-Identifying Fingerprinting Copy**: Replaced unsubstantiated parenthetical compliance labels ("GDPR & SOC 2 Compliant") with precise technical disclosures ("Zero PII / Privacy-Preserving") explaining that only an anonymous local SHA-256 machine hash is transmitted for reverse trial ticketing.
  - **Dynamic Ephemeral Salt Fallback**: Removed the static fallback constant in `FloatingLeaseClient.getInstallationSalt()`, dynamically generating and caching an ephemeral in-memory cryptographic hash on degenerate sandbox total fallback to prevent shared static seeds.
  - **Optimized Marketplace Asset Footprint**: Resized `images/icon.png` to high-quality bicubic 256×256 retina PNG, reducing icon size from 828KB to 70.5KB (-91.5%).
  - **VSIX Archive Payload Trimming**: Excluded standalone CLI binary (`bin/**`, 1.4MB) from the `.vsix` distribution package via `.vscodeignore` and `scripts/package.js`, reducing the packaged extension from 2.0MB to 789KB (-60.8%).
  - **Batch Auto-Resolve Observability**: Added an explicit user notification in `batchOutputChannel` when Git conflict indexing is unavailable and scanning falls back to a 200-candidate-file bounded workspace search.
  - **Documented Custom Editor Scoping Tradeoff**: Documented the architectural rationale in `ARCHITECTURE.md` and `README.md` for registering `customEditors` against `*` with `priority: "option"` to support conflict resolution across arbitrary textual file types without usurping default language editors.

## [0.4.3] - 2026-09-10

### Security & Hardening

- **Asynchronous IPC Message Serialization & Atomic Save Architecture**:
  - Decoupled hunk resolution decisions from live document buffer modifications: accumulated user selections in an in-memory resolution accumulator without intermediate buffer edits.
  - Piped all incoming webview IPC messages (`RESOLVE_HUNK`, `COMMIT_MERGE`) through `coordinator.runInMutex` FIFO promise chains in `MergeEditorProvider`, preventing race conditions between rapid keyboard-driven resolutions (`Alt+1`, `Alt+3`, `Alt+B`) and commit triggers (`Ctrl+Enter`).
  - Hardened `DocumentSyncCoordinator.commitAndSave` to execute exactly one single transactional `vscode.WorkspaceEdit`, verifying conflict marker integrity via `ConflictMarkerParser` and re-syncing baseline document versions if intermediate version bumps occurred, ensuring zero dropped user decisions.
- **Tree-sitter WASM 30ms Execution Budget & 5,000-Char Line-Length Heuristic**:
  - Enforced Tree-sitter parser timeout ceiling to 30ms (`parser.setTimeoutMicros(30000)`) on all parser instances.
  - Implemented an O(N) line-length safety heuristic (`MAX_LINE_LENGTH = 5000`) that immediately bypasses AST parsing for minified bundles, lockfiles, or single-line generated files to prevent Extension Host thread lockups.
- **WebAssembly Cryptographic SHA-256 Binary Integrity Verification**:
  - Enforced cryptographic SHA-256 checksum validation against a constant lookup table (`EXPECTED_WASM_HASHES`) for all 7 shipped WebAssembly grammars and the runtime module before passing bytes to `WebAssembly.instantiate` / `Language.load`.
  - Blocks any tampered, altered, or unsigned WebAssembly bytecode from executing in the VS Code Extension Host context.
- **Default Salted HMAC-SHA256 Domain Identifiers**:
  - Updated `DomainLeaseCoordinator.computeDomainId` to strictly default to salted HMAC-SHA256 using the local installation-unique salt, preventing rainbow-table repository identification across external networks.
  - Integrated `FloatingLeaseClient.initInstallationSalt` with VS Code `context.secrets` storage.
- **Canvas Diff Ribbon Layout Batching & Frame Budget Preservation**:
  - Decoupled webview ribbon canvas rendering into two distinct phases: Phase 1 batches all DOM layout and bounding box measurements upfront, and Phase 2 executes canvas bezier drawing without interleaved DOM reads, completely eliminating layout thrashing.
  - Throttled ribbon canvas updates using `requestAnimationFrame` with viewport buffer culling (+/- 100px), eliminating UI frame drops and input stutter on conflicts with 150+ hunks.
- **Packaging Manifest Tightening & Category Hygiene**:
  - Tightened `package.json` categories to strictly `["SCM Providers", "Programming Languages"]`, removing redundant vestigial categories.

## [0.4.2] - 2026-09-10

### Security & Hardening

- **Linear FIFO Mutex & Atomic Document Snapshot Replacement**:
  - Implemented an internal execution mutex queue (`runInMutex`) in `DocumentSyncCoordinator` to serialize all asynchronous document mutations, eliminating race conditions and interleaved `WorkspaceEdit` applications during rapid keyboard-driven hunk cycling.
  - Replaced incremental partial range replacements with atomic full-document snapshot edits (`constructResolvedDocumentText`), guaranteeing zero offset drift or line truncation under rapid sequential operations.
- **Tree-sitter WASM Hard Execution Timeouts & Recursion Tripwires**:
  - Configured hard execution timeouts (`parser.setTimeoutMicros(50000)`) on all Tree-sitter parsers, preventing pathological recursive ASTs from hanging the extension host thread.
  - Added an oversized buffer safety tripwire (`MAX_PARSE_TEXT_BYTES = 2MB`) and a maximum AST recursion depth cap (`MAX_AST_RECURSION_DEPTH = 128`) with automated parser reset on timeout.
- **Production Distribution Manifest Sanitization**:
  - Enhanced `scripts/package.js` to automatically sanitize `extension/package.json` during `.vsix` packaging, stripping all internal scripts, development dependencies, and dev worker references from release packages while cleanly restoring the developer workspace.
  - Configured `.vscodeignore` to exclude development backup artifacts (`*.bak`, `.*.bak`).
  - Switched default `treeresolve.licensingEndpoint` configuration to production gateway `https://licensing.treeresolve.still.systems`.
- **Privacy-Preserving Installation Salt & HMAC Domain Hashing**:
  - Implemented a persistent, workstation-private 32-byte installation salt (`FloatingLeaseClient.getInstallationSalt()`) stored strictly locally (`~/.treeresolve/installation_salt` or VS Code global state).
  - Outbound trial ticket requests now transmit an HMAC-SHA256 salted domain identifier, completely preventing egress proxies and TLS-inspecting networks from identifying corporate internal repository URLs or paths via rainbow tables.
- **Progressive Chunked Webview Rendering & Frame Budget Preservation**:
  - Refactored `renderLines` in the webview to render initial viewports immediately (250 lines) and stream remaining code rows in 500-line microtask chunks scheduled with `requestAnimationFrame`, eliminating UI stutter and frame freezes on diffs exceeding 100 hunks or 15,000 lines.

- **Hunk Bound Desynchronization & Truncation Elimination**:
  - Replaced sequential index sweeping (`a++`) in `DocumentSyncCoordinator.applyToDocument` with explicit hunk ID bound tracking and tracked character ranges, preventing buffer truncation and marker offset drift when hunks contain nested conflict markers or comment delimiters.
- **Tree-sitter WASM Linear Memory Leak Deallocation**:
  - Added deterministic cleanup hooks (`tree.delete()`) across `TreeSitterService.withTree`, `AstImportNormalizer`, and `AstDeclarationMerger`, eliminating Emscripten linear memory accumulation and C-heap saturation across large batch operations.
- **Standalone CLI Archive Permissions & Binary Packaging**:
  - Implemented `scripts/package.js` post-packager to enforce POSIX executable permissions (`0o755`) and hashbangs (`#!/usr/bin/env node`) on `bin/treeresolve.js` within distributed `.vsix` archives.
- **Webview Canvas Zero-Dimension Resize Guard**:
  - Decoupled ribbon canvas buffer allocation from the scroll path and added zero-dimension guards (`width <= 0 || height <= 0`), eliminating synchronous layout thrashing and cubic Bézier evaluation errors on collapsed panes.
- **Monotonic Clock-Rollback Lockout Guard**:
  - Enhanced anti-tamper watermark tracking (`effectiveLastSeen > now`) across `DomainLeaseCoordinator` and `LicenseManager`, immediately invalidating trial credentials and enforcing fallback to `COMMUNITY` tier if system clocks are rolled backward.
- **Air-Gapped & Corporate Forward Proxy Documentation**:
  - Documented corporate proxy environments (`HTTPS_PROXY`, `NODE_EXTRA_CA_CERTS`), internal mirror endpoints (`treeresolve.licensingEndpoint`), and air-gapped offline key activation via `treeresolve.installLicense`.
- **Monorepo Resource Exhaustion & Event Loop Starvation Fix**:
  - Replaced unbounded workspace file scans (`workspace.findFiles('**/*')`) with targeted Git plumbing queries (`git diff --name-only --diff-filter=U`) via `GitPlumbingClient.getConflictedFiles()`, with bounded fallback for non-git workspaces.
  - Introduced explicit event loop yielding (`await new Promise(r => setTimeout(r, 0))`) between files in batch processing to prevent UI stutter and thread starvation on large repositories.
- **Document Version & Race Condition Safeguards**:
  - Added document version tracking (`initialVersion = doc.version`) to `DocumentSyncCoordinator` and command handlers.
  - Aborts `applyToDocument` transactions if the document version advanced concurrently due to user typing, external formatters, or Git checkout operations during AST analysis.
- **In-Memory License Cache Expiration**:
  - Added strict 5-minute TTL eviction to `domainLeaseCache` during batch operations, preventing perpetual license bypass from stale in-memory state.
- **Strict Pre-Stage Conflict Marker Validation**:
  - Enforced zero-tolerance conflict marker validation (`<<<<<<<`, `=======`, `>>>>>>>`) across `DocumentSyncCoordinator.commitAndSave`, `GitPlumbingClient.stageFile`, and CLI batch resolve before issuing any `git add` command, preventing incomplete merges from polluting the Git index.
- **Dynamic White-Label Checkout Routing**:
  - Replaced hardcoded Stripe payment URLs in the extension binary with dynamic routing through `FloatingLeaseClient.getCheckoutUrl()` (`${licensingEndpoint}/checkout`).
  - Added HTTP 302 dynamic checkout redirect route in the licensing service.
- **Privacy Preservation & PII Elimination**:
  - Removed local hostnames and usernames from device fingerprint generation.
  - Derived anonymous machine fingerprints from `vscode.env.machineId` in VS Code and a persistent anonymous UUID (`~/.treeresolve/machine_id`) in standalone CLI.
- **Strict Binary & Git LFS Pre-Flight Guard**:
  - Implemented `GitPlumbingClient.isBinaryOrLfs` to detect and safely bypass files exceeding 10MB, containing null bytes (`\0`), or matching Git LFS pointer stubs in both batch auto-resolve and the interactive merge editor.
- **Restricted Mode Workspace Trust Support**:
  - Updated `capabilities.untrustedWorkspaces` to `"limited"`, permitting read-only 3-way AST diffing while strictly blocking direct disk write-backs and Git staging until trust is granted.

## [0.4.1] - 2026-09-10

### Added

- **Headless Cryptographic Licensing & Paywall Enforcement**:
  - Gated AST syntax auto-merge and whole-file lockfile/YAML auto-resolution in `bin/treeresolve.js` behind verified Pro licenses across `auto`, `merge`, and `driver` commands.
  - Implemented `treeresolve status [dir]` to inspect repository root, remote URL, domain ID, and active entitlement tier.
  - Implemented `treeresolve license <token>` to install and validate commercial license tokens locally into `~/.treeresolve/license.json` with secure file permissions (`0o600`).
  - Added primary CI/CD credential resolution via the `TREERESOLVE_LICENSE` environment variable.
  - Added anti-tamper monotonic clock-rollback guard in headless mode (`~/.treeresolve/state.json`).
- **Unified Submodule-Aware Repository Identity Resolution**:
  - Replaced ad-hoc git commands in CLI with `GitPlumbingClient.resolveRepository`, establishing parity between VS Code extension host and headless CLI.
  - Enhanced `GitPlumbingClient` CLI fallback with first-available remote discovery (`git remote` -> `git remote get-url`) for repos without `origin` (e.g. `upstream` or custom forks).
  - Enhanced submodule detection via `git rev-parse --show-superproject-working-tree` and `git rev-parse --git-dir` checking for `/modules/`.
  - Normalized `'local'` fallback to empty remote URL in `DomainLeaseCoordinator.normalizeRemoteUrl` so local offline repositories hash normalized root paths without colliding on a shared string.
- **Stripe Checkout Webhook & Enterprise Inquiry Gateways**:
  - Added automated commercial license issuance via Stripe HMAC-SHA256 signed webhooks.
  - Added enterprise fleet seat and VPC procurement intake route.

- **Standalone Bundled CLI in VSIX Packaging**:
  - Bundled `bin/treeresolve.js` with esbuild targeting Node 20 as a standalone executable containing all runtime dependencies (`jose`, Tree-sitter WASM loader, AST normalizers).
  - Configured `.vscodeignore` (`!bin/treeresolve.js`) to guarantee the CLI artifact is included in all packaged `.vsix` releases.
- **Automated Stripe Pre-Publish Guard**:
  - Implemented `scripts/check-no-stripe-test-links.js` wired into `npm run prepublish` and `npm run vscode:prepublish` to prevent accidental publication of Stripe sandbox test links in production releases.
- **Batch Auto-Resolve Observability & Graceful Cancellation**:
  - Added cancellation support via `vscode.CancellationToken` in `treeresolve.autoResolveBatch`.
  - Added build, binary, and packaging exclusion filters (`dist`, `out`, `.git`, `.wrangler`, `.vsix`, `.wasm`, `.zip`) to batch file discovery.
  - Added dedicated `TreeResolve Batch` OutputChannel streaming live file-by-file resolution logs and diagnostics.
- **Security & Integrity Hardening**:
  - Pinned `"scope": "machine"` on `treeresolve.licensingEndpoint` in `package.json` to prevent malicious repositories from repointing licensing and telemetry gateways.
  - Declared `capabilities.untrustedWorkspaces.supported = false` to protect against unauthorized parser and Git execution in untrusted folders.
  - Sanitized AST error telemetry in `TelemetryService` to send structured `errorCode` categories (`ERR_WASM_LOAD_FAILED`, `ERR_PARSER_INIT_FAILED`, `ERR_PARSE_SYNTAX_ERROR`, `ERR_ANCHOR_EXTRACTION_FAILED`), completely omitting raw error text, file paths, or syntax snippets.
  - Eliminated `innerHTML` assignments in `MergeEditorProvider`, switching line and intra-line token diff rendering to safe DOM element construction (`createElement`/`textContent`).
  - Hardened Git CLI executions in `GitPlumbingClient` by inserting `--` path separators.

### Changed

- **Privacy & Fingerprinting Disclosure**: Explicitly documented reverse trial and floating lease machine fingerprinting (`platform:arch:hostname:username` SHA-256) in `README.md`, `ENTERPRISE.md`, and configuration descriptions.
- **Production Payment Links**: Swapped all Stripe test-mode links for live production payment links across the extension manifest, editor views, README, and documentation portal.
- **Marketplace Badges Alignment**: Replaced deprecated Shields.io marketplace badge with active, branded VS Code Marketplace and Open VSX dynamic badges in extension documentation.

## [0.4.0] - 2026-09-08

### Added

- **Automated Release CI/CD Pipeline**: Tag-driven GitHub Actions workflow (`.github/workflows/release.yml`) providing automated multi-channel publishing to Open VSX, VS Code Marketplace, and GitHub Releases.
- **Native Git Merge Driver**: Implemented Git `%O %A %B %L %P` merge driver protocol in CLI companion (`treeresolve driver`) for preemptive AST-level merge conflict resolution and one-command configuration (`treeresolve setup-driver`).
- **Yarn & PNPM Lockfile Resolvers**: Deterministic 3-way AST reconciliation for `yarn.lock` (v1 and Berry YAML) and `pnpm-lock.yaml` (v6 and v9 schemas) with deletion preservation.
- **Interactive 3-Way Merge Editor Ergonomics**: Keyboard navigation (`Alt+↓/↑`, `Alt+1/2/3/4/B/Shift+B`, `Ctrl+Enter`), focused hunk highlight ring with auto-scrolling, real-time completion progress bar, and interactive shortcut modal.

## [0.3.1] - 2026-09-08

### Changed

- **Open VSX Registry Publication**: Officially published TreeResolve to [Open VSX Registry](https://open-vsx.org/extension/stillsystems/treeresolve) under verified namespace `stillsystems`.
- **Publisher Identifier Alignment**: Standardized extension publisher identifier to `stillsystems.treeresolve` across extension manifest, documentation, and enterprise MDM deployment scripts.

## [0.3.0] - 2026-09-08

### Added

#### Intra-Line Token Micro-Diffing

- **Visual Token Highlighting**: Integrated LCS-based word and token micro-diffing directly into the 3-way merge canvas, visually distinguishing deleted (`.token-diff-del`) and added (`.token-diff-add`) segments within conflicting line pairs.

#### Java & C# Deterministic Normalizers

- **Java 3-Way Import Resolver**: Implemented `JavaCSharpNormalizer.resolveJavaImports` providing deterministic 3-way resolution for `import static`, `java.*`/`javax.*` standard library, and third-party packages with deletion preservation.
- **C# 3-Way Using Directive Resolver**: Implemented `JavaCSharpNormalizer.resolveCSharpUsings` handling `global using`, `using static`, alias declarations, and namespace directives with deletion preservation.

#### Repository-Level Configuration (`.treeresolverc`)

- **Project Policy Engine**: Created `RepoConfigService` to discover `.treeresolverc`, `.treeresolverc.json`, and `treeresolve.json` in workspace roots with glob pattern rules for custom auto-merge and auto-staging per filetype.

#### Standalone Git Mergetool CLI Companion & Batch Resolver

- **Zero-Dependency CLI (`bin/treeresolve.js`)**: Shipped command-line interface executable via `npx treeresolve` supporting native terminal Git merge workflows.
- **Git Mergetool Backend**: Implemented `treeresolve merge <base> <local> <remote> <merged>` conforming to Git's 4-argument mergetool protocol with automatic language detection.
- **Automated Git Configuration**: Added `treeresolve setup-git` command to configure `git config --global merge.tool treeresolve` in one step.
- **Headless Batch Auto-Resolver**: Implemented `treeresolve auto [dir]` to scan unmerged Git conflicts, auto-resolve 100% deterministic syntax hunks, and stage clean files.

#### Workspace Batch Conflict Auto-Resolver

- **VS Code Batch Command**: Added `treeresolve.autoResolveBatch` with background progress notification, scanning the workspace to auto-resolve all deterministic syntax conflicts across multiple files in a single step.

#### Anonymous Merge Telemetry & Privacy Opt-Out

- **Acceptance Rate & Time Metrics**: Implemented `TelemetryService` to measure auto-merge acceptance rate (%) and session resolution duration (ms) to improve syntax normalizer heuristics.
- **Zero Source Code Transmission**: 100% anonymous metrics with zero collection of source code, AST tokens, file paths, repository URLs, branch names, or developer identities.
- **User Opt-Out Control**: Configurable via `"treeresolve.enableTelemetry": false` and automatically honors VS Code's global telemetry setting (`telemetry.telemetryLevel: "off"`).
- **Serverless Ingestion Endpoint**: Added edge-cached telemetry ingestion route in licensing service.

## [0.2.0] - 2026-09-08

### Added

#### Concrete Syntax Tree (CST) Engine (@vscode/tree-sitter-wasm)

- **Zero-Native Cross-Platform WASM Architecture**: Integrated Microsoft's official `@vscode/tree-sitter-wasm` build across TypeScript, TSX, JavaScript, Python, Go, and Rust with zero native compilation.
- **AST Multi-Line Import Reconciliation**: Upgraded import normalization to parse full concrete syntax trees with support for multi-line imports, inline comments, `import type`, and aliases with deletion preservation.
- **Disjoint Structural Declaration Merging**: Deterministic auto-merging of independent functions, classes, and methods added to the same scope across branches.
- **Whole-File AST Structural Anchors**: Replaced line regex with AST node extraction for functions, classes, interfaces, and methods.
- **Go & Rust AST Resolvers & Structural Mergers**: Implemented deterministic 3-way AST import reconciliation for Go (`import ( ... )` blocks) and Rust (`use` declaration trees), plus top-level and member-level structural declaration merging for Go structs/interfaces and Rust structs/enums.

#### YAML Indentation-Safe 3-Way Auto-Resolver

- **Deterministic YAML Mapping Merger**: Implemented `YamlAutoResolver` providing deterministic 3-way conflict resolution for YAML files (Kubernetes manifests, Docker Compose, CI/CD workflows) with strict block indentation, leading/inline comment preservation, and 3-way deletion tracking.

#### Lockfile Semantic Auto-Resolver (`package-lock.json`)

- **3-Way Semver Merge Engine**: Deterministic semantic auto-merging for npm lockfile conflicts (`package-lock.json` v2/v3).
- **Semver Range Comparison & Integrity Alignment**: Automatically resolves concurrent package additions and non-breaking version upgrades within the same major version while preserving exact `integrity` (sha512) and `resolved` package URLs.
- **Incompatible Major Version Collision Detection**: Automatically marks breaking major version divergences for human review.

#### Offline-First Licensing & Serverless Trial Architecture

- **Cloudflare Worker Licensing Service**: Self-contained serverless microservice issuing signed 14-day trial JWTs keyed to machine fingerprints in KV to eliminate infinite local trial resets.
- **30-Day Floating Leases**: Automatic background renewal of 30-day floating leases with zero-latency local offline verification.
- **Wildcard Hard-Caps & Revocation Manifests**: Enforced a strict 90-day maximum TTL on wildcard licenses (`domainId: '*'`) and integrated token revocation list checking (`jti`).
- **Fail-Open Offline Resilience**: Extension never stalls or blocks on network calls; seamlessly falls open to local cached leases or monotonic offline fallback.

#### Production Build & Minification

- **`esbuild` Single-Bundle Pipeline**: Bundled and minified `dist/src/extension.js` (167 KB) and configured `.vscodeignore` to exclude raw unminified modular files from the VSIX distribution.
- **WASM Asset Packaging**: Added `copy:wasm` build target packaging 7 pre-compiled grammar binaries into `dist/wasm/` for 100% offline out-of-the-box readiness.

### Removed

- **Obsolete `webview-ui` Prototype Scaffold**: Completely removed the abandoned `webview-ui/` directory and all orphaned 0-byte stub files (`ViewportGrid.ts`, `BezierMath.ts`, `myers_diff.wasm`, etc.) in favor of the production, CSP-secured inlined webview engine in `MergeEditorProvider.ts`. Cleaned up dead references from `tsconfig.json` and `.vscodeignore`.

## [0.1.0] - 2026-09-07

### Added

#### Core Merge Experience & Visual UI

- **3-Way Merge Custom Editor**: Native CustomTextEditor registered under `treeresolve.mergeEditor` featuring a 3-column conflict layout (Ours | Result | Theirs) with a collapsible Base Ancestor drawer and synchronized scrolling.
- **Dynamic Virtual Viewport & Canvas Ribbons**:
  - Viewport-scaled DOM row pooling powered by `ResizeObserver` for smooth performance on large files, multi-monitor setups, and high-DPI displays.
  - Interactive cubic Bézier connector ribbons rendered on HTML5 Canvas with 2,500 px/sec scroll velocity momentum fallbacks.
  - Hardware device pixel ratio (`window.devicePixelRatio`) buffer scaling with 2D transform matrix projection for sharp Bézier connectors on 4K, high-refresh (120Hz/144Hz), and Retina displays.
  - Asymmetric Myers diff alignment using nullable `SemanticAnchor` coordinates (`baseRange`, `oursRange`, `theirsRange`) to prevent ribbon drift on unilateral additions and deletions.
- **Monotonic Action State Machine**: Strict sequence counter (`actionSeq`) and UUIDv4 `actionNonce` tracking to discard out-of-order hunk toggles during rapid user interaction, backed by atomic `vscode.WorkspaceEdit` batching with native undo/redo (`Ctrl+Z` / `Cmd+Z`).

#### Deterministic Syntax Auto-Resolution (Zero AI)

- **Deterministic Syntax Normalization Engine**: Safe, rule-driven auto-resolution of non-colliding leaf changes with mathematical determinism and zero LLM dependencies.
  - **Git LFS Pointer Ingestion Guard**: Pre-flight pointer signature verification (`version https://git-lfs.github.com/spec/v1`) that bypasses structural parsing on LFS pointer metadata.
  - **True 3-Way Import Normalization**: ECMAScript/TypeScript and Python import normalizers computing 3-way set differences against Base to preserve intentional deletions and flag colliding modifications.
  - **Recursive JSON 3-Way Merge**: Deep recursive object merger for JSON configurations handling non-colliding keys and flagging conflicting deletions or changes.

#### Git Plumbing & Submodule Isolation

- **Submodule-Aware Repository Traversal**: Robust extraction of stage `:1` (ancestor/base), `:2` (ours), and `:3` (theirs) via `vscode.git` API with fallback to `git cat-file` plumbing and inline `zdiff3` conflict marker extraction.
- **Partial `zdiff3` Ancestor Degradation**: Hunk-local ancestor evaluation that degrades individual hunks lacking base to 2-way visual mode while maintaining 3-way layout for valid siblings, with line-synchronized base stream padding to prevent coordinate drift.
- **Domain Lease Scoping**: Repository-boundary lease hashing based on `GitRootPath + RemoteOriginUrl` ensuring strict isolation across multi-root workspaces and nested Git submodules.

#### Security, Privacy & Enterprise Licensing

- **Zero-Cloud Architecture & Strict Sandbox**: Complete local execution guarantee with zero telemetry, zero analytics, and strict CSP sandbox (`default-src 'none'`, `script-src 'nonce-...'`) forbidding external network calls.
- **Offline Reverse Trial Licensing & Anti-Tamper Clock Guard**: Air-gapped Ed25519 JWT verification via `jose` providing a 14-day Pro Reverse Trial with monotonic timestamp tracking (`treeresolve.lastSeenTimestamp`) to prevent system clock rollback exploitation.

#### Community & Ecosystem

- **Public Companion Tracker**: Integration with [stillsystems/treeresolve-community](https://github.com/stillsystems/treeresolve-community) featuring structured templates for bug reporting, feature proposals, and community discussions while maintaining a private source repository.
- **Active Language Roadmap**: Public roadmap and community voting for upcoming syntax normalizers including Go, Rust, YAML, and Java/C#.

### Fixed

- **Commit & Save Data Loss Protection**: Rewrote `DocumentSyncCoordinator.constructResolvedDocumentText()` to strictly preserve raw conflict markers and incoming changes (`Theirs`) for any unreviewed or partially resolved hunk; prevented accidental staging of unresolved files to Git by respecting `treeresolve.stageOnSave` only when all hunks are resolved.
- **True 3-Way Merge Deletion Handling**: Upgraded `ImportNormalizer` for TypeScript/JavaScript, Python, and JSON to perform true 3-way set difference against Base, honoring intentional deletions and flagging delete-modify conflicts instead of resurrecting deleted symbols via 2-way union.
- **Recursive Conflict Marker Parsing**: Expanded conflict marker regexes across `ConflictMarkerParser` and `DocumentSyncCoordinator` to support recursive merge runs (`<{7,}`, `|{7,}`, `={7,}\s*$`, `>{7,}`).
- **Auto-Resolve Command Safety**: Corrected `treeresolve.autoResolveImports` command to use `DocumentSyncCoordinator`, preventing accidental truncation of non-import conflicts.

### Changed

- **Accurate Product Documentation**: Removed unsubstantiated claims regarding Tree-sitter WASM grammars, off-thread workers, and asset manifests, aligning documentation strictly with the actual deterministic syntax normalization implementation.
- **Repository Hygiene**: Completely purged unreferenced 0-byte template files, eliminated unreferenced workers, and excluded all orphaned `webview-ui` assets from the VSIX distribution bundle.
- **Clean Build Pipeline**: Added automated pre-compilation directory cleanup to ensure stale artifacts can never linger in `dist/`.
