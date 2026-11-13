import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { InputSanitizer } from '../security/sanitizer';

export abstract class AddressValidator {
    /**
     * Validates an address.
     * @param address - The address string to validate
     * @param options - Validation options
     */
    public validate(address: unknown, options?: ValidationOptions): ValidationResult {
        try {
            // Security: Sanitize input first
            const safeAddress = InputSanitizer.sanitize(address);

            // Perform validation on sanitized input
            const result = this.validateImplementation(safeAddress, options);
            const network = result.details?.network;
            if (result.valid && network && (
                (options?.network && options.network !== 'auto' && options.network !== network) ||
                (options?.allowTestnet === false && network === 'testnet')
            )) {
                return { valid: false, error: 'Address network does not match the requested network', details: { ...result.details, errorCode: ValidationError.NETWORK_MISMATCH } };
            }
            return result;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            if (message === ValidationError.UNSAFE_INPUT) {
                return { valid: false, error: 'Unsafe input detected', details: { errorCode: ValidationError.UNSAFE_INPUT } };
            }
            return { valid: false, error: message, details: { errorCode: ValidationError.INVALID_FORMAT } };
        }
    }

    protected abstract validateImplementation(address: string, options?: ValidationOptions): ValidationResult;
    public format(address: string, options?: FormatOptions): string {
        return formatPlainAddress(address, options);
    }
}

export function formatPlainAddress(address: string, options?: FormatOptions, defaultLength = 4): string {
    const safe = InputSanitizer.sanitize(address);
    if (!options?.shorten) return safe;
    const length = options.shortenLength ?? defaultLength;
    if (!Number.isSafeInteger(length) || length < 1) throw new RangeError('shortenLength must be a positive integer');
    const prefix = safe.startsWith('0x') ? 2 : 0;
    if (safe.length <= length * 2 + prefix + 3) return safe;
    return `${safe.slice(0, length + prefix)}...${safe.slice(-length)}`;
}
