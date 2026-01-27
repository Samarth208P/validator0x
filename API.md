# 📖 API Reference

Detailed documentation for `validator0x` functions and types. All functions are exported from the main entry point.

---

## 🛠️ Main Functions

### `validateAddress`
The core validation engine. It checks if an address is syntactically correct and (optionally) if it matches the blockchain's checksum or network requirements.

```typescript
function validateAddress(
  address: string,
  blockchain: BlockchainType,
  options?: ValidationOptions
): ValidationResult;
```

#### Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `address` | `string` | Yes | The wallet address string to validate. |
| `blockchain` | `BlockchainType` | Yes | One of: `'ethereum'`, `'solana'`, `'bitcoin'`, `'polygon'`. |
| `options` | `ValidationOptions` | No | See [ValidationOptions](#validationoptions) below. |

#### Returns
Returns a [`ValidationResult`](#validationresult) object.

---

### `formatAddress`
Helper function to normalize and prettify addresses. Useful for UI display or database storage.

```typescript
function formatAddress(
  address: string,
  blockchain: BlockchainType,
  options?: FormatOptions
): string;
```

#### Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `address` | `string` | Yes | The address to format. |
| `blockchain` | `BlockchainType` | Yes | The target blockchain. |
| `options` | `FormatOptions` | No | See [FormatOptions](#formatoptions) below. |

---

### `detectBlockchain`
Heuristically identifies potential blockchains for a given address.

```typescript
function detectBlockchain(address: string): BlockchainType[];
```

---

## 🏗️ Types & Interfaces

### `ValidationResult`
| Field | Type | Description |
| :--- | :--- | :--- |
| `valid` | `boolean` | `true` if the address passes all checks. |
| `blockchain` | `BlockchainType` | The chain it was validated against. |
| `error` | `string?` | Human-readable error message (only if `valid: false`). |
| `details` | `object?` | Metadata about the address (see below). |

**`details` Object:**
- `format`: Specific format (e.g., `'segwit'`, `'bech32'`, `'legacy'`).
- `network`: `'mainnet'` or `'testnet'`.
- `checksum`: `boolean` indicating if the checksum is correct.
- `errorCode`: A [`ValidationError`](#validationerror) enum value.

### `ValidationOptions`
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `strict` | `boolean` | `false` | If `true`, fails if EIP-55 checksum is incorrect (ETH/Polygon). |
| `network` | `string` | `'mainnet'` | Enforce specific network validation (if supported). |

### `FormatOptions`
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `checksum` | `boolean` | `true` | Apply EIP-55 casing to Ethereum/Polygon addresses. |
| `shorten` | `boolean` | `false` | Returns truncated address like `0x12...34`. |
| `shortenLength` | `number` | `4` | Number of characters to show at start and end. |

### `ValidationError` (Enum)
Possible values for `details.errorCode`:
- `INVALID_FORMAT`: Incorrect prefix or encoding.
- `INVALID_CHECKSUM`: Checksum verification failed (in strict mode).
- `INVALID_LENGTH`: Address is too short or too long.
- `INVALID_CHARACTERS`: Contains non-hex or invalid base58 characters.
- `UNSUPPORTED_CHAIN`: The requested blockchain is not implemented.
- `BURN_ADDRESS`: Address is a known "zero" or burn address.
- `UNSAFE_INPUT`: Potential injection or invalid string length.
