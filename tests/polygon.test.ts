import { validateAddress, formatAddress } from '../src';
import { ValidationError } from '../src/types';

describe('Polygon Validator', () => {
    describe('Valid Addresses', () => {
        // Correct EIP-55 checksum
        const checksummed = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'; // MATIC Token address
        const lowercase = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';

        test('should validate correct checksummed address', () => {
            const result = validateAddress(checksummed, 'polygon');

            expect(result.valid).toBe(true);
            expect(result.blockchain).toBe('polygon');
            expect(result.details?.checksum).toBe(true);
        });

        test('should validate lowercase address (non-checksummed)', () => {
            const result = validateAddress(lowercase, 'polygon');

            expect(result.valid).toBe(true);
            expect(result.details?.checksum).toBe(false);
        });
    });

    describe('Invalid Addresses', () => {
        test('should reject invalid checksum in strict mode', () => {
            const invalid = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'.replace('A', 'a');
            const result = validateAddress(invalid, 'polygon', { strict: true });

            expect(result.valid).toBe(false);
            expect(result.details?.errorCode).toBe(ValidationError.INVALID_CHECKSUM);
        });

        test('should reject too short address', () => {
            const result = validateAddress('0x123', 'polygon');
            expect(result.valid).toBe(false);
        });
    });
});
