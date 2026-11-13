import { AddressValidator } from './base';
import { BlockchainType, ValidationResult, ValidationError } from '../types';
import { decodeBase58Check } from '../utils/base58check';
import { decodeBech32, Bech32Encoding, wordsToBytes } from '../utils/bech32';

type Network = 'mainnet' | 'testnet';
interface UtxoConfig {
    chain: BlockchainType;
    versions: Readonly<Record<number, Network>>;
    hrps?: Readonly<Record<string, Network>>;
}

/** Shared Base58Check and BIP-173/350 validation; versions are checked after decoding. */
export class UtxoValidator extends AddressValidator {
    constructor(private readonly config: UtxoConfig) { super(); }

    protected validateImplementation(address: string): ValidationResult {
        const hrp = address.toLowerCase().split('1')[0];
        if (this.config.hrps && Object.prototype.hasOwnProperty.call(this.config.hrps, hrp)) {
            return this.validateWitness(address, this.config.hrps[hrp]);
        }
        if (address.length < 26 || address.length > 35) return this.invalid('Invalid address length', ValidationError.INVALID_LENGTH);
        const payload = decodeBase58Check(address);
        if (!payload) return this.invalid('Invalid Base58Check address', ValidationError.INVALID_CHECKSUM);
        if (payload.length !== 21) return this.invalid('Invalid payload length', ValidationError.INVALID_LENGTH);
        const network = this.config.versions[payload[0]];
        if (!network) return this.invalid('Invalid address version');
        return { valid: true, blockchain: this.config.chain, details: { format: 'legacy', network, checksum: true } };
    }

    private validateWitness(address: string, network: Network): ValidationResult {
        const decoded = decodeBech32(address);
        if (!decoded || decoded.data.length === 0) return this.invalid('Invalid Bech32 encoding');
        const version = decoded.data[0];
        const program = wordsToBytes(decoded.data.slice(1));
        if (version > 16) return this.invalid('Invalid witness version');
        if (!program || program.length < 2 || program.length > 40 ||
            (version === 0 && program.length !== 20 && program.length !== 32)) {
            return this.invalid('Invalid witness program or padding', ValidationError.INVALID_LENGTH);
        }
        const expected = version === 0 ? Bech32Encoding.BECH32 : Bech32Encoding.BECH32M;
        if (decoded.encoding !== expected) return this.invalid('Wrong checksum encoding for witness version', ValidationError.INVALID_CHECKSUM);
        const format = version === 0 ? 'segwit' : version === 1 && program.length === 32 ? 'taproot' : 'future';
        return { valid: true, blockchain: this.config.chain, details: { format, network, checksum: true } };
    }

    private invalid(error: string, errorCode = ValidationError.INVALID_FORMAT): ValidationResult {
        return { valid: false, error, details: { errorCode } };
    }
}
