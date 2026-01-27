# API Reference

## Functions

### `validateAddress(address, blockchain, options)`

Validates a wallet address for a specific blockchain.

- **Parameters**:
  - `address` (string): The address to validate.
  - `blockchain` ('ethereum' | 'solana' | 'bitcoin' | 'polygon'): Target chain.
  - `options` (ValidationOptions?): Optional configuration.
    - `strict` (boolean): Check checksum strictly if applicable (default: false).
    - `network` ('mainnet' | 'testnet'): Enforce network if applicable.

- **Returns**: `ValidationResult`
  - `valid` (boolean): True if valid.
  - `error` (string?): Error message if invalid.
  - `details` (object?): Additional info (format, network, etc).

### `formatAddress(address, blockchain, options)`

Formats an address (checksum, shorten, normalize).

- **Parameters**:
  - `address` (string)
  - `blockchain` (BlockchainType)
  - `options` (FormatOptions?)
    - `checksum` (boolean): Apply EIP-55 checksum (ETH/Polygon).
    - `shorten` (boolean): Return truncated version (e.g. `0x12...34`).
    - `shortenLength` (number): Number of chars to keep (default: 4).

### `detectBlockchain(address)`

Attempts to identify the blockchain from the address format.

## Types

```typescript
export interface ValidationResult {
  valid: boolean;
  blockchain?: BlockchainType;
  error?: string;
  details?: {
    format?: string;
    network?: 'mainnet' | 'testnet';
    checksum?: boolean;
    errorCode?: ValidationError;
  };
}

export enum ValidationError {
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_CHECKSUM = 'INVALID_CHECKSUM',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_CHARACTERS = 'INVALID_CHARACTERS',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  BURN_ADDRESS = 'BURN_ADDRESS',
  UNSAFE_INPUT = 'UNSAFE_INPUT'
}
```
