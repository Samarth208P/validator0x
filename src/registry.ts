import { AddressValidator } from './validators/base';
import { EthereumValidator } from './validators/ethereum';
import { EvmValidator } from './validators/evm';
import { BitcoinValidator } from './validators/bitcoin';
import { LitecoinValidator } from './validators/litecoin';
import { DogecoinValidator } from './validators/dogecoin';
import { SolanaValidator } from './validators/solana';
import { RippleValidator } from './validators/ripple';
import { CardanoValidator } from './validators/cardano';
import { TronValidator } from './validators/tron';
import { CosmosValidator } from './validators/cosmos';
import { SuiValidator, AptosValidator } from './validators/move';
import { NearValidator } from './validators/near';
import { BlockchainType, EVM_CHAINS, COSMOS_CHAINS } from './types';

const validators = new Map<BlockchainType, AddressValidator>();
for (const chain of EVM_CHAINS) validators.set(chain, chain === 'ethereum' ? new EthereumValidator() : new EvmValidator(chain));
for (const chain of COSMOS_CHAINS) validators.set(chain, new CosmosValidator(chain));
validators.set('bitcoin', new BitcoinValidator());
validators.set('litecoin', new LitecoinValidator());
validators.set('dogecoin', new DogecoinValidator());
validators.set('solana', new SolanaValidator());
validators.set('ripple', new RippleValidator());
validators.set('cardano', new CardanoValidator());
validators.set('tron', new TronValidator());
validators.set('sui', new SuiValidator());
validators.set('aptos', new AptosValidator());
validators.set('near', new NearValidator());

export const SUPPORTED_CHAINS: readonly BlockchainType[] = Object.freeze([...validators.keys()]);
export function isSupportedChain(chain: unknown): chain is BlockchainType {
    return typeof chain === 'string' && validators.has(chain as BlockchainType);
}
export function getValidator(chain: BlockchainType): AddressValidator {
    const validator = validators.get(chain);
    if (!validator) throw new Error(`Unsupported blockchain: ${String(chain)}`);
    return validator;
}
