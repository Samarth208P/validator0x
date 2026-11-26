import { AddressValidator } from './base';
import { COSMOS_CHAINS, CosmosChain, ValidationError, ValidationResult } from '../types';
import { decodeBech32, Bech32Encoding, wordsToBytes } from '../utils/bech32';

const prefixes: Record<CosmosChain, string> = { cosmos: 'cosmos', osmosis: 'osmo', celestia: 'celestia', injective: 'inj', sei: 'sei' };

/** Account addresses only; validator/operator/consensus prefixes are deliberately excluded. */
export class CosmosValidator extends AddressValidator {
    constructor(private readonly chain: CosmosChain = 'cosmos') {
        super();
        if (!COSMOS_CHAINS.includes(chain)) throw new RangeError(`Unsupported Cosmos chain: ${String(chain)}`);
    }

    protected validateImplementation(address: string): ValidationResult {
        const decoded = decodeBech32(address, 90, prefixes[this.chain]);
        if (decoded?.encoding === Bech32Encoding.BECH32) {
            const length = wordsToBytes(decoded.data)?.length;
            if (length === 20 || (length === 32 && this.chain !== 'injective' && this.chain !== 'celestia')) {
                return { valid: true, blockchain: this.chain, details: { format: 'bech32', checksum: true } };
            }
        }
        return { valid: false, error: 'Invalid account prefix, checksum, length, or padding', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }
}
