import { validateAddress } from '../src';
import { ValidationError } from '../src/types';

describe('Bitcoin Validator', () => {
    describe('Legacy (P2PKH)', () => {
        test('should validate Genesis address', () => {
            const result = validateAddress(
                '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                'bitcoin'
            );
            expect(result.valid).toBe(true);
            expect(result.details?.format).toBe('legacy');
        });
    });

    describe('SegWit (P2WPKH)', () => {
        test('should validate Bech32 address', () => {
            const result = validateAddress(
                'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
                'bitcoin'
            );
            expect(result.valid).toBe(true);
            expect(result.details?.format).toBe('segwit');
        });
    });

    describe('Taproot (P2TR)', () => {
        test('should validate Bech32m address (Taproot)', () => {
            const result = validateAddress(
                'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0',
                'bitcoin'
            );
            expect(result.valid).toBe(true);
            expect(result.details?.format).toBe('taproot');
        });
    });

    describe('Invalid', () => {
        test('should reject invalid Bech32 checksum', () => {
            const result = validateAddress(
                'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdz', // changed q to z
                'bitcoin'
            );
            expect(result.valid).toBe(false);
        });

        test('should reject mixed case Bech32', () => {
            const result = validateAddress(
                'bc1qar0srrR7xfkvy5l643lydnw9re59gtzzwf5mdq',
                'bitcoin'
            );
            expect(result.valid).toBe(false);
        });
    });
});
