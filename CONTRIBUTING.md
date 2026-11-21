# Contributing to validator0x

## Local setup

Use Node.js 22.13 or later on the Node 22 line, or a newer supported LTS. From the repository root, install the locked dependencies with `npm ci`. The packed-browser test uses Google Chrome stable. If Chrome is missing, run `npx playwright-core install chrome`.

## Changing a validator

Keep validation synchronous and offline with zero runtime dependencies. Put family-specific rules in `src/validators/` and shared encoding or hashing logic in `src/utils/`. Route address input through `AddressValidator.validate` to apply the shared input limit and network policy.

For a bug fix, add a regression test using a public API and confirm that it fails on the affected revision. Include a valid control when changing which inputs are accepted. For chain or checksum changes, use published protocol vectors and cover malformed inputs, network options and ambiguous detection where applicable. Compare changes to cryptographic primitives against the independent reference implementations used by the differential suite.

Document changes to public behavior in the README and changelog. For a new entrypoint, follow the export, declaration and packed-consumer requirements in [AGENTS.md](./AGENTS.md).

## Before opening a pull request

Run these commands from the repository root.

```sh
npm run check
npm run test:coverage
npm audit
```

`npm run check` runs lint, type checking, unit tests, the production build, differential comparisons and installation tests against the actual npm tarball. The coverage command enforces the repository thresholds. Use `npm test -- tests/evm-prefix.test.ts` for a focused run while developing.

Open the PR against `main`. Link the issue, describe the user-visible change and include your test results. For a performance change, give the Node version and compare the same inputs on both revisions. Keep generated coverage, build output and package archives out of the diff.

## Merge checks

GitHub requires all seven CI jobs before merging into `main`. Six package jobs run on Ubuntu and Windows with Node 22, 24 and 26. Each installs the locked dependencies, runs the full check and audits dependencies. The seventh job checks coverage on Ubuntu with Node 24. If GitHub marks the branch out of date, update it with the latest `main` and let CI run on the new revision.

For release preparation and publishing permissions, see [RELEASING.md](./RELEASING.md).
