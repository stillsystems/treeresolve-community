# Architecture: TreeResolve (v0.4.5 Enterprise Production Specification)

TreeResolve is an offline-first, deterministic 3-way merge conflict resolution engine for VS Code. It replaces raw line-based conflict markers with an off-thread, AST-driven auto-resolution pipeline and a virtualized, hardware-accelerated visual merge viewport.

---

## 1. System Topology & Off-Thread Boundaries

TreeResolve enforces process and thread boundaries across three execution layers: the VS Code Extension Host Main Thread, an Off-Thread AST Worker Pool, and a Sandboxed Webview Viewport.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host (Node.js)                    │
│                                                                        │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │   Git Plumbing Client   │          │   Domain Lease Coordinator  │  │
│  │ (vscode.git API Primary)│          │ (Git-Root Scoped Lease Key) │  │
│  └────────────┬────────────┘          └──────────────┬──────────────┘  │
│               │                                      │                 │
│               ▼                                      ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │          Off-Thread Extension Host AST Worker Pool               │  │
│  │   - Dynamic LOC-Scaled Watchdog (Base 50ms + 10ms/1k LOC)        │  │
│  │   - Context-Aware Synthetic Scaffolding (Member vs Top-Level)    │  │
│  │   - 2D Coordinate Shifting (Byte Offset + Line/Row Decrement)    │  │
│  │   - Asymmetric Anchor Exporter (Nullable Structural Anchors)     │  │
│  │   - Monotonic Action Sequencer (seq + Nonce Tracking)            │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ Zero-Copy Transferable Buffers   │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Webview Viewport Sandbox                         │
│                                                                        │
│  ┌────────────────────────┐             ┌───────────────────────────┐  │
│  │  Web Worker (Wasm Diff)│             │ Dynamic Virtual Window    │  │
│  │  - Asymmetric Anchors  ├────────────▶│ - Scaled DOM Pool (Height)│  │
│  │  - SRI Manifest Hash   │             │ - HTML5 Canvas Ribbons    │  │
│  │    Asserted            │             │   (Sub-sampled Bezier)    │  │
│  └────────────────────────┘             └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Operational Tiers & Repository Domain Scoping

Entitlement capabilities and syntactic degradation are isolated per **Repository Domain** and per **Scope Unit**.

| Capability Tier | Scope & Activation Rules | UI Indicator | Resolution Semantics |
| :--- | :--- | :--- | :--- |
| **Tier 1: Deterministic Syntax Auto-Merge** | Active Pro/Trial lease locked to `DomainID`; ancestor present (`:1` stage or `\|\|\|\|\|\|\|` block); verified pure grammar queries; **Zero syntax errors inside Scope Unit**. | Blue ribbon badge: `Deterministic Syntax Merge` | Declarative LSCR policies (`SetUnion`, `KeyDeduplicatedMap`) auto-resolve safe leaf additions off-thread before render. |
| **Tier 2: Visual 3-Way Merge** | Community Tier; un-registered language; or syntax error inside the local Scope Unit. Valid ancestor present. | Gray ribbon badge: `Manual 3-Way Diff` | Auto-resolution bypassed for that unit. Left (Ours), Center (Result), and Right (Theirs) render with manual 1-click accept controls. Clean sibling units retain Tier 1. |
| **Tier 3: Degraded 2-Way View** | Missing Base ancestor (`:1` stage unreadable AND file marker lacks `\|\|\|\|\|\|\|` block). | Amber warning banner: `Degraded 2-Way Mode: Ancestor Missing` | Result pane locked. Ours and Theirs diffed directly. AST auto-merging disabled across this specific hunk. |

### 2.1. Environment-Safe Repository Root Resolution

To ensure reliable operation across Remote SSH, WSL, Dev Containers, and virtual environments (`vscode.dev`), Git repository roots are resolved using a two-tier discovery strategy:

