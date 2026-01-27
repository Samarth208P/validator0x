# Examples

## Ethereum Checksum Validation

```typescript
import { validateAddress } from 'validator0x';

const valid = validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum');
// { valid: true, details: { checksum: true } }

const invalidChecksum = validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'.toLowerCase(), 'ethereum', { strict: true });
// { valid: false, error: 'Invalid checksum' } (If strict mode requires mixed case to be correct)
// Note: All-lowercase is valid in non-strict mode.
```

## Bitcoin Taproot

```typescript
import { validateAddress } from 'validator0x';

const taproot = 'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0';
const res = validateAddress(taproot, 'bitcoin');
console.log(res.details.format); // 'taproot'
```

## Safety Checks

```typescript
import { validateAddress } from 'validator0x';

// Detect Burn Address
const burn = validateAddress('0x0000000000000000000000000000000000000000', 'ethereum');
console.log(burn.valid); // false
console.log(burn.error); // "Burn address detected"
```
