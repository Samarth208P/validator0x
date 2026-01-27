import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { InputSanitizer } from '../security/sanitizer';

export abstract class AddressValidator {
    /**
     * Validates an address.
     * @param address - The address string to validate
     * @param options - Validation options
     */
    public validate(address: string, options?: ValidationOptions): ValidationResult {
        try {
            // Security: Sanitize input first
            const safeAddress = InputSanitizer.sanitize(address);

            // Perform validation on sanitized input
            return this.validateImplementation(safeAddress, options);
        } catch (error: any) {
            if (error.message === ValidationError.UNSAFE_INPUT) {
                return { valid: false, error: 'Unsafe input detected', details: { errorCode: ValidationError.UNSAFE_INPUT } };
            }
            return { valid: false, error: error.message };
        }
    }

    protected abstract validateImplementation(address: string, options?: ValidationOptions): ValidationResult;
    public abstract format(address: string, options?: FormatOptions): string;
}
