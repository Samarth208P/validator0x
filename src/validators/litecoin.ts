import { AddressValidator } from './base';
import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { decodeBase58 } from '../utils/base58';
import { decodeBech32, Bech32Encoding } from '../utils/bech32';
import { sha256 } from '../utils/sha256';

export class LitecoinValidator extends AddressValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        // 1. Check Legacy or P2SH (Starts with L or M, Base58)
        if (address.startsWith('L') || address.startsWith('M')) {
            return this.validateLegacy(address, options);
        }

        // 2. Check SegWit (Starts with ltc1)
        if (address.toLowerCase().startsWith('ltc1')) {
            return this.validateBech32(address, options);
        }

        return { valid: false, error: 'Unknown format', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }

    private validateLegacy(address: string, options?: ValidationOptions): ValidationResult {
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

            return { valid: true, blockchain: 'litecoin', details: { format: 'legacy' } };
        } catch {
            return { valid: false, error: 'Invalid Base58', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
        }
    }

    private validateBech32(address: string, options?: ValidationOptions): ValidationResult {
        const decoded = decodeBech32(address);
        if (!decoded) {
            return { valid: false, error: 'Invalid Bech32 encoding', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }

        if (decoded.hrp !== 'ltc') {
            return { valid: false, error: 'Invalid HRP', details: { errorCode: ValidationError.UNSUPPORTED_CHAIN } };
        }

        const version = decoded.data[0];

        // MWEB starts with ltc1m (but let's just stick to standard segwit/taproot versions)
        if (version === 0) {
            if (decoded.data.length !== 21 && decoded.data.length !== 33) {
                return { valid: false, error: 'Invalid SegWit program length', details: { errorCode: ValidationError.INVALID_LENGTH } };
            }
            if (decoded.encoding !== Bech32Encoding.BECH32) {
                return { valid: false, error: 'V0 uses Bech32', details: { errorCode: ValidationError.INVALID_FORMAT } };
            }
            return { valid: true, blockchain: 'litecoin', details: { format: 'segwit', network: 'mainnet' } };
        }

        // Taproot equivalent (MWEB/Future)
        if (version >= 1 && version <= 16) {
            if (decoded.encoding !== Bech32Encoding.BECH32M) {
                return { valid: false, error: 'Version 1+ uses Bech32m', details: { errorCode: ValidationError.INVALID_FORMAT } };
            }
            return { valid: true, blockchain: 'litecoin', details: { format: 'future', network: 'mainnet' } };
        }

        return { valid: false, error: 'Invalid witness version' };
    }

    format(address: string, options?: FormatOptions): string {
        if (options?.shorten) {
            const len = options.shortenLength || 4;
            return `${address.slice(0, len)}...${address.slice(-len)}`;
        }
        return address;
    }
}
