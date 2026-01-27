export type BlockchainType = 'ethereum' | 'solana' | 'bitcoin' | 'polygon';

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
    strict?: boolean;          // Enforce checksum validation
    network?: 'mainnet' | 'testnet' | 'auto';
    allowTestnet?: boolean;
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
    UNSAFE_INPUT = 'UNSAFE_INPUT'
}

export abstract class AddressValidator {
    abstract validate(address: string, options?: ValidationOptions): ValidationResult;
    abstract format(address: string, options?: FormatOptions): string;
}
