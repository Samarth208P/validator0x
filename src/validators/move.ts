import { AddressValidator, formatPlainAddress } from './base';
import { FormatOptions, ValidationError, ValidationOptions, ValidationResult } from '../types';

const FULL_ADDRESS = /^0x[0-9a-fA-F]{64}$/;
const SHORT_SPECIAL = /^0x[0-9a-fA-F]$/;
// On a valid full address this prefix leaves exactly one hex digit.
const LONG_SPECIAL_PREFIX = '0x' + '0'.repeat(63);

export class SuiValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        return FULL_ADDRESS.test(address)
            ? { valid: true, blockchain: 'sui', details: { format: 'hex', checksum: false } }
            : { valid: false, error: 'Expected 0x followed by 64 hex digits', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }
}

export class AptosValidator extends AddressValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const shape = address.length === 3 ? SHORT_SPECIAL : FULL_ADDRESS;
        const valid = shape.test(address) && (!options?.strict ||
            (!/[A-F]/.test(address) && !address.startsWith(LONG_SPECIAL_PREFIX)));
        return valid
            ? { valid: true, blockchain: 'aptos', details: { format: 'hex', checksum: false } }
            : { valid: false, error: 'Invalid Aptos address (AIP-40)', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }

    format(address: string, options?: FormatOptions): string {
        if (!this.validate(address).valid) throw new Error('Invalid Aptos address');
        let canonical = address.trim().toLowerCase();
        if (canonical.startsWith(LONG_SPECIAL_PREFIX)) canonical = '0x' + canonical.slice(-1);
        return formatPlainAddress(canonical, options);
    }
}
