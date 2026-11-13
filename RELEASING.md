# Releasing validator0x

`0.3.0` was published on 2026-11-13. The commands below document that release process. For the next release, choose an unused version, update package.json/package-lock.json and the changelog, and substitute the new version and archive name throughout these commands.

Preparation and publication are separate steps. There is no automatic publish workflow; pushing this repository only runs checks.

## Prepare a concrete release candidate

Use a supported development Node.js version (22.13+ or newer LTS), then run from the repository root:

```sh
npm ci
npm run prepare:release
```

This runs lint, source/test type checking, unit tests, production builds, independent differential checks, packed-consumer checks, coverage thresholds, and the dependency audit. It then creates `validator0x-0.3.0.tgz` from the verified build. Build output and tarballs are intentionally not committed.

Before publication:

1. Review the README and changelog, and confirm the intended commit has been pushed.
2. Check the CI run for that exact commit on Windows/Linux with Node 22, 24, and 26. Resolve failures before publishing.
3. Confirm that the version is unused with `npm view validator0x versions --json --registry=https://registry.npmjs.org/`. Do not overwrite or unpublish an existing release to reuse its version.
4. Inspect the tarball file list and integrity from `npm pack --ignore-scripts --json`. It should contain only `dist/`, `package.json`, `README.md`, `AGENTS.md`, `CHANGELOG.md`, and `LICENSE`.
5. Dry-run the exact archive, without changing the registry:

```sh
npm publish ./validator0x-0.3.0.tgz --dry-run --access public --tag latest --registry=https://registry.npmjs.org/
```

Dry-run success verifies packaging, not permission to publish. `npm publish` of a tarball uses the already-built artifact; run all preparation checks before creating it. If source or package contents change afterward, rebuild and reverify the candidate.

## Maintainer login and approval

The maintainer logs in directly in their terminal using npm's browser-based login:

```sh
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
```

The logged-in account must be an owner/maintainer of `validator0x`. Complete any browser or MFA prompts directly; do not put credentials in repository files, commit messages, logs, or chat.

For an agent-assisted release, present the version, commit, verified archive, integrity, test/CI results, public registry, and `latest` tag to the maintainer. Ask for explicit approval for that release. Authentication alone is not approval.

## Publish only after approval

```sh
npm publish ./validator0x-0.3.0.tgz --access public --tag latest --registry=https://registry.npmjs.org/
```

The command above is an actual public release. Publishing `latest` makes this version the default for future installs.

npm may accept the upload and report that the package is still being processed. During its publish-time scan, the version can return 404 and `latest` can still reference the previous release. Wait and retry read-only registry checks; do not submit the same publish again. Scanning commonly takes a few minutes. See [npm's publish-time scanning announcement](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/).

After publication, verify `npm view validator0x@0.3.0 version dist.integrity --json` matches the candidate, and verify `npm view validator0x dist-tags --json`. Smoke-test an installation of `validator0x@0.3.0` in a fresh project. Update release status/changelog and create the matching Git tag/release as authorized by the maintainer. Do not claim completion until the registry verification succeeds.

Reference: [npm login](https://docs.npmjs.com/cli/v11/commands/npm-login/) and [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/).
