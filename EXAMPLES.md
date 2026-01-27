# 🚀 Examples & Use Cases

Practical snippets to get you started with `validator0x`.

---

## 🔹 Basic Validation

Simplest way to check if an address is syntactically correct for a specific chain.

```typescript
import { validateAddress } from 'validator0x';

const result = validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum');

if (result.valid) {
  console.log('Valid Ethereum address!');
  console.log('Checksum correct:', result.details?.checksum);
} else {
  console.error('Error:', result.error);
}
```

---

## 🔹 Strict Checksum Validation

By default, Ethereum validation is lenient with casing. Use `strict: true` to enforce EIP-55 checksums.

```typescript
import { validateAddress } from 'validator0x';

// An all-lowercase address
const addr = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

// Passes by default (format is correct)
validateAddress(addr, 'ethereum').valid; // true

// Fails in strict mode because it's not checksummed
const strictRes = validateAddress(addr, 'ethereum', { strict: true });
console.log(strictRes.valid); // false
console.log(strictRes.details?.errorCode); // 'INVALID_CHECKSUM'
```

---

## 🔹 Formatting & Shortening

Great for displaying addresses in UI components like headers or transaction logs.

```typescript
import { formatAddress } from 'validator0x';

const longAddr = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

// 1. Just apply checksum casing
formatAddress(longAddr, 'ethereum', { checksum: true });
// Result: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

// 2. Shorten for UI
formatAddress(longAddr, 'ethereum', { shorten: true, shortenLength: 4 });
// Result: '0xd8da...6045'
```

---

## 🔹 Bitcoin Support (Multi-format)

`validator0x` recognizes Legacy (P2PKH), SegWit (P2WPKH), and Taproot (P2TR).

```typescript
import { validateAddress } from 'validator0x';

const taproot = 'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0';
const res = validateAddress(taproot, 'bitcoin');

console.log(res.valid); // true
console.log(res.details?.format); // 'taproot'
```

---

## 🔹 Security: Burn Address Detection

Prevents users from accidentally sending funds to common "burn" or "null" addresses.

```typescript
import { validateAddress } from 'validator0x';

const res = validateAddress('0x0000000000000000000000000000000000000000', 'ethereum');

if (!res.valid && res.details?.errorCode === 'BURN_ADDRESS') {
  alert('Warning: This is a burn address!');
}
```

---

## 🔹 Auto-Detection

Not sure which chain the user is using? Use `detectBlockchain`.

```typescript
import { detectBlockchain } from 'validator0x';

const result = detectBlockchain('1KFHE7w8BhaENAswwrosenS5DsYSuMvL9n');
console.log(result); // ['bitcoin']
```
