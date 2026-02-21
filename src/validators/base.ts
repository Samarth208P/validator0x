import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { InputSanitizer } from '../security/sanitizer';

export abstract class AddressValidator {
    /**
     * Validates an address.
     * @param address - The address string to validate
     * @param options - Validation options
     */
    public validate(address: string, _options?: ValidationOptions): ValidationResult {
        try {
            void _options;
            // Security: Sanitize input first
            const safeAddress = InputSanitizer.sanitize(address);

            // Perform validation on sanitized input
            return this.validateImplementation(safeAddress);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            if (message === ValidationError.UNSAFE_INPUT) {
                return { valid: false, error: 'Unsafe input detected', details: { errorCode: ValidationError.UNSAFE_INPUT } };
            }
            return { valid: false, error: message };
        }
    }

    protected abstract validateImplementation(address: string): ValidationResult;
    public abstract format(address: string, options?: FormatOptions): string;
}
