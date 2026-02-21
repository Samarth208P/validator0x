import { AddressValidator } from './base';
import { ValidationResult, FormatOptions, ValidationError } from '../types';
import { decodeBase58 } from '../utils/base58';
import { decodeBech32 } from '../utils/bech32';

export class CardanoValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        // 1. Check Shelley Era (Bech32 started with addr1 or addr_test1)
        if (address.startsWith('addr1') || address.startsWith('addr_test1') || address.startsWith('stake1') || address.startsWith('stake_test1')) {
            return this.validateShelley(address);
        }

        // 2. Check Byron Era (Base58, usually starts with A, D, or Ae2)
        if (address.startsWith('A') || address.startsWith('D') || address.startsWith('Ae2')) {
            return this.validateByron(address);
        }

        return { valid: false, error: 'Unknown Cardano format', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }

    private validateShelley(address: string): ValidationResult {
        const decoded = decodeBech32(address);
        if (!decoded) {
            return { valid: false, error: 'Invalid Bech32 encoding', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }

        const validHrps = ['addr', 'addr_test', 'stake', 'stake_test'];
        if (!validHrps.includes(decoded.hrp)) {
            return { valid: false, error: 'Invalid HRP for Cardano', details: { errorCode: ValidationError.UNSUPPORTED_CHAIN } };
        }

        const network = decoded.hrp.includes('test') ? 'testnet' : 'mainnet';

        return { valid: true, blockchain: 'cardano', details: { format: 'shelley', network } };
    }

    private validateByron(address: string): ValidationResult {
        try {
            // Byron addresses use standard Base58 but have a complex CBOR structure.
            // A comprehensive check requires a CBOR parser. 
            // For a lightweight zero-dependency lib, we do a basic Base58 decode + length check.
            const decoded = decodeBase58(address);
            if (decoded.length < 32 || decoded.length > 128) {
                return { valid: false, error: 'Invalid Byron address length', details: { errorCode: ValidationError.INVALID_LENGTH } };
            }

            return { valid: true, blockchain: 'cardano', details: { format: 'byron' } };
        } catch {
            return { valid: false, error: 'Invalid Base58', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
        }
    }

    format(address: string, options?: FormatOptions): string {
        if (options?.shorten) {
            const len = options.shortenLength || 8; // Cardano addresses are long, show 8 chars
            return `${address.slice(0, len)}...${address.slice(-len)}`;
        }
        return address;
    }
}
