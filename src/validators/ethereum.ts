import { AddressValidator, formatPlainAddress } from './base';
import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { isHex, stripHexPrefix, addHexPrefix } from '../utils/hex';
import { keccak256 } from '../utils/keccak256';
import { InputSanitizer } from '../security/sanitizer';

export class EthereumValidator extends AddressValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const cleanAddress = stripHexPrefix(address);

        // Check length
        if (cleanAddress.length !== 40) {
            return { valid: false, error: 'Invalid length', details: { errorCode: ValidationError.INVALID_LENGTH } };
        }

        // Check hex
        if (!isHex(cleanAddress)) {
            return { valid: false, error: 'Invalid hex characters', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
        }

        // Burn Address Check
        if (!options?.allowBurnAddress && /^0+$/.test(cleanAddress)) {
            return { valid: false, error: 'Burn address detected', details: { errorCode: ValidationError.BURN_ADDRESS } };
        }

        const checksum = this.isChecksummed(cleanAddress);
        // Mixed-case input always claims a checksum; strict mode also checks uniform case.
        if (options?.strict || (cleanAddress !== cleanAddress.toLowerCase() && cleanAddress !== cleanAddress.toUpperCase())) {
            if (!checksum) {
                return { valid: false, error: 'Invalid checksum', details: { errorCode: ValidationError.INVALID_CHECKSUM } };
            }
        }

        return {
            valid: true,
            blockchain: 'ethereum',
            details: {
                checksum
            }
        };
    }

    format(address: string, options?: FormatOptions): string {
        let formatted = addHexPrefix(InputSanitizer.sanitize(address));

        if (options?.checksum) {
            formatted = this.toChecksumAddress(formatted);
        }

        return formatPlainAddress(formatted, options);
    }

    private isChecksummed(address: string): boolean {
        const clean = stripHexPrefix(address);
        return addHexPrefix(clean) === this.toChecksumAddress(clean);
    }

    private toChecksumAddress(address: string): string {
        const clean = stripHexPrefix(address).toLowerCase();
        if (!/^[0-9a-f]{40}$/.test(clean)) throw new Error('Expected a 20-byte hexadecimal address');
        const hash = keccak256(clean);
        return '0x' + [...clean].map((char, i) => parseInt(hash[i], 16) >= 8 ? char.toUpperCase() : char).join('');
    }
}
