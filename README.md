# validator0x

Small, synchronous wallet address validation for **38 chain identifiers**, with **zero runtime dependencies**. Works offline in Node.js 22+, modern browsers, and workers supporting ES2020, BigInt, and TextEncoder. Includes native ESM, CommonJS, browser UMD, and TypeScript declarations.

Validation checks address encoding, payload structure, and checksums where the format has one. It does **not** establish ownership, account existence, balance, network connectivity, or whether an address can safely receive a particular asset.

## Install and use

**0.3.0 is published on npm.** Use `npm install validator0x@0.3.0` to pin this release, or install `validator0x` for the latest version. See [migration notes](./CHANGELOG.md) before upgrading from 0.2.x.

```sh
npm install validator0x
```

```ts
import { validateAddress, validateBatch, ValidationError } from 'validator0x';

const result = validateAddress(
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  'base',
  { strict: true },
);

if (!result.valid) {
  console.log(result.error, result.details?.errorCode);
  // e.g. ValidationError.INVALID_CHECKSUM
}

const results = validateBatch(
  ['TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL', 'invalid'],
  'tron',
);
console.log(results.map(result => result.valid)); // [true, false]
```

CommonJS works too:

```js
const { validateAddress } = require('validator0x');
```

## Integrate into an application

Keep chain selection explicit. For an API request or form whose values are not already typed, validate the chain before validating the address:

```ts
import { isSupportedChain, validateAddress } from 'validator0x';

export function checkRecipient(address: unknown, chain: unknown) {
  if (!isSupportedChain(chain)) {
    return { ok: false as const, error: 'Choose a supported chain' };
  }
  const result = validateAddress(address, chain, { network: 'mainnet' });
  if (!result.valid || typeof address !== 'string') {
    return { ok: false as const, error: result.error ?? 'Invalid address' };
  }
  return { ok: true as const, address: address.trim(), chain };
}
```

The validator trims outer ASCII spaces internally; use the trimmed string after successful validation. Keep the original capitalization for case-sensitive addresses. Apply asset/network selection and any on-chain recipient checks separately. The package can be used directly in browser forms, server handlers, and workers without initialization or a wallet SDK.

| Public API | Result and behavior |
| --- | --- |
| `validateAddress(input, chain, options?)` | `ValidationResult`; invalid addresses return `valid: false` |
| `validateBatch(inputs, chain, options?)` | Results in input order; accepts a readonly array |
| `isSupportedChain(value)` | Boolean and TypeScript type guard for unknown chain input |
| `SUPPORTED_CHAINS` | Frozen list of supported identifiers; useful for a chain selector |
| `detectBlockchain(input, options?)` | One chain, candidate array, or `null`; never proof of chain ownership |
| `formatAddress(address, chain, options?)` | Display string; validation is a separate step |
| `ValidationError` | Runtime enum for `result.details?.errorCode` |

### AI-assisted integration

Point your coding agent to [AGENTS.md](./AGENTS.md). It contains integration examples, API rules, chain ambiguity and network limitations, bundle guidance, and repository contribution instructions. It ships inside the npm package and is discoverable after installation:

```sh
node -p "require.resolve('validator0x/AGENTS.md')"
```

Ask the agent to read that file before implementing an integration. Instructions inside installed packages are not automatically loaded by every AI tool.

## Keep your bundle small

Import a validator directly when your project needs only one family:

```ts
import { BitcoinValidator } from 'validator0x/bitcoin';

const bitcoin = new BitcoinValidator();
bitcoin.validate('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', {
  network: 'mainnet',
});
```

All direct imports support ESM, CommonJS, and TypeScript:

| Import | Exports |
| --- | --- |
| `validator0x/ethereum` | `EthereumValidator` |
| `validator0x/evm` | `EvmValidator`, existing BSC/Avalanche/Arbitrum/Optimism/Base classes |
| `validator0x/bitcoin` | `BitcoinValidator` |
| `validator0x/litecoin` | `LitecoinValidator` |
| `validator0x/dogecoin` | `DogecoinValidator` |
| `validator0x/solana` | `SolanaValidator` |
| `validator0x/ripple` | `RippleValidator` |
| `validator0x/cardano` | `CardanoValidator` |
| `validator0x/tron` | `TronValidator` |
| `validator0x/cosmos` | `CosmosValidator` |
| `validator0x/move` | `SuiValidator`, `AptosValidator` |
| `validator0x/near` | `NearValidator` |
| `validator0x/formatters` | `shortenAddress`, `normalizeAddress`, `addChecksum` |

