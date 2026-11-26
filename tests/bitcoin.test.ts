import { bech32m } from '@scure/base';
import { validateAddress, BitcoinValidator } from '../src';

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

    describe('Pay to Anchor (BIP-433)', () => {
        test.each([
            ['bc1pfeessrawgf', 'mainnet'],
            ['tb1pfees9rn5nz', 'testnet'],
        ])('recognizes %s as an anchor', (address, network) => {
            for (const input of [address, address.toUpperCase()]) {
                expect(validateAddress(input, 'bitcoin')).toMatchObject({
                    valid: true, details: { format: 'anchor', network, checksum: true },
                });
            }
        });

        test('only labels the exact Bitcoin v1 witness program as an anchor', () => {
            const program = [0x4e, 0x73];
            for (const [chain, prefix, version, bytes] of [
                ['bitcoin', 'bc', 2, program],
                ['bitcoin', 'bc', 1, [0x4e, 0x72]],
                ['bitcoin', 'bc', 1, [...program, 0]],
                ['litecoin', 'ltc', 1, program],
            ] as const) {
                const words = bech32m.toWords(Uint8Array.from(bytes));
                const address = bech32m.encode(prefix, [version, ...words]);
                expect(validateAddress(address, chain)).toMatchObject({ valid: true, details: { format: 'future' } });
            }
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

        test('should reject invalid segwit length', () => {
            expect(validateAddress('bc1qar0srrr7x', 'bitcoin').valid).toBe(false);
        });

        test('should reject invalid length', () => {
            expect(validateAddress('1A', 'bitcoin').valid).toBe(false);
            expect(validateAddress('1111111111111111111111111111111111', 'bitcoin').valid).toBe(false); // invalid dec length
        });

        test('should reject invalid hrp', () => {
            expect(validateAddress('ltc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 'bitcoin').valid).toBe(false);
        });
    });

    describe('Formatting', () => {
        test('formats address correctly', () => {
            const validator = new BitcoinValidator();
            const addr = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
            expect(validator.format(addr)).toBe(addr);
            expect(validator.format(addr, { shorten: true, shortenLength: 4 })).toBe('1A1z...vfNa');
        });
    });
});
