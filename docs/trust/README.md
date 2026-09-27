# TreeResolve Trust Pack

Zero-cost vendor-risk materials for enterprise buyers evaluating TreeResolve.
**This is not a SOC 2 report and is not launch approval.** Still Systems is a
solo LLC; answers below are honest about that.

| Artifact | Location | Automation |
| :--- | :--- | :--- |
| Data-flow diagram | [data-flow.md](./data-flow.md) | Docs (synced to community) |
| SBOM (CycloneDX) | GitHub Release / workflow artifact | [release-artifacts.yml](../../.github/workflows/release-artifacts.yml) |
| SHA-256 + Sigstore | Alongside each VSIX on release | Same workflow (keyless OIDC) |
| OpenSSF Scorecard | Public community repo | Community workflow (separate PR) |
| CSA CAIQ (lite) | [caiq-lite.md](./caiq-lite.md) | Docs |
| VDP / security.txt | [SECURITY.md](../../.github/SECURITY.md), [security.txt](../security.txt) | Docs + Pages |
| Offline VSIX + AllowedExtensions | [offline-vsix.md](./offline-vsix.md) | Docs |

Also see [ENTERPRISE.md](../../ENTERPRISE.md), [PRIVACY.md](../../PRIVACY.md),
and [ARCHITECTURE.md](../../ARCHITECTURE.md).

## How to verify a release VSIX

```bash
# After downloading assets from the GitHub Release:
sha256sum -c treeresolve-<version>.vsix.sha256

cosign verify-blob "treeresolve-<version>.vsix" \
  --bundle "treeresolve-<version>.vsix.sigstore.json" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  --certificate-identity-regexp \
  '^https://github.com/stillsystems/treeresolve/\.github/workflows/release-artifacts\.yml@refs/tags/v'
```

SBOM file: `treeresolve-<version>.cdx.json` (CycloneDX JSON).
