# Changelog

All notable changes to the "TreeResolve" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Serverless Ingestion Endpoint**: Added `POST /api/v1/telemetry` route in Cloudflare Licensing Worker for edge-cached metrics ingestion.

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

- **Cloudflare Worker Licensing Service (`services/licensing-worker/`)**: Self-contained serverless microservice issuing signed 14-day trial JWTs (`/api/v1/trial`) keyed to machine fingerprints in KV to eliminate infinite local trial resets.
- **30-Day Floating Leases**: Automatic background renewal of 30-day floating leases (`/api/v1/lease/renew`) with zero-latency local offline verification.
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
