# TreeResolve Community & Issue Tracker

Welcome to the public community repository for **TreeResolve**, the deterministic, syntax-aware 3-way merge conflict resolution extension for VS Code.

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/still-systems.treeresolve)](https://marketplace.visualstudio.com/items?itemName=still-systems.treeresolve)
[![Discussions](https://img.shields.io/github/discussions/stillsystems/treeresolve-community)](https://github.com/stillsystems/treeresolve-community/discussions)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

This repository serves as the central hub for:
* 🐛 **[Reporting Bugs & Regressions](https://github.com/stillsystems/treeresolve-community/issues/new?template=1_bug_report.md)**
* 🚀 **[Requesting New Languages & Grammars](https://github.com/stillsystems/treeresolve-community/issues/new?template=2_language_request.md)**
* 💡 **[Proposing Features & Workflow Improvements](https://github.com/stillsystems/treeresolve-community/issues/new?template=3_feature_request.md)**
* 💬 **[Community Discussions & Q&A](https://github.com/stillsystems/treeresolve-community/discussions)**

---

## What is TreeResolve?

Standard Git and native merge tools operate strictly on raw text lines. When two branches both insert an import, add an enum flag, or update adjacent JSON properties, line-based diff engines flag false conflicts and force you to manually click through hundreds of trivial hunks.

**TreeResolve replaces line-based guesswork with local syntax comprehension:**
* **Deterministic AST Auto-Resolution**: Parses code structurally via Tree-sitter to safely auto-resolve non-colliding syntax elements (imports, object keys, enum variants, interface members).
* **Zero AI / Zero Hallucinations**: 100% programmatic and rule-driven. Your code is never transmitted to an LLM or third-party cloud service—merges are provably correct, offline-ready, and reproducible.
* **Synchronized 3-Way Canvas**: A smooth visual editor with dynamic Bézier ribbons linking your branches (`Ours`, `Merged Result`, and `Theirs`).
* **Wasm-Accelerated Performance**: Diffs run via compiled WebAssembly inside isolated background workers, eliminating UI freezes on massive files.

👉 **[Install TreeResolve on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=still-systems.treeresolve)**

---

## 🗺️ Active Roadmap

### Currently Supported (v0.1.0)
* [x] **TypeScript / JavaScript**: Disjoint imports (named, aliased, side-effect), enum variants, interface members, object literals.
* [x] **JSON / JSONC**: Nested recursive key deduplication, array set unions.
* [x] **Python**: Indentation-aware (LCTD) module imports, dictionary keys, decorator scopes.
* [x] **Universal Line-based 3-Way Diff**: Visual fallback for all other file types.

### In Active Development
* [ ] **Go**:
  * Auto-union for grouped `import (...)` declarations.
  * Disjoint struct fields and interface method signatures.
* [ ] **Rust**:
  * `use` tree normalizer and nested path merging (`use std::{collections::HashMap, sync::Arc};`).
  * Non-colliding `enum` variant additions and `struct` field unions.
* [ ] **YAML**:
  * Indentation-safe key-value merging for Kubernetes manifests, Docker Compose, and CI/CD pipelines.
* [ ] **Java & C#**:
  * Disjoint `package`/`import` and `using` directive resolvers.
  * Class member and method declaration unions.

### Future Workflow Enhancements
* [ ] **CLI Companion (`treeresolve-cli`)**: Use TreeResolve as your global terminal `git mergetool`.
* [ ] **Repository Configuration (`.treeresolverc`)**: Custom project-level rules for deterministic field policies.
* [ ] **Semantic Intra-Line Token Highlighting**: Visual micro-highlighting for variable and argument renames.

---

## Contributing Feedback & Filing Issues

1. **Check Existing Issues**: Before opening a new issue, please search [existing open issues](https://github.com/stillsystems/treeresolve-community/issues) to avoid duplicates.
2. **Include Reproduction Snippets**: When reporting a conflict parsing or merge issue, providing a minimal reproduction snippet (Ours, Theirs, Base) helps us diagnose and ship a fix quickly.
3. **Upvote Languages**: Want support for your language prioritized? Upvote or comment on the corresponding issue in [Language Requests](https://github.com/stillsystems/treeresolve-community/labels/language-request).

---

## Security & Commercial Licensing

* **Security Vulnerabilities**: To report a sensitive security vulnerability, please email `security@stillsystems.com`.
* **Commercial Inquiries**: For enterprise seat licensing, custom MSAs, or air-gapped deployment assistance, visit [Still Systems](https://stillsystems.com) or contact `licensing@stillsystems.com`.
