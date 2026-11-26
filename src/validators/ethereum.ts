import { AddressValidator, formatPlainAddress } from './base';
import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { isHex, stripHexPrefix, addHexPrefix } from '../utils/hex';
import { keccak256 } from '../utils/keccak256';
import { InputSanitizer } from '../security/sanitizer';

/** Apply EIP-55 capitalization to a validated, unprefixed 20-byte hex string. */
function checksumBody(hex: string): string {
    if (/^[0-9]+$/.test(hex)) return hex;
    const lower = hex.toLowerCase();
    const hash = keccak256(lower);
    let result = '';
    // Hex digest characters '8' through 'f' have character codes >= 56.
    for (let i = 0; i < lower.length; i++) result += hash.charCodeAt(i) >= 56 ? lower[i].toUpperCase() : lower[i];
    return result;
}

export class EthereumValidator extends AddressValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const cleanAddress = stripHexPrefix(address);

        // Check length
        if (cleanAddress.length !== 40) {
            return { valid: false, error: 'Invalid length', details: { errorCode: ValidationError.INVALID_LENGTH } };
        }

        // Check hex
        if (!isHex(address)) {
            return { valid: false, error: 'Invalid hex characters', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
        }

        // Burn Address Check
        if (!options?.allowBurnAddress && /^0+$/.test(cleanAddress)) {
            return { valid: false, error: 'Burn address detected', details: { errorCode: ValidationError.BURN_ADDRESS } };
        }

        const checksum = cleanAddress === checksumBody(cleanAddress);
        // Mixed-case input always claims a checksum; strict mode also checks uniform case.
        if (!checksum && (options?.strict || (cleanAddress !== cleanAddress.toLowerCase() && cleanAddress !== cleanAddress.toUpperCase()))) {
            return { valid: false, error: 'Invalid checksum', details: { errorCode: ValidationError.INVALID_CHECKSUM } };
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
        const safe = InputSanitizer.sanitize(address);
        if (!options?.checksum) return formatPlainAddress(addHexPrefix(safe), options);
        if (!isHex(safe, 40)) throw new Error('Expected a 20-byte hexadecimal address');
        return formatPlainAddress('0x' + checksumBody(stripHexPrefix(safe)), options);
    }
}
