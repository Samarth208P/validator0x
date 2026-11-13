# Protocol fixtures

`protocol-vectors.json` records the source URLs alongside the data. Fixtures were fetched on 2026-11-13 and are checked in so tests never depend on the network.

- Bitcoin BIP-350, Pieter Wuille: all eight valid and fifteen invalid native witness address vectors. Source: https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki (BSD-2-Clause).
- Cardano CIP-19, the CIP authors: all twenty mainnet/testnet Shelley and stake address vectors. Source: https://github.com/cardano-foundation/CIPs/blob/master/CIP-0019/README.md (CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/). Address strings are reproduced without modification; extraction into JSON is the only transformation.
- The Byron fixture in `cardano.test.ts` is the published Byron example from the same CIP-19 document.

Additional malformed cases are generated independently in `scripts/test-differential.mjs` using development-only reference codecs.