1. **Primary (`vscode.git` API)**: Inspect active VS Code Git models via `vscode.extensions.getExtension('vscode.git')?.exports.getAPI(1)`. The Extension Host identifies the repository owning the document's `Uri` directly through `gitAPI.getRepository(documentUri)`. This guarantees compatibility with virtual and remote workspaces without spawning external processes.
2. **Plumbing Fallback (Local CLI)**: If the built-in Git extension is uninitialized or disabled, fall back to executing `child_process.execFile('git', ['rev-parse', '--show-toplevel'], { cwd: path.dirname(documentUri.fsPath) })`.
3. **Submodule Isolation & Unified Salted Domain ID**:
   Submodules establish their own independent `DomainID` based on their nested repository root. Derivation strictly defaults to salted HMAC-SHA256 using a unified workstation installation salt synchronized between VS Code `secretsStorage` and the canonical workstation store `~/.treeresolve/installation_salt` (`0o600`), ensuring that internal repository names cannot be derived via rainbow tables and that CLI and GUI runs produce identical domain hashes without split-identity seat exhaustion.

### 2.2. Git LFS Pointer Ingestion Pre-Flight

Files tracked via Git LFS resolve to pointer blobs (`version https://git-lfs.github.com/spec/v1\noid sha256:...\nsize ...`) during low-level Git index plumbing extraction (`git cat-file` or `git show :stage:path`). Feeding pointer text into language grammar parsers creates spurious syntax errors and drops merge sessions. TreeResolve enforces pre-flight verification:

* **Header Guard**: Buffers undergo early signature matching against `/^version https:\/\/git-lfs\.github\.com\/spec\/v1/`.
* **Safe Degradation**: If detected on any branch, AST parsing is bypassed, and hunks are routed to visual 2-way/3-way review mode without parser crash loops.

### 2.3. Partial zdiff3 Ancestor Degradation & Stream Alignment

Upstream merge operations and cherry-picks frequently produce non-uniform conflict markers where individual hunks contain `||||||| base` sections while adjacent hunks retain standard 2-way markers (`<<<<<<<` -> `=======` -> `>>>>>>>`). TreeResolve ensures robust handling:

* **Hunk-Local Degradation**: Hunks evaluate their base ancestor presence independently. Hunks with valid ancestors upgrade to Tier 2 (or Tier 1 AST auto-resolve), while base-lacking hunks degrade to Tier 3 visual diffing.
* **Line-Synchronized Stream Padding**: When a hunk lacks base ancestor content, the internal ancestor line stream is padded to match branch length, preventing line index drift and ensuring accurate coordinate projection across subsequent hunks.

### 2.4. Offline-First 30-Day Floating Lease & Trial Ticketing

To eliminate trial tampering while preserving the zero-latency, offline-first operating doctrine, TreeResolve decouples immediate file-open verification from network availability:

1. **Zero-Latency Local Verification**: The extension inspects cached secrets (`treeresolve.license.<domainId>` or `treeresolve.trial_ticket`) offline. Editor rendering is never blocked waiting on remote network calls.
2. **Server-Issued Trial Tickets**: On startup, the licensing client contacts the TreeResolve licensing service with an anonymous, privacy-preserving SHA-256 machine fingerprint (`platform:arch:machineId` derived from `vscode.env.machineId` or an anonymous persistent UUID in standalone CLI; zero PII). The licensing gateway returns a signed 14-day Ed25519 JWT ticket stored securely in local extension storage.
3. **Monotonic Offline Fallback**: If the network is unreachable during initial install, `DomainLeaseCoordinator` evaluates local `globalState` timestamps with monotonic clock-rollback detection as an air-gapped fallback.
4. **30-Day Floating Leases**: Commercial licenses automatically renew 30-day floating leases in the background when online.
5. **Wildcard Hard-Caps & Revocation Manifests**: Tokens with wildcard domain scope (`domainId: '*'`) are constrained to a strict 90-day maximum TTL. `LicenseManager` enforces token revocation via `jti` checks synchronized with edge-cached revocation manifests.
6. **Automated Seat Reclaiming**: The control plane provides automated seat reclaiming to reconcile seats during developer workstation migration, OS re-imaging, or salt regeneration without administrative overhead.

---

## 3. AST Semantic Engine & Context-Aware Scaffolding

> [!NOTE]
> **Implementation Status**: TreeResolve includes a Concrete Syntax Tree (CST) engine powered by `@vscode/tree-sitter-wasm` with language syntax normalizers and declaration mergers. It provides multi-language parsing across TypeScript, JavaScript, Python, Go, and Rust, with deterministic multi-line import reconciliation, deletion preservation, and disjoint structural declaration merging.

