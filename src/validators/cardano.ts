import { AddressValidator, formatPlainAddress } from './base';
import { ValidationResult, FormatOptions, ValidationError } from '../types';
import { decodeBase58 } from '../utils/base58';
import { decodeBech32, Bech32Encoding, wordsToBytes } from '../utils/bech32';
import { byronNetwork } from '../utils/byron';

export class CardanoValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        if (/^(addr|stake)(_test)?1/i.test(address)) return this.validateShelley(address);
        try {
            const network = byronNetwork(decodeBase58(address));
            if (network) return { valid: true, blockchain: 'cardano', details: { format: 'byron', network, checksum: true } };
        } catch { /* Invalid Base58 is reported with other malformed addresses. */ }
        return this.invalid();
    }

    private validateShelley(address: string): ValidationResult {
        const decoded = decodeBech32(address, 256);
        const bytes = decoded && wordsToBytes(decoded.data);
        if (!decoded || decoded.encoding !== Bech32Encoding.BECH32 || !bytes?.length) return this.invalid();
        const type = bytes[0] >>> 4;
        const tag = bytes[0] & 15;
        if (tag !== 0 && tag !== 1) return this.invalid();
        const stake = type === 14 || type === 15;
        const hrp = (stake ? 'stake' : 'addr') + (tag === 0 ? '_test' : '');
        if (decoded.hrp !== hrp) return this.invalid();
        let valid = false;
        if (type <= 3) valid = bytes.length === 57;
        else if (type === 6 || type === 7 || stake) valid = bytes.length === 29;
        else if (type === 4 || type === 5) valid = this.validPointer(bytes);
        if (!valid) return this.invalid();
        return { valid: true, blockchain: 'cardano', details: { format: stake ? 'stake' : 'shelley', network: tag === 1 ? 'mainnet' : 'testnet', checksum: true } };
    }

    private validPointer(bytes: Uint8Array): boolean {
        let offset = 29;
        for (let field = 0; field < 3; field++) {
            let value = 0n;
            const start = offset;
            do {
                if (offset >= bytes.length || offset - start >= 10) return false;
                value = (value << 7n) | BigInt(bytes[offset] & 127);
            } while ((bytes[offset++] & 128) !== 0);
            if ((offset - start > 1 && bytes[start] === 128) || value > 0xffffffffffffffffn) return false;
        }
        return offset === bytes.length;
    }

    private invalid(): ValidationResult {
        return { valid: false, error: 'Invalid Cardano address structure, network, or checksum', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }

    format(address: string, options?: FormatOptions): string {
        return formatPlainAddress(address, options, 8);
    }
}
