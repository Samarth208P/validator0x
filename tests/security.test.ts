import { InputSanitizer } from '../src/security/sanitizer';
import { ValidationError } from '../src/types';
import { validateAddress } from '../src';

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

    test('sanitizes input before validation', () => {
        const invalid = 'test\x00String';
        const result = validateAddress(invalid, 'ethereum');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Unsafe input detected');
    });
});
