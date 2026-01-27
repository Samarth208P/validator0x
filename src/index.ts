import { EthereumValidator } from './validators/ethereum';
import { SolanaValidator } from './validators/solana';
import { BitcoinValidator } from './validators/bitcoin';
import { PolygonValidator } from './validators/polygon';
import { detectBlockchain } from './detectors/chain-detector';
import { shortenAddress, normalizeAddress, addChecksum } from './formatters/index';
import { BlockchainType, ValidationResult, ValidationOptions, FormatOptions, ValidationError } from './types';

const validators = {
    ethereum: new EthereumValidator(),
    solana: new SolanaValidator(),
    bitcoin: new BitcoinValidator(),
    polygon: new PolygonValidator(),
};

export function validateAddress(
    address: string,
    blockchain: BlockchainType,
    options?: ValidationOptions
): ValidationResult {
    const validator = validators[blockchain];
    if (!validator) {
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
    return validator.validate(address, options);
}

export function formatAddress(
    address: string,
    blockchain: BlockchainType,
    options?: FormatOptions
): string {
    const validator = validators[blockchain];
    if (!validator) {
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
    return validator.format(address, options);
}

export {
    EthereumValidator,
    SolanaValidator,
    BitcoinValidator,
    PolygonValidator
};

export { detectBlockchain };
export { shortenAddress, normalizeAddress, addChecksum };
export type { BlockchainType, ValidationResult, ValidationOptions, FormatOptions, ValidationError };
