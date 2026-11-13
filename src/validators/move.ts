import { AddressValidator, formatPlainAddress } from './base';
import { FormatOptions, ValidationError, ValidationOptions, ValidationResult } from '../types';

export class SuiValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        return /^0x[0-9a-fA-F]{64}$/.test(address)
            ? { valid: true, blockchain: 'sui', details: { format: 'hex', checksum: false } }
            : { valid: false, error: 'Expected 0x followed by 64 hex digits', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }
}

export class AptosValidator extends AddressValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const long = /^0x[0-9a-fA-F]{64}$/.test(address);
        const special = /^0x[0-9a-f]$/.test(address);
        // AIP-40 special addresses 0x0..0xf are canonical only in SHORT form.
        const canonical = special || (/^0x[0-9a-f]{64}$/.test(address) && !/^0x0{63}[0-9a-f]$/.test(address));
        const valid = options?.strict ? canonical : long || special;
        return valid
            ? { valid: true, blockchain: 'aptos', details: { format: 'hex', checksum: false } }
            : { valid: false, error: 'Invalid Aptos address (AIP-40)', details: { errorCode: ValidationError.INVALID_FORMAT } };
    }

    format(address: string, options?: FormatOptions): string {
        if (!this.validate(address).valid) throw new Error('Invalid Aptos address');
        let canonical = address.trim().toLowerCase();
        if (/^0x0{63}[0-9a-f]$/.test(canonical)) canonical = '0x' + canonical.slice(-1);
        return formatPlainAddress(canonical, options);
    }
}
