# Contributing to validator0x

Bug reports, documentation fixes, and validator improvements are welcome. When reporting a bug, include the package version, chain, options, and a public test address that shows the expected and actual results. For a new address format, link to its protocol specification.

## Work locally

Create a branch from `main`. Use Node.js 22.13+ on the 22.x line or a newer supported LTS. From the repository root, run:

```sh
npm ci
npm test -- tests/evm-prefix.test.ts
```

Replace the example test path with the suite you’re changing. The full package check uses Chrome stable. If you need to install it, run `npx playwright-core install chrome`.

## Change a validator

Keep validation synchronous, offline, and free of runtime dependencies. For a bug fix, add a public API test that fails before the fix and passes afterward. For address format changes, test both accepted and rejected inputs against published protocol examples. See the [test fixtures](./tests/fixtures/README.md) and [repository instructions](./AGENTS.md) for encoding, network, and detection checks.

## Open a pull request

Keep each PR focused on one change. Update the README and changelog when public behavior changes. Leave generated coverage reports, build output, and package archives out of the diff.

Run the package checks before requesting review:

```sh
npm run check
npm audit
```

Target `main`, explain what changed and why, and include your test results. Link any related issue. For performance changes, include before-and-after measurements on the same inputs and Node.js version.

GitHub requires six package checks (Ubuntu and Windows on Node.js 22, 24, and 26). If your branch falls behind `main`, update it and wait for the checks to pass again. Run `npm run test:coverage` locally to check coverage thresholds before a release.
