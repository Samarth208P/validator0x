import { AddressValidator } from './base';
import { ValidationError, ValidationResult } from '../types';
import { decodeBase58Check } from '../utils/base58check';

export class TronValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        if (/^41[0-9a-fA-F]{40}$/.test(address)) {
            return { valid: true, blockchain: 'tron', details: { format: 'hex', checksum: false } };
        }
        const payload = address.length === 34 && address.startsWith('T') ? decodeBase58Check(address) : null;
        if (!payload || payload.length !== 21 || payload[0] !== 0x41) {
            return { valid: false, error: 'Invalid TRON address', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }
        return { valid: true, blockchain: 'tron', details: { format: 'base58check', checksum: true } };
    }
}