For example, `new CosmosValidator('osmosis')` or `new EvmValidator('sonic')`. Existing validator classes, including `PolygonValidator`, remain available from the root import.

The full minified ESM bundle is approximately **6.8 kB gzip**, and the Solana-only entry approximately **1.2 kB gzip**. `npm run test:package` prints exact sizes and enforces budgets of 12 kB and 3 kB respectively. Runtime dependencies, RPC requests, polyfills, and chain SDKs: **none**. Root imports include the chain registry; direct imports exclude unrelated validators.

## Supported address formats

| Chain identifier | Scope |
| --- | --- |
| `ethereum`, `polygon`, `bsc`, `avalanche`, `arbitrum`, `optimism`, `base` | Ethereum 20-byte hexadecimal addresses; EIP-55 checksum |
| `evm`, `fantom`, `sonic`, `gnosis`, `celo`, `cronos`, `moonbeam`, `moonriver`, `zksync`, `linea`, `scroll`, `mantle`, `blast`, `opbnb`, `zora`, `worldchain` | Same Ethereum/EIP-55 address rules |
| `bitcoin` | Base58Check P2PKH/P2SH; SegWit v0; Bech32m v1-16, including Taproot; mainnet and testnet |
| `litecoin` | Base58Check P2PKH/P2SH (including legacy shared P2SH prefixes); standard witness v0-16; mainnet and testnet |
| `dogecoin` | Base58Check P2PKH/P2SH; mainnet and testnet |
| `solana` | Base58 decoding to exactly 32 bytes, including program addresses and PDAs |
| `cardano` | Shelley base, enterprise, pointer, and stake addresses; header/network/length/padding checks; Byron CBOR envelope and CRC32 |
| `ripple` | XRP classic account addresses with the XRP Base58 alphabet and checksum |
| `tron` | 34-character Base58Check or 42-character hex beginning with `41` |
| `cosmos`, `osmosis`, `sei` | Bech32 account prefixes `cosmos`, `osmo`, `sei`; 20- or 32-byte payloads |
| `celestia`, `injective` | Bech32 account prefixes `celestia`, `inj`; 20-byte payloads |
| `sui` | `0x` followed by exactly 64 hex digits |
| `aptos` | Full 32-byte hexadecimal addresses or special addresses `0x0` through `0xf`; strict canonical AIP-40 mode |
| `near` | 2-64 character account IDs with lowercase letters, numbers, and valid separators; named, implicit, Ethereum-like, deterministic, and universal forms |

`avalanche` covers C-Chain addresses. For additional chains using standard Ethereum addresses, use `evm`; chain-specific checksum schemes such as EIP-1191 are outside its scope. For Sei's EVM format, use `evm`; `sei` validates its Bech32 format.

Not supported: Bitcoin/Litecoin regtest HRPs, Litecoin MWEB, XRP X-addresses/destination tags, Cardano addresses longer than 256 characters, Cosmos validator/consensus prefixes, ENS or other name-service resolution. A syntactically valid future witness address is not necessarily spendable under today's consensus rules. Cardano pointer addresses are recognized for compatibility; this does not assert they can be newly created on mainnet. Solana validation does not test curve membership.

## Options and errors

```ts
validateAddress(address, chain, {
  strict: true,
  network: 'mainnet', // 'mainnet' | 'testnet' | 'auto'
  allowTestnet: false,
  allowBurnAddress: false,
});
```

- `strict` defaults to `false`. On EVM, `true` requires the exact EIP-55 capitalization, including the rare valid all-lowercase/all-uppercase checksums. Invalid mixed-case EVM checksums are always rejected. On Aptos, strict mode requires lowercase AIP-40 canonical representation. Other formats always verify their mandatory checksums.
- `network` defaults to `auto`. It filters networks **only when encoded in the address**, currently Bitcoin, Litecoin, Dogecoin, and Cardano. `details.network` is omitted for formats that cannot identify mainnet/testnet. Selecting a network never proves an address belongs to it.
- `allowTestnet: false` rejects identifiable testnet addresses, including when `network: 'testnet'` is also supplied. It is not an on-chain network check.
- `allowBurnAddress` defaults to `false` and controls only the EVM all-zero address. It is not a comprehensive burn-address database. Other reserved/program addresses may be syntactically valid.

