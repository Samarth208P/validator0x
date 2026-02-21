import { AddressValidator } from './base';
import { ValidationResult, FormatOptions, ValidationError } from '../types';
import { sha256 } from '../utils/sha256';

// Ripple uses a custom Base58 dictionary
const RIPPLE_ALPHABET = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
const BASE = 58;
const LEADER = RIPPLE_ALPHABET.charAt(0);

const ALPHABET_MAP: { [key: string]: number } = {};
for (let i = 0; i < RIPPLE_ALPHABET.length; i++) {
    ALPHABET_MAP[RIPPLE_ALPHABET.charAt(i)] = i;
}

function decodeRippleBase58(string: string): Uint8Array {
    if (string.length === 0) return new Uint8Array(0);

    let i = 0;
    while (i < string.length && string[i] === LEADER) {
        i++;
    }
    const leaders = i;

    const bytes = [0];

    for (; i < string.length; i++) {
        const char = string[i];
        const value = ALPHABET_MAP[char];
        if (value === undefined) {
            throw new Error(`Invalid Ripple Base58 character: ${char}`);
        }

        for (let j = 0; j < bytes.length; j++) {
            bytes[j] *= BASE;
        }
        bytes[0] += value;

        let carry = 0;
        for (let j = 0; j < bytes.length; ++j) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }
        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    let resultBytes: number[] = [];
    if (string.length !== leaders) {
        resultBytes = bytes.reverse();
    }

    for (let k = 0; k < leaders; k++) {
        resultBytes.unshift(0);
    }

    return new Uint8Array(resultBytes);
}

export class RippleValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        // Ripple addresses always start with 'r'
        if (!address.startsWith('r')) {
            return { valid: false, error: 'Must start with r', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }

        if (address.length < 25 || address.length > 35) {
            return { valid: false, error: 'Invalid length', details: { errorCode: ValidationError.INVALID_LENGTH } };
        }

        try {
            const decoded = decodeRippleBase58(address);
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

            return { valid: true, blockchain: 'ripple' };
        } catch {
            return { valid: false, error: 'Invalid characters', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
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
