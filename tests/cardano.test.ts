import { validateAddress, CardanoValidator } from '../src';
import vectors from './fixtures/protocol-vectors.json';

// Published Byron example from CIP-19 (testnet).
const byron = '37btjrVyb4KDXBNC4haBVPCrro8AQPHwvCMp3RFhhSVWwfFmZ6wwzSK6JK1hY6wHNmtrpTf1kdbva8TCneM2YsiXT7mrzT21EacHnPpz5YyUdj64na';
describe('Cardano', () => {
    test('validates a complete Byron envelope and CRC32', () => {
        expect(validateAddress(byron, 'cardano')).toMatchObject({ valid: true, details: { format: 'byron', network: 'testnet' } });
        expect(validateAddress(byron.slice(0, -1) + 'b', 'cardano').valid).toBe(false);
        expect(validateAddress(byron, 'cardano', { network: 'mainnet' }).valid).toBe(false);
    });
    test.each([
        'Ae2tdPwUPEZGvXJ3ebp4LDgBhbxekAH2kqx8Q4Y5aWq9kL2y5X3v7D2GzU5',
        'DdzFFzCqrhtCSZq831x1r9aFh5H1xSZeFzY1HZeZ1R1ZQ9ZeFzY1HZejq831x1r9aFh5H1xSZeFzY1HZeZ1R1ZQ9',
        'Ae2tdPwUPEZGvXJ3ebp',
    ])('rejects fake or truncated Byron strings: %s', address => {
        expect(validateAddress(address, 'cardano').valid).toBe(false);
    });
    test('formats a Cardano address with eight characters by default', () => {
        const address = vectors.cardano[0];
        expect(new CardanoValidator().format(address)).toBe(address);
        expect(new CardanoValidator().format(address, { shorten: true })).toBe(address.slice(0, 8) + '...' + address.slice(-8));
    });
});