`validateAddress` accepts `unknown` input and returns `{ valid: false, error, details: { errorCode } }` for malformed addresses. Outer ASCII spaces are trimmed. Inputs longer than 256 characters, control characters, Unicode, and invisible characters are rejected before decoding. `validateBatch` accepts a readonly array and preserves order. Unsupported chain identifiers throw a descriptive error; use `isSupportedChain(value)` for dynamic user input. `SUPPORTED_CHAINS` is a frozen list.

## Detection

```ts
import { detectBlockchain } from 'validator0x';

// 'bitcoin'
detectBlockchain('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');

// An array of EVM candidates, since the format is shared.
detectBlockchain('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
```

Returns one chain, an array of candidates, or `null`. The optional second argument accepts validation options. Ambiguity also exists between Sui/Aptos, shared UTXO prefixes, and lowercase EVM/NEAR addresses. Detection never chooses the intended network for a transfer. Plain NEAR names such as `root` are omitted from auto-detection to avoid matching arbitrary text; explicit NEAR validation accepts them.

## Formatting

```ts
import { formatAddress, shortenAddress, normalizeAddress } from 'validator0x';

formatAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 'ethereum', {
  checksum: true,
  shorten: true,
}); // '0xd8dA...6045'

shortenAddress('HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k1'); // 'HN7c...T7k1'
normalizeAddress('0xABCD', 'base'); // '0xabcd'
```

Formatting is for display, not validation. Never send to a shortened address. `shortenLength` must be a positive integer; short strings are left intact. The `0x` prefix does not count against the leading character limit. EVM checksum formatting throws on malformed hex instead of returning misleading output. Aptos formatting returns canonical AIP-40 representation. `normalizeAddress` lowercases EVM/Sui/Aptos and preserves case-sensitive encodings.

## Development and verification

```sh
npm ci
npm run check          # lint, type checks, tests, build, differential and packed-consumer checks
npm run test:coverage  # includes crypto and public API; writes .coverage/
npm run benchmark     # measures the existing production build
npm audit
npm pack              # rebuilds and produces a local release archive
```

For maintainers, `npm run prepare:release` runs the release checks and creates the verified archive. See [RELEASING.md on GitHub](https://github.com/Samarth208P/validator0x/blob/main/RELEASING.md) for the dry run, maintainer login, approval, and publication steps. Pushing commits does not publish to npm.

Tests include the complete native witness vectors from [BIP-350](https://bips.dev/350/), Shelley/stake vectors from [CIP-19](https://cips.cardano.org/cip/CIP-19), and EIP-55 checksum cases. Differential checks compare SHA-256 to Node crypto, Keccak-256 to `@noble/hashes`, and Base58/Bech32 to `@scure/base` across block boundaries, address versions, payload lengths, and malformed cases. Reference libraries are development-only dependencies.

Package checks install the actual tarball into a temporary consumer and verify all ESM/CommonJS entrypoints, TypeScript NodeNext/Bundler/legacy resolution, and UMD execution without Node globals. CI runs on Linux and Windows with Node 22, 24, and 26. Local checks do not substitute for executing that CI matrix.

The development-only `minimatch` override selects the patched 11.x release for the lint dependency tree; remove it once upstream ranges include the fix. Runtime consumers do not install it.

See [CHANGELOG.md](./CHANGELOG.md) for migration notes. These checks improve reliability but are not a formal audit or a guarantee of error-free behavior.

## Specification references

Address rules reviewed on **2026-11-13** against [EIP-55](https://eips.ethereum.org/EIPS/eip-55), [TRON accounts](https://developers.tron.network/docs/account), [Sui address requirements](https://www.docs.sui.io/develop/testing-debugging/common-errors), [Aptos AIP-40 SDK documentation](https://aptos-labs.github.io/aptos-rust-sdk/aptos_sdk/types/struct.AccountAddress.html), [NEAR account IDs](https://docs.near.org/protocol/accounts-contracts/account-id), [Cosmos ADR-028](https://github.com/cosmos/cosmos-sdk/blob/main/docs/architecture/adr-028-public-key-addresses.md), and the [Cosmos chain registry](https://github.com/cosmos/chain-registry).

## License

MIT. The CIP-19 fixture source is credited under CC-BY-4.0; see the [CIP-19 source and license](https://cips.cardano.org/cip/CIP-19).
