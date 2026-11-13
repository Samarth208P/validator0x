export const EVM_CHAINS = Object.freeze([
    'ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism', 'base',
    'evm', 'fantom', 'sonic', 'gnosis', 'celo', 'cronos', 'moonbeam', 'moonriver',
    'zksync', 'linea', 'scroll', 'mantle', 'blast', 'opbnb', 'zora', 'worldchain',
] as const);
export type EvmChain = typeof EVM_CHAINS[number];
export const COSMOS_CHAINS = Object.freeze(['cosmos', 'osmosis', 'celestia', 'injective', 'sei'] as const);
export type CosmosChain = typeof COSMOS_CHAINS[number];
export type BlockchainType = EvmChain | CosmosChain | 'solana' | 'bitcoin' | 'litecoin' | 'dogecoin' | 'cardano' | 'ripple' | 'tron' | 'sui' | 'aptos' | 'near';

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

export interface ValidationOptions {
    strict?: boolean;          // Require exact EIP-55 case for EVM; canonical AIP-40 for Aptos
    network?: 'mainnet' | 'testnet' | 'auto';
    allowTestnet?: boolean;
    allowBurnAddress?: boolean; // Permit the EVM zero address (rejected by default)
}

export interface FormatOptions {
    checksum?: boolean;        // Add EIP-55 checksum
    shorten?: boolean;         // Return shortened format
    shortenLength?: number;    // Characters to show (default: 4)
}

export enum ValidationError {
    INVALID_FORMAT = 'INVALID_FORMAT',
    INVALID_CHECKSUM = 'INVALID_CHECKSUM',
    INVALID_LENGTH = 'INVALID_LENGTH',
    INVALID_CHARACTERS = 'INVALID_CHARACTERS',
    UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
    BURN_ADDRESS = 'BURN_ADDRESS',
    UNSAFE_INPUT = 'UNSAFE_INPUT',
    NETWORK_MISMATCH = 'NETWORK_MISMATCH'
}
