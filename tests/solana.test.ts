import { validateAddress } from '../src';
import { ValidationError } from '../src/types';

describe('Solana Validator', () => {
    describe('Valid Addresses', () => {
        test('should validate valid Solana address', () => {
            const result = validateAddress(
                'HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k1',
                'solana'
            );
            expect(result.valid).toBe(true);
            expect(result.blockchain).toBe('solana');
        });

        test('should validate system program', () => {
            const systemProgram = '11111111111111111111111111111111'; // 32 chars
            const result = validateAddress(
                systemProgram,
                'solana'
            );
            expect(result.valid).toBe(true);
            expect(result.details?.format).toBe('System Program');
        });
    });

    describe('Invalid Addresses', () => {
        test('should reject too short', () => {
            const result = validateAddress('HN7cAB', 'solana');
            expect(result.valid).toBe(false);
            expect(result.details?.errorCode).toBe(ValidationError.INVALID_LENGTH);
        });

        test('should reject invalid base58 chars', () => {
            const result = validateAddress(
                'HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k0',
                'solana'
            );
            expect(result.valid).toBe(false);
            expect(result.details?.errorCode).toBe(ValidationError.INVALID_FORMAT);
        });
    });
});
