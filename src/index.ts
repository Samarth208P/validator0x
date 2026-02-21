import { EthereumValidator } from './validators/ethereum';
import { SolanaValidator } from './validators/solana';
import { BitcoinValidator } from './validators/bitcoin';
import { PolygonValidator } from './validators/polygon';
import { LitecoinValidator } from './validators/litecoin';
import { DogecoinValidator } from './validators/dogecoin';
import { CardanoValidator } from './validators/cardano';
import { RippleValidator } from './validators/ripple';
import { BscValidator, AvalancheValidator, ArbitrumValidator, OptimismValidator, BaseValidator } from './validators/evm';

import { AddressValidator } from './validators/base';
import { detectBlockchain } from './detectors/chain-detector';
import { shortenAddress, normalizeAddress, addChecksum } from './formatters/index';
import { BlockchainType, ValidationResult, ValidationOptions, FormatOptions, ValidationError } from './types';

const validators: Record<BlockchainType, AddressValidator> = {
    ethereum: new EthereumValidator(),
    solana: new SolanaValidator(),
    bitcoin: new BitcoinValidator(),
    polygon: new PolygonValidator(),
    litecoin: new LitecoinValidator(),
    dogecoin: new DogecoinValidator(),
    cardano: new CardanoValidator(),
    ripple: new RippleValidator(),
    bsc: new BscValidator(),
    avalanche: new AvalancheValidator(),
    arbitrum: new ArbitrumValidator(),
    optimism: new OptimismValidator(),
    base: new BaseValidator()
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

export function validateBatch(
    addresses: string[],
    blockchain: BlockchainType,
    options?: ValidationOptions
): ValidationResult[] {
    const validator = validators[blockchain];
    if (!validator) {
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
    return addresses.map(addr => validator.validate(addr, options));
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
export type { BlockchainType, ValidationResult, ValidationOptions, FormatOptions, ValidationError };
