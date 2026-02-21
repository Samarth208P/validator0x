import { validateBatch } from '../src/index';

describe('Batch Validation', () => {
    const addresses = [
        '0x1111111111111111111111111111111111111111',
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Valid checksum
        '0xd8da6bf26964af9d7eed9e03e53415d37aa9604Z', // Invalid length/char
    ];

    it('validates a batch of addresses', () => {
        const results = validateBatch(addresses, 'ethereum');
        expect(results.length).toBe(3);
        expect(results[0].valid).toBe(true);
        expect(results[1].valid).toBe(true);
        expect(results[2].valid).toBe(false);
    });
});
