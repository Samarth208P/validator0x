import { EthereumValidator } from './validators/ethereum';
import { SolanaValidator } from './validators/solana';
import { BitcoinValidator } from './validators/bitcoin';
import { PolygonValidator } from './validators/polygon';
import { LitecoinValidator } from './validators/litecoin';
import { DogecoinValidator } from './validators/dogecoin';
import { CardanoValidator } from './validators/cardano';
import { RippleValidator } from './validators/ripple';
import { BscValidator, AvalancheValidator, ArbitrumValidator, OptimismValidator, BaseValidator } from './validators/evm';

import { detectBlockchain } from './detectors/chain-detector';
import { shortenAddress, normalizeAddress, addChecksum } from './formatters/index';
import { BlockchainType, ValidationResult, ValidationOptions, FormatOptions } from './types';

import { getValidator } from './registry';
import { assertValidationOptions } from './validators/base';

export function validateAddress(
    address: unknown,
    blockchain: BlockchainType,
    options?: ValidationOptions
): ValidationResult {
    const validator = getValidator(blockchain);
    return validator.validate(address, options);
}

export function validateBatch(
    addresses: readonly unknown[],
    blockchain: BlockchainType,
    options?: ValidationOptions
): ValidationResult[] {
    const validator = getValidator(blockchain);
    // Check options even for an empty batch, so misconfiguration does not depend on the input.
    assertValidationOptions(options);
    // Preserve iterable handling for JavaScript callers outside the typed array API.
    if (!Array.isArray(addresses)) return Array.from(addresses, addr => validator.validate(addr, options));
    const length = addresses.length;
    const results = new Array<ValidationResult>(length);
    for (let index = 0; index < length; index++) {
        const row = Object.prototype.hasOwnProperty.call(addresses, index) ? addresses[index] : undefined;
        results[index] = validator.validate(row, options);
    }
    return results;
}

export function formatAddress(
    address: string,
    blockchain: BlockchainType,
    options?: FormatOptions
): string {
    const validator = getValidator(blockchain);
    return validator.format(address, options);
}

export {
    EthereumValidator,
    SolanaValidator,
    BitcoinValidator,
    PolygonValidator,
    LitecoinValidator,
    DogecoinValidator,
    CardanoValidator,
    RippleValidator,
    BscValidator,
    AvalancheValidator,
    ArbitrumValidator,
    OptimismValidator,
    BaseValidator
};

export { detectBlockchain };
export { shortenAddress, normalizeAddress, addChecksum };
export { ValidationError, EVM_CHAINS, COSMOS_CHAINS } from './types';
export type { BlockchainType, EvmChain, CosmosChain, ValidationResult, ValidationOptions, FormatOptions } from './types';
export { SUPPORTED_CHAINS, isSupportedChain } from './registry';
export { AddressValidator } from './validators/base';
export { EvmValidator } from './validators/evm';
export { TronValidator } from './validators/tron';
export { CosmosValidator } from './validators/cosmos';
export { SuiValidator, AptosValidator } from './validators/move';
export { NearValidator } from './validators/near';
