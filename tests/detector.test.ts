import { validateAddress, detectBlockchain } from '../src';
import { ValidationError } from '../src/types';

describe('Polygon Validator', () => {
    test('should validate Polygon address', () => {
        const result = validateAddress('0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 'polygon');
        expect(result.valid).toBe(true);
        expect(result.blockchain).toBe('polygon');
    });
});

describe('Chain Detector', () => {
    test('should detect Ethereum', () => {
        expect(detectBlockchain('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe('ethereum');
    });

    test('should detect Solana', () => {
        expect(detectBlockchain('HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k1')).toBe('solana');
    });

    test('should detect Bitcoin Legacy', () => {
        expect(detectBlockchain('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe('bitcoin');
    });

    test('should detect Bitcoin SegWit', () => {
        expect(detectBlockchain('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe('bitcoin');
    });

    test('should return null for unknown', () => {
        expect(detectBlockchain('invalid-address-string')).toBe(null);
    });
});
