# Architecture: TreeResolve (v1.7.0 Enterprise Production Specification)

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
3. **Submodule Isolation**:
   $$\text{DomainID} = \text{Hash}(\text{RepositoryRootPath} + \text{RemoteOriginUrl})$$
   Submodules establish their own independent `DomainID` based on their nested repository root, ensuring that licensing and resolution policies in submodules remain decoupled from the parent workspace.

### 2.2. Git LFS Pointer Ingestion Pre-Flight

Files tracked via Git LFS resolve to pointer blobs (`version https://git-lfs.github.com/spec/v1\noid sha256:...\nsize ...`) during low-level Git index plumbing extraction (`git cat-file` or `git show :stage:path`). Feeding pointer text into language grammar parsers creates spurious syntax errors and drops merge sessions. TreeResolve enforces pre-flight verification:

* **Header Guard**: Buffers undergo early signature matching against `/^version https:\/\/git-lfs\.github\.com\/spec\/v1/`.
* **Safe Degradation**: If detected on any branch, AST parsing is bypassed, and hunks are routed to visual 2-way/3-way review mode without parser crash loops.

### 2.3. Partial zdiff3 Ancestor Degradation & Stream Alignment

Upstream merge operations and cherry-picks frequently produce non-uniform conflict markers where individual hunks contain `||||||| base` sections while adjacent hunks retain standard 2-way markers (`<<<<<<<` -> `=======` -> `>>>>>>>`). TreeResolve ensures robust handling:

* **Hunk-Local Degradation**: Hunks evaluate their base ancestor presence independently. Hunks with valid ancestors upgrade to Tier 2 (or Tier 1 AST auto-resolve), while base-lacking hunks degrade to Tier 3 visual diffing.
* **Line-Synchronized Stream Padding**: When a hunk lacks base ancestor content, the internal ancestor line stream is padded to match branch length, preventing line index drift and ensuring accurate coordinate projection across subsequent hunks.

### 2.4. Offline-First 30-Day Floating Lease & Serverless Trial Ticketing

To eliminate trial tampering while preserving the zero-latency, offline-first operating doctrine, TreeResolve decouples immediate file-open verification from network availability:

1. **Zero-Latency Local Verification**: The extension inspects cached secrets (`treeresolve.license.<domainId>` or `treeresolve.trial_ticket`) offline. Editor rendering is never blocked waiting on remote network calls.
2. **Server-Issued Trial Tickets**: On startup, `FloatingLeaseClient` touches the Cloudflare Worker (`POST /api/v1/trial`) with an anonymous, privacy-preserving SHA-256 machine fingerprint (`os.platform + arch + hostname + user`). The worker returns a signed 14-day Ed25519 JWT ticket stored in `context.secrets`.
3. **Monotonic Offline Fallback**: If the network is unreachable during initial install, `DomainLeaseCoordinator` evaluates local `globalState` timestamps with monotonic clock-rollback detection as an air-gapped fallback.
4. **30-Day Floating Leases**: Commercial licenses automatically renew 30-day floating leases via `POST /api/v1/lease/renew` when online.
5. **Wildcard Hard-Caps & Revocation Manifests**: Tokens with wildcard domain scope (`domainId: '*'`) are constrained to a strict 90-day maximum TTL. `LicenseManager` enforces token revocation via `jti` checks synchronized with edge-cached revocation manifests.

---

## 3. AST Semantic Engine & Context-Aware Scaffolding

> [!NOTE]
> **Implementation Status**: TreeResolve includes a Concrete Syntax Tree (CST) engine powered by `@vscode/tree-sitter-wasm` (`TreeSitterService`, `AstImportNormalizer`, and `AstDeclarationMerger`). It provides multi-language parsing across TypeScript, JavaScript, Python, Go, and Rust, with deterministic multi-line import reconciliation, deletion preservation, and disjoint structural declaration merging.

### 3.1. Context-Aware Synthetic Scaffolding

