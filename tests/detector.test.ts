import { validateAddress, detectBlockchain } from '../src';

describe('Polygon Validator', () => {
    test('should validate Polygon address', () => {
        const result = validateAddress('0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 'polygon');
        expect(result.valid).toBe(true);
        expect(result.blockchain).toBe('polygon');
    });
});

describe('Chain Detector', () => {
    test('should detect Ethereum and EVM chains', () => {
        expect(detectBlockchain('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toEqual(['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism', 'base']);
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

    test('should detect Ripple', () => {
        expect(detectBlockchain('rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn')).toBe('ripple');
    });

    test('should detect Cardano', () => {
        expect(detectBlockchain('Ae2tdPwUPEZGvXJ3ebp4LDgBhbxekAH2kqx8Q4Y5aWq9kL2y5X3v7D2GzU5')).toBe('cardano');
    });

    test('should detect Litecoin', () => {
        expect(detectBlockchain('LVg2kJoFNg45Nbpy53h7Fe1wKyeXVRhMH9')).toBe('litecoin');
    });

    test('should detect Dogecoin', () => {
        expect(detectBlockchain('D59T4ioHyHdJ6SDzpE8mdz7ssh3atQqjiG')).toBe('dogecoin');
    });

    test('should return null for unknown', () => {
        expect(detectBlockchain('invalid-address-string')).toBe(null);
    });
});
