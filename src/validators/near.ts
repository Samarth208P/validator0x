import { AddressValidator } from './base';
import { ValidationError, ValidationResult } from '../types';

export class NearValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        if (address.length < 2 || address.length > 64 || !/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(address)) {
            return { valid: false, error: 'Invalid NEAR account ID', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }
        const implicit = /^[0-9a-f]{64}$/.test(address) || /^0x[0-9a-f]{40}$/.test(address);
        const format = implicit ? 'implicit' : /^0s[0-9a-f]{40}$/.test(address) ? 'deterministic' : /^0u[0-9a-hjkmnp-tv-z]{51}[0g]$/.test(address) ? 'universal' : 'named';
        return { valid: true, blockchain: 'near', details: { format, checksum: false } };
    }
}
