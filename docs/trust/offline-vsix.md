# Offline VSIX install and AllowedExtensions policy

For air-gapped fleets, private marketplaces, and allow-listed VS Code
environments. Official Microsoft reference:
[Manage extensions in enterprise environments](https://code.visualstudio.com/docs/enterprise/extensions).

## 1. Obtain a verified VSIX

Prefer a GitHub Release from `stillsystems/treeresolve` (private source of
truth) once tagged:

1. Download `treeresolve-<version>.vsix`
2. Download `treeresolve-<version>.vsix.sha256`
3. Download `treeresolve-<version>.vsix.sigstore.json` (Sigstore bundle)
4. Optionally download `treeresolve-<version>.cdx.json` (SBOM)

Verify:

```bash
sha256sum -c treeresolve-<version>.vsix.sha256

cosign verify-blob "treeresolve-<version>.vsix" \
  --bundle "treeresolve-<version>.vsix.sigstore.json" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  --certificate-identity-regexp \
  '^https://github.com/stillsystems/treeresolve/\.github/workflows/release-artifacts\.yml@refs/tags/v'
```

Marketplace install (`still-systems.ss-treeresolve`) is preferred when online.
For air-gapped or allow-listed fleets, treat signed GitHub Release assets (or an
internal mirror of those assets) as the offline install source of truth.

## 2. Install without Marketplace

```bash
# User scope
code --install-extension ./treeresolve-<version>.vsix --force

# Or VSCodium / forks — use the matching CLI
codium --install-extension ./treeresolve-<version>.vsix --force
```

MDM / Intune / Jamf: ship the VSIX to a known path and run the same command
under the target user, or distribute via your private VS Code marketplace if
you operate one.

## 3. Allow-list TreeResolve (`extensions.allowed`)

VS Code 1.96+ supports application setting `extensions.allowed` and org policy
`AllowedExtensions`. When the allow-list is set, **only listed** publishers /
extensions may install.

User or machine `settings.json` example (allow Still Systems publisher, or pin
the extension id):

```json
{
  "extensions.allowed": {
    "still-systems": true
  }
}
```

Pin a specific extension (and optionally versions) instead of the whole
publisher:

```json
{
  "extensions.allowed": {
    "still-systems.ss-treeresolve": true
  }
}
```

Or allow only listed versions:

```json
{
  "extensions.allowed": {
    "still-systems.ss-treeresolve": ["1.0.1"]
  }
}
```

### Organization policy (`AllowedExtensions`)

Deploy the **same JSON object** via device management. Policy overrides user
`extensions.allowed`. On Windows Group Policy / Intune, the policy value is the
JSON string (not JSONC — no comments).

Example policy payload:

```json
{"still-systems.ss-treeresolve":true}
```

If policy JSON is invalid, VS Code ignores it — check **Show Window Log**.

## 4. Recommended enterprise defaults

```json
{
  "treeresolve.enableTelemetry": false,
  "treeresolve.autoMergeImports": true
}
```

Air-gapped license install (no network validation once the JWT is present):

```bash
npx treeresolve license <OFFLINE_WILDCARD_JWT>
```

Or VS Code command: `TreeResolve: Install License Key`.

## 5. Headless CLI (no VSIX)

CI runners that only need the merge driver/CLI can use the npm package without
installing the VS Code extension. Provide `TREERESOLVE_LICENSE` as a secret and
keep runners offline except for your package registry mirror if required.