When global parsing times out or when re-evaluating isolated Lexical Scope Containers (LSC), wrapping fragments arbitrarily in synthetic outer classes produces severe parse regressions if the fragment represents a top-level construct (e.g., package declarations, import specifiers) or statement-level blocks inside a method. The AST engine applies **Three-Tier Context-Aware Scaffolding**:

* **Parent Node Classification**: Prior to wrapper injection, the AST engine checks the enclosing syntax kind of the fragment's anchor point:
  * **Top-Level Form (`compilation_unit`, `source_file`, `module`)**: The snippet is parsed without outer class nesting. If required by the grammar (such as Go), only the necessary top-level header is attached (e.g., `package __stub__\n`).
  * **Member-Level Form (`class_body`, `struct_body`, `interface_body`)**: The snippet is injected into a synthetic class or struct stub:
    * *Java*: `class __TreeResolveStub__ { /* <SNIPPET> */ }`
    * *C#*: `class __TreeResolveStub__ { /* <SNIPPET> */ }`
    * *C++*: `struct __TreeResolveStub__ { /* <SNIPPET> */ };`
  * **Statement-Level Form (`block`, `function_body`, `statement_block`)**: When the hunk resides inside a method/function body, bare statements are wrapped within an inner synthetic function stub to avoid grammar rejection:
    * *Java/C#*: `class __TreeResolveStub__ { void __stub__() { /* <SNIPPET> */ } }`
    * *C++*: `void __TreeResolveStub__() { /* <SNIPPET> */ }`
    * *Go*: `package __stub__\nfunc __stub__() { /* <SNIPPET> */ }`
* **Two-Stage 2D Coordinate Re-Mapping (Bytes & Points)**:
  Because stub headers introduce prefix bytes and newlines, parser ranges (`{ startByte, endByte, startPosition, endPosition }`) are projected through a two-stage coordinate pipeline:
  * **Stage 1: Synthetic Buffer $\to$ Snippet-Relative Space**:
    $$\text{AdjustedByte} = \text{RawByte} - \text{HeaderByteLength}$$
    $$\text{AdjustedRow} = \text{RawRow} - \text{HeaderLineCount}$$
    $$\text{AdjustedColumn} = \begin{cases} \text{RawColumn} - \text{HeaderLastLineLength} & \text{if } \text{RawRow} == \text{HeaderLineCount} \\ \text{RawColumn} & \text{if } \text{RawRow} > \text{HeaderLineCount} \end{cases}$$
  * **Stage 2: Snippet-Relative Space $\to$ Absolute Document Space**:
    $$\text{DocumentByte} = \text{SnippetStartByte} + \text{AdjustedByte}$$
    $$\text{DocumentRow} = \text{SnippetStartRow} + \text{AdjustedRow}$$
    $$\text{DocumentColumn} = \begin{cases} \text{SnippetStartColumn} + \text{AdjustedColumn} & \text{if } \text{AdjustedRow} == 0 \\ \text{AdjustedColumn} & \text{if } \text{AdjustedRow} > 0 \end{cases}$$
  This maps error-free CST nodes and point positions directly back to the original document lines.

### 3.2. Dynamic Worker Watchdogs

AST parsing tasks run inside dedicated Node `worker_threads` managed via a work-stealing queue:

* **Dynamic Timeout Budget**:
  $$T_{budget} = \max\left(50\text{ms},\; 50\text{ms} + \left(\frac{\text{LOC}}{1{,}000}\right) \times 10\text{ms}\right) \quad [\text{Hard Cap: } 500\text{ms}]$$
* **Targeted Scope Fallback**: If full-buffer parsing exceeds $T_{budget}$, global parsing halts. The worker extracts the enclosing LSC lines surrounding the Git hunk, wraps them in context-aware scaffolding, and parses the isolated unit before dropping to Tier 2.

### 3.3. Lexical Continuation & Token-Depth Tracking (LCTD)

