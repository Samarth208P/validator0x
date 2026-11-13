# validator0x: instructions for AI coding agents

This file serves two audiences: agents integrating the installed npm package, and agents changing this repository. Apply only the relevant section. Read `README.md` and the installed package version before using an API. The consuming project's instructions and the user's explicit requirements take precedence.

## Integrating the npm package

1. Use the public package exports. Import from `validator0x` for multiple chains, or from a documented family entrypoint such as `validator0x/bitcoin` or `validator0x/solana` for smaller bundles. Never import private `src/` or `dist/` paths.
2. The package is synchronous and offline. It needs no API key, RPC connection, wallet connection, Node crypto polyfill, or runtime dependency. Node.js 22+ and modern ES2020 browsers/workers are supported; browser runtimes need BigInt and TextEncoder.
3. Take the intended chain from application state or the user. For dynamic chain values, narrow with `isSupportedChain` before calling `validateAddress`, `validateBatch`, or `formatAddress`; unsupported chains throw.
4. Pass untrusted addresses directly to `validateAddress`. It accepts `unknown` and returns `ValidationResult`. Check `result.valid` before using an address. For rejected input, use `result.error` and `result.details?.errorCode`, not string comparisons with implementation-specific messages.
5. Validation trims outer ASCII spaces but does not return a normalized address. After successful validation of a string, use `input.trim()` for subsequent operations. Do not lowercase Base58 addresses or silently repair checksums, Unicode, missing characters, or invalid input.
6. `strict: true` requires exact EIP-55 capitalization for EVM addresses, and canonical lowercase AIP-40 representation for Aptos. Mixed-case EVM checksums and mandatory Base58Check/Bech32 checksums are always checked. Choose strict mode deliberately; do not enable it blindly for existing lowercase EVM input flows.
7. `network: 'mainnet' | 'testnet' | 'auto'` and `allowTestnet` only filter networks encoded in an address. EVM, Solana, TRON, Cosmos, Sui, Aptos, and NEAR cannot establish mainnet/testnet from address syntax. An absent `details.network` means unknown, not mainnet.
8. `detectBlockchain` returns a chain, an array of format candidates, or `null`. Never pick the first candidate automatically for a payment. EVM chains, Sui/Aptos, and some UTXO/NEAR formats overlap. Plain NEAR names are deliberately excluded from detection.
9. Validation does not prove ownership, account existence, spendability, token compatibility, or recipient safety. Handle application-specific destination tags, memos, RPC checks, and asset/network selection separately. `allowBurnAddress` only controls the EVM all-zero address.
10. Formatting is display logic. `shortenAddress` output must never become a transaction destination. `formatAddress` does not generally validate input; EVM checksum formatting and Aptos formatting can throw on malformed input. Validate first.
11. Keep client bundle size small: reuse a family validator instance when only one chain is needed. Do not add an entire chain SDK just to wrap these checks.
12. Add consumer tests for valid input, invalid checksum/encoding, unsupported chain input, network policy, and ambiguous detection as relevant to the integration. Use the published protocol fixtures or verified addresses rather than invented strings.

### Safe dynamic-input example

```ts
import { isSupportedChain, validateAddress } from 'validator0x';

export function checkRecipient(input: unknown, chain: unknown) {
  if (!isSupportedChain(chain)) {
    return { ok: false as const, error: 'Choose a supported chain' };
  }
  const result = validateAddress(input, chain, { network: 'mainnet' });
  if (!result.valid || typeof input !== 'string') {
    return { ok: false as const, error: result.error ?? 'Invalid address' };
  }
  // The application must separately verify the selected asset and actual network.
  return { ok: true as const, address: input.trim(), chain };
}
```

### Small single-family example

```ts
import { BitcoinValidator } from 'validator0x/bitcoin';

const bitcoin = new BitcoinValidator();
const result = bitcoin.validate('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', {
  network: 'mainnet',
});
```

### Discovering this file after installation

The npm archive includes this file. Resolve it using `require.resolve('validator0x/AGENTS.md')` or read `node_modules/validator0x/AGENTS.md`. Merely installing a package does not guarantee that an agent automatically reads its instructions; explicitly point the agent to this file.

## Contributing to this repository

- Use Node.js 22.13+ or a supported newer LTS for development. Install the locked development dependencies with `npm ci`.
- Preserve zero runtime dependencies, synchronous offline behavior, and existing public exports. Never add telemetry or address logging. Cryptographic/encoding code lives in `src/utils/`; family validators in `src/validators/`; the shared registry in `src/registry.ts`; public types in `src/types.ts`.
- Route validation through `AddressValidator.validate` so sanitization, options, and network policy are consistent. Preserve the 256-character bound before decoding. Check decoded version bytes, payload sizes, checksum variants, and padding rather than relying on a prefix or regex alone.
- When adding chain support, verify current primary specifications. Update types, the registry, detection behavior, README scope, and positive/negative tests. Do not claim support for a chain's distinct address formats just because one format matches EVM.
- When adding public entrypoints, update `package.json` exports/typesVersions, `rollup.config.mjs`, and `scripts/declarations.mjs` together. Declaration re-exports must preserve type identity across root and family imports. Keep the package-content allowlist and consumer checks in `scripts/test-package.mjs` aligned.
- Keep `@noble/hashes` and `@scure/base` development-only. They are independent test oracles, not runtime imports. Test changes to hash/encoding code against independent implementations and official vectors.
- Required release checks: `npm run check`, `npm run test:coverage`, and `npm audit`. `npm run check` includes lint, source/test type checking, unit tests, build, differential tests, and installation of the actual tarball into fresh consumers. Coverage includes crypto and public APIs; do not weaken coverage or size thresholds just to make a change pass.
- Tests generate `.coverage/`; builds generate `dist/`; release archives end in `.tgz`. Do not commit generated output, credentials, npm tokens, or unrelated local changes. Legacy tracked `coverage/` files are not current test evidence.
- Inspect `git status` before staging. Stage the intended source, tests, configuration, and documentation explicitly; preserve unrelated user edits.
- For release steps, consult `RELEASING.md` in the repository. Prepare and verify the archive before asking for approval. Publishing, moving npm dist-tags, or unpublishing requires the maintainer's explicit authorization. A request to prepare a release is not permission to publish. The maintainer completes npm login and any MFA flow directly; never ask them to paste passwords, tokens, or one-time codes into the chat.
- Report what was tested, package sizes, limitations, and whether changes were committed, pushed, or published. Never claim the package is bug-free or formally audited.