### 3.1. Context-Aware Synthetic Scaffolding

When global parsing times out or when re-evaluating isolated Lexical Scope Containers (LSC), wrapping fragments arbitrarily in synthetic outer classes produces severe parse regressions if the fragment represents a top-level construct (e.g., package declarations, import specifiers) or statement-level blocks inside a method. The AST engine applies **Three-Tier Context-Aware Scaffolding**:

* **Parent Node Classification**: Prior to wrapper injection, the AST engine identifies the enclosing syntax kind of the fragment's anchor point:
  * **Top-Level Form**: The snippet is parsed without outer class nesting, attaching only mandatory package headers where required by grammar specifications.
  * **Member-Level Form**: The snippet is evaluated within language-appropriate synthetic class or struct wrappers matching target language syntax conventions.
  * **Statement-Level Form**: When the hunk resides inside a method/function body, statements are wrapped within method-level synthetic function bodies to satisfy grammar constraints.
* **Two-Stage Coordinate Projection**: Because syntactic wrappers introduce prefix bytes and synthetic lines, parser ranges (`startByte`, `endByte`, `startPosition`, `endPosition`) are projected through a two-stage coordinate pipeline that accurately maps syntax tree nodes and point positions back to the original document coordinates with zero offset drift.

### 3.2. Dynamic Worker Watchdogs & Parser Execution Bounds

AST parsing tasks run inside dedicated Node `worker_threads` managed via a work-stealing queue with strict defensive boundaries:

* **Tree-sitter WASM 30ms Execution Ceiling**: All parser instances invoke `parser.setTimeoutMicros(30000)` before AST generation. If an ambiguous or deeply nested grammar triggers pathological backtracking, the WebAssembly execution halts cleanly at 30ms, preventing Extension Host event loop freezes.
* **Pathological Line-Length Pre-Flight Filter**: An $O(N)$ scanning heuristic inspects lines before AST parsing. If any line exceeds `MAX_LINE_LENGTH = 5000` (e.g. minified single-line bundles, embedded source maps, or pathological lockfile lines), AST parsing is immediately bypassed, safely routing the hunk to visual line diffing without blocking the Extension Host.
* **Dynamic Timeout Budget**: TreeResolve enforces an execution ceiling (up to 500ms scaled with file length) with strict WebAssembly execution limits.
* **Targeted Scope Fallback**: If full-buffer parsing exceeds the timeout budget, global parsing halts. The worker extracts the enclosing LSC lines surrounding the Git hunk, wraps them in context-aware scaffolding, and parses the isolated unit before dropping to Tier 2.

### 3.3. Lexical Continuation & Token-Depth Tracking (LCTD)

