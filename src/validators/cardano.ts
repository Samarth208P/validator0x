import { AddressValidator, formatPlainAddress } from './base';
import { ValidationResult, FormatOptions, ValidationError } from '../types';
import { decodeBase58 } from '../utils/base58';
import { decodeBech32, Bech32Encoding, wordsToBytes } from '../utils/bech32';
import { byronNetwork } from '../utils/byron';

// Pointer fields are the slot number, transaction index and certificate index, in order.
const POINTER_LIMITS = [0xffffffff, 0xffff, 0xffff];

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
        for (const limit of POINTER_LIMITS) {
            if (bytes[offset] === 0x80) return false; // Redundant leading zero group.
            let value = 0;
            let byte: number;
            do {
                if (offset >= bytes.length) return false;
                byte = bytes[offset++];
                value = value * 128 + (byte & 127);
                // The preceding value fit in 32 bits, so this step is exact in a JS number.
                if (value > limit) return false;
            } while ((byte & 128) !== 0);
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