* **Bracket Depth Counter**: Indentation checks are bypassed whenever open bracket counters (`(`, `[`, `{`) are $> 0$.
* **Continuation Classifier**: Lines ending with an explicit backslash (`\`) or lines preceded by decorators (`@foo(...)`) bind atomically to the subsequent statement block.
* **Scope Boundary**: The enclosing Scope Unit in Python/YAML is the nearest ancestor line where `bracketDepth == 0`, `isContinuation == false`, and $\text{indent} \le \text{indent}_{conflict\_start}$.

### 3.4. Lockfile Semantic Auto-Resolution (`package-lock.json`)

Standard 3-way text and JSON diff engines fail on package lockfiles (`package-lock.json` v2/v3) because concurrent dependency bumps produce line conflicts across `packages` maps and root `dependencies`. TreeResolve provides dedicated lockfile resolution via [LockfileAutoResolver.ts](file:///c:/Users/billy/Desktop/treeresolve/src/semantic/resolvers/LockfileAutoResolver.ts):

* **3-Way Semver Merge Engine**: Evaluates version constraints across `Base`, `Ours`, and `Theirs`. When two branches bump the same dependency within the same major version (e.g. `^1.2.0` vs `^1.5.0` from `^1.0.0`), the higher compatible semver constraint wins automatically.
* **Integrity & Descriptor Atomic Pairing**: In `node_modules/...` package descriptor objects, the winning version retains its matching `integrity` (sha512), `resolved` tarball URL, and nested dependency subgraph from the winning branch, preventing corrupted lockfile manifests.
* **Disjoint Package Set Union**: Disjoint package additions introduced on separate branches are merged into the `packages` map without collision.
* **Incompatible Major Divergence Guard**: When two branches update a package across different major versions (e.g., `2.0.0` vs `1.5.0`), the resolver safely flags a collision and routes the hunk for human review.

---

## 4. Concurrency, Monotonic Sequences, & Asymmetric Diff Anchoring

### 4.1. Monotonic Action Sequencing

To eliminate out-of-order execution when a user rapidly toggles between resolution states (e.g., "Accept Ours" $\to$ "Accept Theirs" $\to$ "Accept Ours"), actions are stamped with a monotonic sequence counter scoped per hunk:

* **Sequenced Action Tuple**: Every `RESOLVE_HUNK` action emitted by the Webview contains an incrementing integer `actionSeq: number`, a correlation token `actionNonce: string` (UUIDv4), and the target `hunkId`.
* **State Machine Invariant**: The Extension Host tracks the latest applied sequence number:
  $$\text{highestAppliedSeq}[\text{hunkId}]$$
* **Stale Drop Rule**: If an incoming message has $\text{actionSeq} \le \text{highestAppliedSeq}[\text{hunkId}]$, the action is immediately discarded as stale. Only transactions where $\text{actionSeq} > \text{highestAppliedSeq}[\text{hunkId}]$ are applied to the `vscode.WorkspaceEdit` pipeline.
* **Session Lifecycle & Invalidation**: Sequence counters and `highestAppliedSeq` are scoped to the active `documentVersion` and session instance. Any `INIT_SESSION` event or external document invalidation resets `highestAppliedSeq` to prevent stale sequence barriers on file reloads.
* **Explicit Acknowledgement**: The host emits `ACK_HUNK_RESOLUTION` referencing both `actionSeq` and `actionNonce`, allowing the Webview UI to settle its optimistic button states deterministically.

```text
Webview UI                                Extension Host                   Active Document Buffer
    │                                           │                                    │
    │── RESOLVE_HUNK (seq: 1, Nonce_A, Ours) ──▶│                                    │
    │── RESOLVE_HUNK (seq: 2, Nonce_B, Theirs) ─▶│ [seq: 2 arrives during flight]    │
    │                                           │ Applies WorkspaceEdit (seq: 2) ───▶│
    │                                           │ Sets highestAppliedSeq = 2         │
    │                                           │ Discards seq: 1 payload            │
    │◀── ACK_HUNK_RESOLUTION (seq: 2, Nonce_B) ─│                                    │
    │    (Commits final toggle state)           │                                    │
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

---

## 5. Viewport Rendering & Dynamic Virtualization

### 5.1. Dynamic Viewport-Scaled DOM Pooling

To prevent visual clipping on rotated 4K monitors, ultrawide displays, and ultra-small editor font scales:

* **Fixed-Height Line Invariant**: TreeResolve enforces strict fixed-height line rows via CSS `white-space: pre` and disabled line-wrapping. Maintaining a constant `LineHeight_px` ensures that $O(1)$ translateY offset calculations remain perfectly aligned with gutter markers and canvas connectors without visual jitter.
* **Dynamic Row Sizing**: DOM rows are calculated dynamically from active element metrics:
  $$\text{PoolRows} = \left\lceil \frac{\text{ViewportHeight}_{\text{px}}}{\text{LineHeight}_{\text{px}}} \right\rceil + 50 \quad [\text{Overscan Pool}]$$
* **Resize Observer**: A native `ResizeObserver` on the Webview container re-evaluates `PoolRows` on window dimension shifts, allocating or recycling DOM row nodes dynamically.

### 5.2. Canvas Ribbon Rendering Engine

* Connectors between panes render via an HTML5 `<canvas>` using cubic Bézier paths.
* **Hardware High-DPI Buffer Scaling**: Canvas buffer metrics are scaled by `window.devicePixelRatio` with a corresponding 2D transformation matrix (`ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`). This preserves physical pixel sharpness and prevents sub-pixel blurring or vertical ribbon drift across Retina, high-refresh (120Hz/144Hz), and 4K displays.
* **Visibility Culling**: Ribbons whose vertical bounds sit outside the visible viewport are excluded from render loops.
* **Momentum Fallback**: If scroll velocity exceeds 2,500 px/sec, connector rendering drops to bounding polygons ($O(1)$) to preserve steady 60fps frame rates.

---

## 6. Evolvable Protocol Contract

```typescript
export interface ClientCapabilities {
  protocolVersion: number;
  renderMode: 'CANVAS_RIBBONS' | 'FALLBACK_RECTS';
  slidingWindowSupport: boolean;
  sriVerification: boolean;
}

export interface SemanticAnchor {
  anchorId: string;
  nodeType: string;
  baseRange: [number, number] | null;
  oursRange: [number, number] | null;
  theirsRange: [number, number] | null;
}

export interface BridgeEnvelope<T> {
  protocolVersion: number;       // Current version: 7
  minCompatibleVersion: number;  // Floor: 6
  domainId: string;              // Submodule-aware Git root hash
  documentUri: string;           // Target file URI
  documentVersion: number;       // Matches vscode.TextDocument.version
  timestamp: number;
  capabilities: ClientCapabilities;
  payload: T;
}

// Host -> Webview Payloads
export type HostPayload =
  | {
      type: 'INIT_SESSION';
      capabilities: ClientCapabilities;
      anchors: SemanticAnchor[];
      hunks: Array<{
        id: string;
        tier: 'TIER_1_AST' | 'TIER_2_VISUAL_3WAY' | 'TIER_3_VISUAL_2WAY';
        rangeOurs: [number, number];
        rangeTheirs: [number, number];
        rangeBase: [number, number] | null;
        autoResolvedText: string | null;
        requiresManualReview: boolean;
      }>;
    }
  | {
      type: 'ACK_HUNK_RESOLUTION';
      actionSeq: number;
      actionNonce: string;
      hunkId: string;
      appliedVersion: number;
    }
  | {
      type: 'RECONCILE_STALE_ACTION';
      conflictedHunkId: string;
      latestBufferText: string;
    };

// Webview -> Host Payloads
export type WebviewPayload =
  | {
      type: 'RESOLVE_HUNK';
      actionSeq: number;
      actionNonce: string;
      hunkId: string;
      action: 'ACCEPT_OURS' | 'ACCEPT_THEIRS' | 'ACCEPT_BOTH' | 'CUSTOM';
      customText?: string;
    }
  | {
      type: 'COMMIT_MERGE';
      stageOnSave: boolean;
    };
```

---

## 7. Security Hardening & Asset Integrity

### 7.1. Subresource Integrity (SRI) Manifest

* A cryptographically signed `assets.manifest.json` generated during build indexes SHA-256 hashes of all bundled WASM binaries, worker scripts, and stylesheets.
* On extension activation, the runtime asserts manifest integrity against a hardcoded Ed25519 root signature.

### 7.2. Webview Content Security Policy

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

### 7.3. Submodule Domain Licensing Lifecycle

* **Atomic Domain Lock**: Leases bind to `DomainID` (evaluated at submodule root). Active merge editor sessions maintain their granted capability tier until the buffer is committed or closed.
* **Air-Gapped Offline Validation**: Ed25519 token signatures verify entirely offline using the bundled public key, ensuring zero outbound code transmission.
* **Monotonic Anti-Tamper Clock Guard**: The trial coordinator tracks a monotonic `treeresolve.lastSeenTimestamp` in persistent `globalState`. If local system clock manipulation is detected (`Date.now() < lastSeen`), the engine clamps elapsed time to `lastSeen`, preventing negative durations or indefinite trial prolongation.

---

## 8. Standalone Git Mergetool & Batch Resolution Architecture

TreeResolve provides a zero-dependency standalone CLI companion (`bin/treeresolve.js`) designed for terminal Git workflows and headless CI/CD execution.

### 8.1. Git Mergetool Backend (`treeresolve merge`)

* **Argument Protocol**: Conforms to Git's 4-argument contract:

  ```text
  treeresolve merge <base> <local> <remote> <merged>
  ```

* **Language Identification**: Maps file extensions across all supported formats (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.rs`, `.yaml`, `.yml`, `.java`, `.cs`, `.json`).
* **Offline Execution**: Operates purely in Node.js runtime without VS Code dependencies, constructing a synthesized result buffer and resolving disjoint syntax hunks.
* **Exit Code Semantics**: Returns exit code `0` when all conflicts are resolved or preserved safely, and `1` upon syntax collisions requiring manual intervention.

### 8.2. Headless Batch Auto-Resolver (`treeresolve auto`)

* **Unmerged File Discovery**: Executes `git diff --name-only --diff-filter=U` to discover conflicted paths in the working tree.
* **Syntax Hunk Parsing**: Parses conflict markers via `ConflictMarkerParser` and invokes `ImportNormalizer` and language normalizers.
* **Automated Staging**: Automatically runs `git add <file>` when 100% of conflict hunks in a file are resolved deterministically.

---

## 9. Anonymous Telemetry & Privacy Framework

TreeResolve implements an offline-first, zero-knowledge telemetry system focused exclusively on improving normalizer accuracy and measuring developer time savings.

### 9.1. Metrics Collected

* **Auto-Merge Acceptance Rate (`autoAcceptanceRatePercent`)**:
  $$\text{AcceptanceRate} = \left(\frac{\text{AcceptedAutoHunks}}{\text{TotalAutoHunks}}\right) \times 100$$
  Evaluated upon merge save/commit by comparing final hunk resolutions against the initial syntax normalizer output.
* **Session Duration (`durationMs`)**: Elapsed time in milliseconds between opening the merge editor and saving the resolved buffer.
* **High-Level Aggregate Context**: `totalHunks`, `autoResolvedHunks`, `acceptedAutoHunks`, and `languageId`.

### 9.2. Zero Data Egress Guarantee

* **No Source Code**: Source code, AST nodes, tokens, variable names, and comments are never transmitted.
* **No File or Repo Metadata**: File paths, directory structures, repository URLs, branch names, and commit messages are never inspected or transmitted.

### 9.3. Dual Opt-Out Controls

1. **Extension-Level Setting**: Users can disable telemetry at any time via `"treeresolve.enableTelemetry": false`.
2. **VS Code Global Telemetry**: Automatically honors `vscode.env.isTelemetryEnabled` / `telemetry.telemetryLevel: "off"`. Zero events are collected or sent if either flag is disabled.
