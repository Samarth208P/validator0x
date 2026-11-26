import { InputSanitizer } from '../src/security/sanitizer';
import { ValidationError } from '../src/types';
import { AddressValidator, validateAddress } from '../src';

describe('Input Sanitizer', () => {
    test('should pass valid strings', () => {
        const input = 'valid string';
        expect(InputSanitizer.sanitize(input)).toBe(input);
    });

    test('should trim whitespace', () => {
        expect(InputSanitizer.sanitize('  test  ')).toBe('test');
    });

    test('should reject null/undefined', () => {
        expect(() => InputSanitizer.sanitize(null)).toThrow(ValidationError.UNSAFE_INPUT);
        expect(() => InputSanitizer.sanitize(undefined)).toThrow(ValidationError.UNSAFE_INPUT);
    });

    test('should reject non-string types', () => {
        expect(() => InputSanitizer.sanitize(123)).toThrow(ValidationError.UNSAFE_INPUT);
        expect(() => InputSanitizer.sanitize({})).toThrow(ValidationError.UNSAFE_INPUT);
    });

    test('should reject input too long', () => {
        const longString = 'a'.repeat(257);
        expect(() => InputSanitizer.sanitize(longString)).toThrow(ValidationError.UNSAFE_INPUT);
    });

    test('should reject control characters', () => {
        const invalid = 'test\x00String';
        expect(() => InputSanitizer.sanitize(invalid)).toThrow(ValidationError.UNSAFE_INPUT);
    });

    test('validateAddress handles unsafe input', () => {
        const invalid = 'test\x00String';
        const result = validateAddress(invalid, 'ethereum');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Unsafe input detected');
    });

    test('distinguishes safe blank input at the length limit from oversized input', () => {
        expect(validateAddress(' '.repeat(256), 'ethereum').details?.errorCode).toBe(ValidationError.INVALID_LENGTH);
        expect(validateAddress(' '.repeat(257), 'ethereum').details?.errorCode).toBe(ValidationError.UNSAFE_INPUT);
    });

    test('reports errors raised by custom validator implementations', () => {
        class RejectingValidator extends AddressValidator {
            protected validateImplementation(address: string): never {
                throw new Error(address);
            }
        }
        const validator = new RejectingValidator();
        expect(validator.validate(ValidationError.UNSAFE_INPUT)).toEqual(validateAddress(null, 'ethereum'));
        expect(validator.validate('Malformed payload')).toEqual({
            valid: false, error: 'Malformed payload', details: { errorCode: ValidationError.INVALID_FORMAT },
        });
    });
});
