import { AddressValidator } from './base';
import { ValidationResult, FormatOptions, ValidationError } from '../types';
import { decodeBase58 } from '../utils/base58';
import { sha256 } from '../utils/sha256';

export class DogecoinValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        // Dogecoin P2PKH starts with D, P2SH starts with 9 or A
        if (!address.startsWith('D') && !address.startsWith('9') && !address.startsWith('A')) {
            return { valid: false, error: 'Unknown format', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }

        if (address.length < 26 || address.length > 35) {
            return { valid: false, error: 'Invalid length', details: { errorCode: ValidationError.INVALID_LENGTH } };
        }

        try {
            const decoded = decodeBase58(address);
            if (decoded.length !== 25) {
                return { valid: false, error: 'Invalid decoded length', details: { errorCode: ValidationError.INVALID_LENGTH } };
            }

            // Checksum Validation
            const payload = decoded.slice(0, 21);
            const checksum = decoded.slice(21);
            const hash1 = sha256(payload);
            const hash2 = sha256(hash1);

            if (hash2[0] !== checksum[0] || hash2[1] !== checksum[1] || hash2[2] !== checksum[2] || hash2[3] !== checksum[3]) {
                return { valid: false, error: 'Invalid checksum', details: { errorCode: ValidationError.INVALID_CHECKSUM } };
            }

            return { valid: true, blockchain: 'dogecoin', details: { format: 'legacy' } };
        } catch {
            return { valid: false, error: 'Invalid Base58', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
        }
    }

    format(address: string, options?: FormatOptions): string {
        if (options?.shorten) {
            const len = options.shortenLength || 4;
            return `${address.slice(0, len)}...${address.slice(-len)}`;
        }
        return address;
    }
}