* **Bracket Depth Counter**: Indentation checks are bypassed whenever open bracket counters (`(`, `[`, `{`) are $> 0$.
* **Continuation Classifier**: Lines ending with an explicit backslash (`\`) or lines preceded by decorators (`@foo(...)`) bind atomically to the subsequent statement block.
* **Scope Boundary**: The enclosing Scope Unit in Python/YAML is the nearest ancestor line where `bracketDepth == 0`, `isContinuation == false`, and $\text{indent} \le \text{indent}_{conflict\_start}$.

### 3.4. Lockfile Semantic Auto-Resolution (`package-lock.json`)

Standard 3-way text and JSON diff engines fail on package lockfiles (`package-lock.json` v2/v3) because concurrent dependency bumps produce line conflicts across `packages` maps and root `dependencies`. TreeResolve provides dedicated lockfile resolution:

* **3-Way Semver Merge Engine**: Evaluates version constraints across `Base`, `Ours`, and `Theirs`. When two branches bump the same dependency within the same major version (e.g. `^1.2.0` vs `^1.5.0` from `^1.0.0`), the higher compatible semver constraint wins automatically.
* **Integrity & Descriptor Atomic Pairing**: In `node_modules/...` package descriptor objects, the winning version retains its matching `integrity` (sha512), `resolved` tarball URL, and nested dependency subgraph from the winning branch, preventing corrupted lockfile manifests.
* **Disjoint Package Set Union**: Disjoint package additions introduced on separate branches are merged into the `packages` map without collision.
* **Incompatible Major Divergence Guard**: When two branches update a package across different major versions (e.g., `2.0.0` vs `1.5.0`), the resolver safely flags a collision and routes the hunk for human review.

---

## 4. Concurrency, Monotonic Sequences, & Asymmetric Diff Anchoring

### 4.1. Monotonic Action Sequencing & In-Memory Resolution Accumulator

To eliminate buffer mutation races and out-of-order execution when a user rapidly toggles between resolution states (e.g., "Accept Ours" $\to$ "Accept Theirs" $\to$ "Accept Ours"), actions are handled through a decoupled in-memory resolution pipeline:

* **In-Memory Resolution Accumulation**: Incoming `RESOLVE_HUNK` events update an internal in-memory map of resolutions (`resolvedHunks`) in the merge session without modifying the live `vscode.TextDocument` buffer. Intermediate button clicks never trigger intermediate disk writes or partial `WorkspaceEdit` passes.
* **Sequenced Action Tuple**: Every `RESOLVE_HUNK` action emitted by the Webview contains an incrementing integer `actionSeq: number`, a correlation token `actionNonce: string` (UUIDv4), and the target `hunkId`.
* **State Machine Invariant**: The Extension Host tracks the latest applied sequence number:
  $$\text{highestAppliedSeq}[\text{hunkId}]$$
* **Stale Drop Rule**: If an incoming message has $\text{actionSeq} \le \text{highestAppliedSeq}[\text{hunkId}]$, the action is immediately discarded as stale. Only transactions where $\text{actionSeq} > \text{highestAppliedSeq}[\text{hunkId}]$ update the in-memory accumulator.
* **Explicit Acknowledgement**: The host emits `ACK_HUNK_RESOLUTION` referencing both `actionSeq` and `actionNonce`, allowing the Webview UI to settle optimistic button states deterministically.
* **Atomic Batch Commit Pipeline**: When the user triggers `COMMIT_MERGE` (or Save), the accumulated resolutions are piped into `coordinator.commitAndSave` inside a linear FIFO mutex (`runInMutex`). The coordinator:
  1. Re-parses the active document buffer to verify conflict marker structure integrity.
  2. Synthesizes a single consolidated resolved text buffer from all accumulated user decisions.
  3. Executes a single atomic `vscode.WorkspaceEdit` transaction replacing the full document range, preventing any intermediate state desynchronization or partial marker retention.

```text
Webview UI                                Extension Host                   In-Memory / Buffer
    │                                           │                                    │
    │── RESOLVE_HUNK (seq: 1, Nonce_A, Ours) ──▶│                                    │
    │── RESOLVE_HUNK (seq: 2, Nonce_B, Theirs) ─▶│ [seq: 2 arrives during flight]    │
    │                                           │ Updates in-memory hunk state       │
    │                                           │ Sets highestAppliedSeq = 2         │
    │◀── ACK_HUNK_RESOLUTION (seq: 2, Nonce_B) ─│ (UI settles toggle state)          │
    │                                           │                                    │
    │── COMMIT_MERGE (stageOnSave: true) ──────▶│ [Acquires runInMutex]              │
    │                                           │ Validates Conflict Markers         │
    │                                           │ Applies single atomic WorkspaceEdit▶ [Buffer Committed]
```

### 4.2. Asymmetric Semantic Anchoring

In real-world merges, declarations are frequently added on one branch or deleted on the other. Semantic diff anchors explicitly model asymmetric structural shifts by allowing ranges to be nullable:

```typescript
export interface SemanticAnchor {
  anchorId: string;
  nodeType: string;
  baseRange: [number, number] | null;   // null if added in ours/theirs
  oursRange: [number, number] | null;   // null if deleted in ours or added in theirs
  theirsRange: [number, number] | null; // null if deleted in theirs or added in ours
}
```

* **Web Worker Alignment**: The Webview Web Worker uses `SemanticAnchor` definitions to anchor Myers diff slices:
  * If `baseRange`, `oursRange`, and `theirsRange` are non-null, diffing runs symmetrically across all three panes.
  * If a range is null on one branch (an asymmetric insertion/deletion), the diff engine anchors the surviving branches together, suppressing misaligned visual ribbon drift across neighboring hunks.

### 4.3. Custom Editor Contribution & File Extension Matching

TreeResolve registers a custom text editor (`treeresolve.mergeEditor`) using `filenamePattern: "*"` and `priority: "option"`.

* **Content-Agnostic File Pattern**: In Git repositories, merge conflicts can emerge in any file type: source code, JSON manifests, YAML pipelines, Markdown documentation, Dockerfiles, and custom DSLs. Because the VS Code Custom Editor API relies solely on declarative glob patterns without dynamic buffer content inspection (it cannot check for `<<<<<<<` markers before opening), registering against `*` ensures TreeResolve is universally accessible.
* **Non-Intrusive Priority**: Setting `priority: "option"` ensures that TreeResolve is strictly an alternative presentation ("Open With...") and never overrides or interferes with the default editor for any file type unless explicitly invoked by the developer or via `treeresolve.openMergeEditor`.

---

## 5. Viewport Rendering & Dynamic Virtualization

### 5.1. Dynamic Viewport-Scaled DOM Pooling

To prevent visual clipping on rotated 4K monitors, ultrawide displays, and ultra-small editor font scales:

* **Fixed-Height Line Invariant**: TreeResolve enforces strict fixed-height line rows via CSS `white-space: pre` and disabled line-wrapping. Maintaining a constant `LineHeight_px` ensures that $O(1)$ translateY offset calculations remain perfectly aligned with gutter markers and canvas connectors without visual jitter.
* **Dynamic Row Sizing**: DOM rows are calculated dynamically from active element metrics:
  $$\text{PoolRows} = \left\lceil \frac{\text{ViewportHeight}_{\text{px}}}{\text{LineHeight}_{\text{px}}} \right\rceil + 50 \quad [\text{Overscan Pool}]$$
* **Resize Observer**: A native `ResizeObserver` on the Webview container re-evaluates `PoolRows` on window dimension shifts, allocating or recycling DOM row nodes dynamically.

### 5.2. Canvas Ribbon Rendering Engine & Two-Phase Layout

* Connectors between panes render via an HTML5 `<canvas>` using cubic Bézier paths.
* **Two-Phase Decoupled Layout Execution**: To completely eliminate layout thrashing during active scrolling and window resizing, ribbon rendering executes in two decoupled phases:
  * **Phase 1 (Batched Geometry Reads)**: The webview queries DOM metrics (`getBoundingClientRect`, scroll offsets, pane dimensions) in a single pass without performing any canvas mutations.
  * **Phase 2 (Pure Canvas Drawing)**: Canvas paths and Bézier connectors are evaluated and drawn onto the 2D context using the pre-computed coordinates, without triggering interleaved DOM layout recalculations.
* **RequestAnimationFrame & Viewport Culling**: Render loops are throttled via `requestAnimationFrame` with a +/- 100px vertical viewport buffer, culling off-screen connectors and preventing UI stutter on files containing 150+ hunks.
* **Hardware High-DPI Buffer Scaling**: Canvas buffer metrics are scaled by `window.devicePixelRatio` with a corresponding 2D transformation matrix (`ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`). This preserves physical pixel sharpness and prevents sub-pixel blurring or vertical ribbon drift across Retina, high-refresh (120Hz/144Hz), and 4K displays.
* **Momentum Fallback**: If scroll velocity exceeds 2,500 px/sec, connector rendering drops to bounding polygons ($O(1)$) to preserve steady 60fps frame rates.

---

## 6. Evolvable Protocol Contract

The visual merge editor communicates with the Extension Host over a strictly typed, versioned IPC protocol. The contract ensures backward and forward compatibility while preventing injection or malformed payload execution:

* **Session Initialization (`INIT_SESSION`)**: Dispatches file metadata, semantic anchor locations, and identified conflict hunks along with assigned capability tiers (`TIER_1_AST`, `TIER_2_VISUAL_3WAY`, `TIER_3_VISUAL_2WAY`).
* **Hunk Resolution (`RESOLVE_HUNK`)**: Transmits user decisions (`ACCEPT_OURS`, `ACCEPT_THEIRS`, `ACCEPT_BOTH`, `CUSTOM`) paired with monotonic sequence numbers (`actionSeq`) and UUID nonces (`actionNonce`).
* **Resolution Acknowledgement (`ACK_HUNK_RESOLUTION`)**: Acknowledges applied resolutions back to the webview UI to settle optimistic button states.
* **Merge Commit (`COMMIT_MERGE`)**: Triggers atomic save and staging operations across the document.
* **Capability Negotiation**: The envelope negotiates render mode (HTML5 Canvas Bézier ribbons vs. linear fallback), viewport sliding window support, and SRI verification.

---

## 7. Security Hardening & Asset Integrity

### 7.1. Subresource Integrity (SRI) & WebAssembly Binary Verification

* **Cryptographic WebAssembly Pre-Flight Assertions**: Prior to invoking `WebAssembly.instantiate` or `Language.load`, the runtime asserts that the SHA-256 checksum of the target `.wasm` file strictly matches the compiled immutable digest in `EXPECTED_WASM_HASHES`. If a digest mismatch is detected, execution immediately aborts with an integrity violation error, neutralizing any local binary tampering or supply-chain payload substitution.
* **Signed Assets Manifest**: A cryptographically signed `assets.manifest.json` generated during build indexes SHA-256 hashes of all bundled WASM binaries, worker scripts, and stylesheets.
* **Root Signature Verification**: On extension activation, the runtime asserts manifest integrity against a hardcoded Ed25519 root signature.

### 7.2. Webview Content Security Policy & Safe DOM Construction

TreeResolve enforces defense-in-depth within the 3-way merge canvas:

* **Strict Content Security Policy**:

  ```html
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'none'; 
                 img-src vscode-webview:; 
                 script-src 'nonce-{{nonce}}' 'sha256-{{scriptHash}}'; 
                 style-src 'nonce-{{nonce}}' 'sha256-{{styleHash}}'; 
                 worker-src vscode-webview:; 
                 connect-src 'none'; 
                 object-src 'none'; 
                 frame-ancestors 'none'; 
                 form-action 'none';">
  ```

* **Safe DOM Node Construction (Zero `innerHTML`)**: Syntax and token diff highlighting bypasses HTML-string generation and `innerHTML` assignments. Lines and token highlights are constructed purely via `document.createElement('span')` and `document.createTextNode()`, eliminating the possibility of stored DOM-XSS regardless of CSP header configuration.

### 7.3. Submodule Domain Licensing Lifecycle

* **Atomic Domain Lock**: Leases bind to `DomainID` (evaluated at submodule root). Active merge editor sessions maintain their granted capability tier until the buffer is committed or closed.
* **Air-Gapped Offline Validation**: Ed25519 token signatures verify entirely offline using the bundled public key, ensuring zero outbound code transmission.
* **Monotonic Anti-Tamper Clock Guard**: The trial coordinator tracks a monotonic `treeresolve.lastSeenTimestamp` in persistent `globalState`. If local system clock manipulation is detected (`Date.now() < lastSeen`), the engine clamps elapsed time to `lastSeen`, preventing negative durations or indefinite trial prolongation.

### 7.4. Configuration Scoping & Workspace Trust Enforcement

* **Machine-Scoped Gateway Configuration**: In `package.json`, `treeresolve.licensingEndpoint` specifies `"scope": "machine"`. This ensures that cloned or untrusted repositories cannot commit `.vscode/settings.json` overrides to silently redirect licensing, trial, or telemetry traffic to an attacker-controlled endpoint.
* **Workspace Trust Policy**: TreeResolve declares `capabilities.untrustedWorkspaces.supported = "limited"`. Read-only 3-way AST diffing is permitted in untrusted workspaces; disk write-backs and Git staging are blocked until trust is granted.
* **Git CLI Argument Injection Prevention**: Low-level plumbing invocations insert `--` argument separators before repository-derived file paths (e.g. `git add -- <file>`) to eliminate parameter injection vectors from malicious filenames.

---

## 8. Standalone Git Mergetool, Driver & Headless Licensing Architecture

TreeResolve provides a zero-dependency standalone CLI companion (`bin/treeresolve.js`) designed for terminal Git workflows, native Git merge driver operations, and headless CI/CD execution.

### 8.1. Build & Bundling Pipeline (`npm run bundle:cli`)

* **Self-Contained Executable & Fail-Fast Runtime Verification**: The standalone executable `bin/treeresolve.js` is bundled via esbuild targeting Node 20. It enforces a fail-fast runtime verification check (`nodeMajorVersion >= 20`) at process entry before any modules are loaded to guarantee availability of native WebCrypto (`crypto.subtle`) and stream primitives in bare container runners, and embeds `jose`, internal Tree-sitter WASM loaders, normalizers, and isolated mock shims, eliminating any runtime dependency on external files.
* **Standalone CLI Packaging**: Built as a standalone zero-dependency CLI executable via `npm run bundle:cli`. To keep the marketplace `.vsix` extension bundle lightweight, `bin/**` is excluded from the VSIX archive via `.vscodeignore` and sanitized in `tools/package.js`, allowing the CLI to be distributed independently (e.g. for headless CI/CD containers) without inflating the editor extension package. Packaging verification in `tools/package.js` inspects the generated archive to guarantee `THIRD_PARTY_LICENSES.md` is included and `bin/**` is excluded.
* **Pre-Publish Automated Guardrails**: Packaging scripts invoke `tools/check-no-stripe-test-links.js` during `npm run prepublishOnly` to ensure zero sandbox test URLs (`sandbox-buy.paddle.com`, `buy.stripe.com/test_`) reach release packages.

### 8.2. Git Mergetool Backend (`treeresolve merge`)

* **Argument Protocol**: Conforms to Git's 4-argument contract:

  ```text
  treeresolve merge <base> <local> <remote> <merged>
  ```

* **Language Identification**: Maps file extensions across all supported formats (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.rs`, `.yaml`, `.yml`, `.java`, `.cs`, `.json`).
* **Offline Execution**: Operates purely in Node.js runtime without VS Code dependencies, constructing a synthesized result buffer and resolving disjoint syntax hunks.
* **Exit Code Semantics**: Returns exit code `0` when all conflicts are resolved or preserved safely, and `1` upon syntax collisions requiring manual intervention.

### 8.3. Native Git Merge Driver (`treeresolve driver`)

* **Argument Protocol**: Implements Git's 5-parameter custom merge driver specification (`%O %A %B %L %P`):

  ```text
  treeresolve driver <base> <ours> <theirs> <markerLen> <relPath>
  ```

* **Execution Order**:
  1. Identical branches: exits `0` immediately.
  2. One-sided modifications: writes updated branch and exits `0`.
  3. Whole-file dedicated lockfile & YAML resolvers (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `*.yaml`): executed off-thread if licensed for Pro tier.
  4. 3-way syntax reconciliation: invokes `git merge-file -p` to synthesize conflict markers, then executes AST semantic analysis gated on Pro licensing.
* **Exit Code**: Returns `0` if 100% deterministically auto-resolved, or `1` with conflict markers written to `%A` for developer manual review.

### 8.4. Headless Batch Auto-Resolver (`treeresolve auto`)

* **Unmerged File Discovery**: Executes `git diff --name-only --diff-filter=U` to discover conflicted paths in the working tree.
* **Syntax Hunk Parsing**: Parses conflict markers and executes AST-level semantic analysis and auto-resolution.
* **Automated Staging**: Automatically runs `git add <file>` when 100% of conflict hunks in a file are resolved deterministically (respecting repository `.treeresolverc` policies).

### 8.5. VS Code Batch Auto-Resolve Ergonomics (`treeresolve.autoResolveBatch`)

* **Path & Binary Exclusion**: Filters out build artifacts, dependencies, and binary formats (`dist/**`, `out/**`, `node_modules/**`, `.git/**`, `*.wasm`, `*.vsix`, `*.png`, etc.).
* **CancellationToken Support**: Allows immediate graceful cancellation during long-running monorepo scans via VS Code's notification progress bar.
* **Dedicated OutputChannel**: Streams per-file scan status, conflict resolution counts, and diagnostic errors to a dedicated `TreeResolve Batch` OutputChannel.

### 8.6. Headless Cryptographic Licensing & Paywall Enforcement

Headless CLI execution strictly enforces TreeResolve Pro paywall boundaries without relying on VS Code extension host APIs:

* **Repository Domain Scoping**: Computes canonical `DomainID = SHA256(RootPath + "::" + RemoteUrl)` from `git rev-parse --show-toplevel` and `git config --get remote.origin.url`, with automatic backward compatibility for legacy `SHA256(RootPath + RemoteUrl)` tokens.
* **License Discovery Hierarchy**:
  1. `process.env.TREERESOLVE_LICENSE`: Primary credential vector for CI/CD runners and ephemeral build environments.
  2. `~/.treeresolve/license.json` (or `$TREERESOLVE_CONFIG_DIR/license.json`): Persistent local credential store managed via `treeresolve license <token>`.
* **Air-Gapped Offline Verification**: Candidate tokens are verified locally via `LicenseManager.verifyToken` against the bundled Ed25519 public key, domain hash, monotonic expiration, and token revocation lists.
* **Gated Execution**:
  * **Community Tier (`isPro: false`)**: Unauthenticated runs degrade safely to manual review mode (`isPro: false`). AST auto-resolution and whole-file lockfile/YAML mergers are bypassed, preserving conflict markers and returning exit code `1`.
  * **Pro Tier (`isPro: true`)**: Valid domain-locked or wildcard commercial tokens unlock headless AST auto-resolution and whole-file lockfile merges.
* **Subcommands**:
  * `treeresolve status [dir]`: Inspects working directory repo root, remote origin URL, canonical domain hash, and current licensing tier (`PRO` or `COMMUNITY`).
  * `treeresolve license <token>`: Installs or updates headless license token in user configuration.

---

## 9. Anonymous Telemetry & Privacy Framework

TreeResolve implements an offline-first, zero-knowledge telemetry system focused exclusively on improving normalizer accuracy and measuring developer time savings.

### 9.1. Metrics Collected

* **Auto-Merge Acceptance Rate (`autoAcceptanceRatePercent`)**:
  $$\text{AcceptanceRate} = \left(\frac{\text{AcceptedAutoHunks}}{\text{TotalAutoHunks}}\right) \times 100$$
  Evaluated upon merge save/commit by comparing final hunk resolutions against the initial syntax normalizer output.
* **Session Duration (`durationMs`)**: Elapsed time in milliseconds between opening the merge editor and saving the resolved buffer.
* **High-Level Aggregate Context**: `totalHunks`, `autoResolvedHunks`, `acceptedAutoHunks`, and `languageId`.
* **Structured AST Error Codes**: Normalizer errors emit structured error categories (`ERR_WASM_LOAD_FAILED`, `ERR_PARSER_INIT_FAILED`, `ERR_PARSE_SYNTAX_ERROR`, `ERR_ANCHOR_EXTRACTION_FAILED`) and strictly omit raw error messages, stack traces, or source text.

### 9.2. Device Fingerprinting Disclosure (Reverse Trials & Floating Leases)

* **Cryptographic Hashing (Zero PII / Privacy-Preserving)**: To issue 14-day reverse trials and renew floating enterprise leases without passwords or account registration, TreeResolve computes a SHA-256 hash of `platform:arch:machineId` (derived from `vscode.env.machineId` or an anonymous persistent UUID in standalone CLI, truncated to 32 hex chars; zero PII).
* **Isolation**: This fingerprint is transmitted solely to the configured licensing gateway (`https://licensing.treeresolve.still.systems`) for lease validation and is never correlated with telemetry metrics, source code, or repository contents. Offline wildcard licenses never contact the network.

### 9.3. Zero Data Egress Guarantee

* **No Source Code**: Source code, AST nodes, tokens, variable names, and comments are never transmitted.
* **No File or Repo Metadata**: File paths, directory structures, repository URLs, branch names, and commit messages are never inspected or transmitted.

### 9.4. Dual Opt-Out Controls

1. **Extension-Level Setting**: Users can disable telemetry at any time via `"treeresolve.enableTelemetry": false`.
2. **VS Code Global Telemetry**: Automatically honors `vscode.env.isTelemetryEnabled` / `telemetry.telemetryLevel: "off"`. Zero events are collected or sent if either flag is disabled.
