import { AddressValidator } from './base';
import { CosmosChain, ValidationError, ValidationResult } from '../types';
import { decodeBech32, Bech32Encoding, wordsToBytes } from '../utils/bech32';

const prefixes: Record<CosmosChain, string> = { cosmos: 'cosmos', osmosis: 'osmo', celestia: 'celestia', injective: 'inj', sei: 'sei' };

/** Account addresses only; validator/operator/consensus prefixes are deliberately excluded. */
export class CosmosValidator extends AddressValidator {
    constructor(private readonly chain: CosmosChain = 'cosmos') { super(); }

    protected validateImplementation(address: string): ValidationResult {
        const decoded = decodeBech32(address);
        const payload = decoded && wordsToBytes(decoded.data);
        const lengths = this.chain === 'injective' || this.chain === 'celestia' ? [20] : [20, 32];
        if (!decoded || decoded.hrp !== prefixes[this.chain] || decoded.encoding !== Bech32Encoding.BECH32 || !payload || !lengths.includes(payload.length)) {
            return { valid: false, error: 'Invalid account prefix, checksum, length, or padding', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }
        return { valid: true, blockchain: this.chain, details: { format: 'bech32', checksum: true } };
    }
}
