import { formatAddress } from '../src';

describe('Formatters', () => {
    test('should shorten ETH address', () => {
        expect(formatAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum', { shorten: true }))
            .toBe('0xd8dA...6045');
    });

    test('should shorten Solana address', () => {
        expect(formatAddress('HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k1', 'solana', { shorten: true, shortenLength: 5 }))
            .toBe('HN7cA...WT7k1');
    });

    test('should checksum ETH address', () => {
        expect(formatAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 'ethereum', { checksum: true }))
            .toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    });
});

import { normalizeAddress, addChecksum, shortenAddress } from '../src/formatters/index';

describe('Unit Formatters', () => {
    describe('shortenAddress', () => {
        test('should return original if too short', () => {
            expect(shortenAddress('0x123')).toBe('0x123');
        });
        test('should shorten long address', () => {
            expect(shortenAddress('0x1234567890abcdef')).toBe('0x1234...cdef');
        });
    });

    describe('normalizeAddress', () => {
        test('should lowercase ethereum', () => {
            expect(normalizeAddress('0xABCD', 'ethereum')).toBe('0xabcd');
        });
        test('should lowercase polygon', () => {
            expect(normalizeAddress('0xABCD', 'polygon')).toBe('0xabcd');
        });
        test('should keep others as is', () => {
            expect(normalizeAddress('Base58', 'solana')).toBe('Base58');
        });
    });

    describe('addChecksum', () => {
        test('should add checksum for eth', () => {
            expect(addChecksum('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 'ethereum'))
                .toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
        });
        test('should return existing for solana', () => {
            expect(addChecksum('abc', 'solana')).toBe('abc');
        });
    });
});
