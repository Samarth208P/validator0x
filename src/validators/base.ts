import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { InputSanitizer } from '../security/sanitizer';

function unsafeInputResult(): ValidationResult {
    return { valid: false, error: 'Unsafe input detected', details: { errorCode: ValidationError.UNSAFE_INPUT } };
}

/**
 * Options come from the caller, not the end user, so a typo fails loudly instead of as NETWORK_MISMATCH.
 * Every public entry point calls this before reading input, so the error does not depend on the data.
 */
export function assertValidationOptions(options?: ValidationOptions): void {
    const network = options?.network;
    if (network != null && network !== 'mainnet' && network !== 'testnet' && network !== 'auto') {
        throw new RangeError("Invalid network option (expected 'mainnet', 'testnet' or 'auto')");
    }
}

export abstract class AddressValidator {
    /**
     * Validates an address.
     * @param address - The address string to validate
     * @param options - Validation options
     */
    public validate(address: unknown, options?: ValidationOptions): ValidationResult {
        assertValidationOptions(options);
        try {
            // Security: Sanitize input first
            const safeAddress = InputSanitizer.trySanitize(address);
            if (safeAddress === null) return unsafeInputResult();

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
                return unsafeInputResult();
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
