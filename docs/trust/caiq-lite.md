# CSA CAIQ (lite) — TreeResolve

Pre-filled **lite** answers for vendor risk questionnaires. Mapped loosely to
common CSA CAIQ / CCM themes. **Not a CSA certification. Not SOC 2.**

**Vendor:** Still Systems, LLC (solo operator)  
**Product:** TreeResolve VS Code extension + CLI  
**Date:** 2026-09-26  
**Contact:** [billy.kidd34@gmail.com](mailto:billy.kidd34@gmail.com) · private vulnerability reports via
[SECURITY.md](../../.github/SECURITY.md)

Legend: **Y** = yes · **N** = no · **NA** = not applicable · **P** = partial /
honest caveat for a solo vendor.

| # | Control theme (lite) | Ans | Notes |
| :--- | :--- | :---: | :--- |
| 1 | Customer source code processed in vendor cloud? | **N** | Merge parsing/resolution is local-only. See [data-flow.md](./data-flow.md). |
| 2 | Customer source stored at rest by vendor? | **N** | Never collected. |
| 3 | Subprocessors that receive customer source? | **N** | None for merge. Paddle receives **buyer** billing data only. |
| 4 | Encryption in transit (TLS) for vendor endpoints? | **Y** | Licensing gateway and docs site use HTTPS. |
| 5 | Encryption at rest for customer source in vendor custody? | **NA** | No customer source in vendor custody. |
| 6 | Independent SOC 2 / ISO 27001 attestation? | **N** | Zero-cost constraint; not pursued pre-launch. Trust Pack + local-only design is the substitute. |
| 7 | Documented vulnerability disclosure program? | **Y** | GitHub private advisories + [security.txt](../security.txt). |
| 8 | Security contact / response SLA? | **P** | Aim: acknowledge within 48 hours (solo). No 24×7 SOC. |
| 9 | Production access MFA for vendor accounts? | **Y** | GitHub org + Cloudflare + Paddle accounts use MFA (operator practice). |
| 10 | Secrets scanning in CI? | **Y** | gitleaks in release gate; Dependabot on. |
| 11 | Dependency vulnerability scanning? | **Y** | `npm audit` in release gate; Dependabot security updates. |
| 12 | SBOM available per release? | **Y** | CycloneDX artifact from release workflow. |
| 13 | Signed release artifacts? | **Y** | SHA-256 + Sigstore keyless cosign on VSIX (GitHub OIDC). |
| 14 | Public supply-chain scorecard? | **Y** | OpenSSF Scorecard on `stillsystems/treeresolve-community`. |
| 15 | Separate prod/non-prod for billing? | **P** | Paddle sandbox vs live; live cutover is an operator step. |
| 16 | Background checks on all staff with prod access? | **P** | Solo founder; no additional employees. |
| 17 | Formal IR playbook with tabletop drills? | **P** | Lightweight VDP process in SECURITY.md; no formal multi-team IR org. |
| 18 | Customer data residency choice? | **NA** | No customer source stored. Licensing KV is Cloudflare (edge). |
| 19 | Right to audit / on-site audit? | **P** | Reasonable questionnaire support; on-site SOC-style audits not offered free. |
| 20 | Pentest within last 12 months? | **N** | Not yet; release gate + Scorecard + advisory channel instead. |
| 21 | Logging / SIEM for customer-code access? | **NA** | Vendor cannot access customer code via the product. |
| 22 | Telemetry opt-out available? | **Y** | `treeresolve.enableTelemetry: false` and/or VS Code telemetry off. |
| 23 | Air-gapped deployment supported? | **Y** | Offline VSIX + offline wildcard license; see [offline-vsix.md](./offline-vsix.md). |
| 24 | Extension allow-list compatible? | **Y** | Documented `extensions.allowed` / `AllowedExtensions` examples. |
| 25 | Breach notification commitment? | **P** | Will notify affected paying customers promptly if a licensing/account incident occurs; no customer-source breach surface by design. |

## Free-text summary (paste into portals)

> TreeResolve resolves Git merge conflicts entirely on the developer workstation
> or CI runner using local Tree-sitter WASM grammars. Customer source code, ASTs,
> and file paths are not transmitted to Still Systems. Optional licensing traffic
> may send an anonymized machine fingerprint for trials/floating leases; offline
> enterprise wildcard keys require no network validation. Optional anonymous
> telemetry (codes only) can be disabled by policy. Still Systems is a solo LLC
> without SOC 2; we publish a data-flow diagram, per-release SBOM, SHA-256 +
> Sigstore-signed VSIX artifacts, OpenSSF Scorecard on the public tracker,
> security.txt / VDP, and offline install guidance instead.
