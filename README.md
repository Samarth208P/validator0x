# validator0x

A production-ready, zero-dependency wallet address validator and formatter for **Ethereum**, **Solana**, **Bitcoin**, and **Polygon**.

## Features

- **Multi-Chain Support**: Validates addresses for Ethereum (EIP-55), Solana (Base58), Bitcoin (Legacy, SegWit, Taproot), and Polygon.
- **Zero Dependencies**: Lightweight and secure. All cryptographic primitives (Keccak-256, Base58, Bech32) are implemented internally.
- **Security Focused**: 
  - Input sanitization against control characters and length attacks.
  - Burn address detection (e.g., `0x00...00` or System Programs).
- **Comprehensive Formatting**: Checksumming, lowercasing, and safe shortening.
- **TypeScript First**: Full type definitions included.

## Installation

```bash
npm install validator0x
```

## Usage

```typescript
import { validateAddress, formatAddress, detectBlockchain } from 'validator0x';

// 1. Validation
const result = validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum');
if (result.valid) {
  console.log('Valid Address!', result.details);
} else {
  console.error('Invalid:', result.error); // e.g. "Invalid checksum"
}

// 2. Formatting
const formatted = formatAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 'ethereum', { 
  checksum: true, 
  shorten: true 
});
console.log(formatted); // "0xd8dA...6045"

// 3. Auto-Detection
const chain = detectBlockchain('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
console.log(chain); // "bitcoin"
```

## Supported Chains

- **Ethereum**: 0x-prefixed, 40-char hex. Supports EIP-55.
- **Solana**: Base58 encoded, 32-44 chars.
- **Bitcoin**: 
  - Legacy (P2PKH): Starts with `1`.
  - SegWit (P2WPKH): Starts with `bc1q`.
  - Taproot (P2TR): Starts with `bc1p`.
- **Polygon**: Same as Ethereum validation rules.

## Development

```bash
npm install
npm test
npm run build
```

## Contributing

We welcome contributions! Please follow these steps to set up your development environment:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Samarth208P/validator0x.git
    cd validator0x
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # Note: We use dev-dependencies for testing and building. 
    # The core package is zero-dependency.
    ```

3.  **Run Tests**:
    ```bash
    npm test
    # Run specific test file
    npx jest tests/ethereum.test.ts
    ```

4.  **Lint & Format**:
    ```bash
    npm run lint
    npm run format
    ```

5.  **Build**:
    ```bash
    npm run build
    # Output will be in /dist
    ```

## License

MIT
