# Changelog

## Unreleased

- Cardano Byron validation rejects noncanonical CBOR encodings of the address type, network magic, and encrypted path length.
- Cardano Byron validation accepts variable-length encrypted derivation paths, including the 32-byte paths in the ledger fixtures.
- Bitcoin BIP-433 fee anchors return `details.format === 'anchor'`. Both payment examples reject them as recipients.
- An unsupported `network` option value throws a `RangeError` from validation, batch validation, detection, and validator `validate` methods, before any input is read. Previously it reported `NETWORK_MISMATCH` for addresses that encode a network and was ignored for other chains. `undefined` and `null` still mean `auto`.

## 0.4.0

- JavaScript EVM and Cosmos constructors reject unsupported family identifiers.
- Sparse batches produce an invalid result at each missing index.
- Cardano pointer fields enforce the strict ledger limits for slots and indices.
- Root and family imports share validator classes within each module format. The packed consumer checks exercise a bundled ESM family validator in a real Chrome worker.
- Payment-form examples reject Cardano reward addresses and prefix validated EVM destinations.

## 0.3.0 - 2026-11-13

### Added

- TRON, Cosmos Hub, Osmosis, Celestia, Injective, Sei (Bech32), Sui, Aptos, and NEAR validators.
- Generic EVM support plus Fantom, Sonic, Gnosis, Celo, Cronos, Moonbeam, Moonriver, zkSync, Linea, Scroll, Mantle, Blast, opBNB, Zora, and World Chain identifiers.
- Mainnet/testnet checks for encoded UTXO and Cardano networks; readonly batch input; safe `unknown` address input; `SUPPORTED_CHAINS` and `isSupportedChain`.
- Native ESM/CommonJS exports with declarations for each module system; small family-specific entrypoints; browser UMD distribution; package size budgets.
- Protocol vector, independent codec/crypto, packed consumer, and cross-platform CI checks.

### Fixed

- Validation options now reach every validator. EVM strict mode requires the exact checksum.
- Bitcoin/Litecoin witness programs are converted from five-bit words before checking length; padding, encoding/version combinations, and future witness lengths are validated.
- Base58 address versions are verified, SHA-256 works at block-padding boundaries, and all-zero Base58 encoding round-trips correctly.
- Cardano requires correct headers, payload sizes, prefixes, network tags, and canonical padding; Byron requires a complete CBOR envelope and CRC32 rather than a plausible Base58 length.
- EVM/Solana and other shared-format addresses no longer imply mainnet. Detector results preserve format ambiguity and accept untrusted input safely.
- Unsupported chain names cannot access Object.prototype members. Input limits apply before trimming; control and invisible characters are rejected.
- Normalization and checksum helpers cover every EVM chain. Shortening handles non-EVM prefixes and rejects invalid lengths. The error enum is available at runtime.

### Migration from 0.2.x

- Malformed addresses previously accepted by incomplete checks now fail. Replace fabricated test fixtures with published valid vectors.
- `strict: true` now rejects noncanonical uniform-case EVM input. Use checksum formatting on validated hex if canonical presentation is needed.
- Default network selection is `auto`; testnet UTXO addresses are now recognized. Set `network: 'mainnet'` or `allowTestnet: false` to reject identifiable testnet addresses.
- `details.network` is absent when the address format cannot encode it. Detection may return more candidates; do not depend on a fixed EVM array length or infer chain ownership.
- EVM zero-address rejection remains the default; `allowBurnAddress: true` opts in to syntactic validation.
- Public package imports are described by `exports`. Replace imports into private `dist/` paths with the root or documented family entrypoints.
- Supported Node.js baseline is 22; browsers/workers need ES2020, BigInt, and TextEncoder. Development tools require Node 22.13+ (or 24+).
- Tests now run with Vitest. Coverage is generated in `.coverage/` and includes crypto and the public API. Generated legacy coverage is not used as evidence of current coverage.

Published to the public npm registry with the `latest` tag. Registry integrity matched the approved archive; a fresh registry install passed the CommonJS/ESM entrypoints and agent-instruction discovery checks.
