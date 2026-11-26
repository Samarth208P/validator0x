import { keccak_256 } from '@noble/hashes/sha3.js';
import { bech32, bech32m } from '@scure/base';
import { encodeBase58, decodeBase58 } from '../src/utils/base58';
import { isHex, stripHexPrefix, addHexPrefix } from '../src/utils/hex';
import { decodeBech32, wordsToBytes } from '../src/utils/bech32';
import { keccak256 } from '../src/utils/keccak256';
import { sha256 } from '../src/utils/sha256';

describe('Utils', () => {
    describe('Hex', () => {
        test('isHex should return true for valid hex', () => {
            expect(isHex('0x123abc')).toBe(true);
            expect(isHex('123abc')).toBe(true);
        });

        test('isHex should return false for invalid hex', () => {
            expect(isHex('zz')).toBe(false);
        });

        test('stripPrefix should remove 0x', () => {
            expect(stripHexPrefix('0x123')).toBe('123');
            expect(stripHexPrefix('123')).toBe('123');
        });

        test('addPrefix should add 0x', () => {
            expect(addHexPrefix('123')).toBe('0x123');
            expect(addHexPrefix('0x123')).toBe('0x123');
        });
    });

    describe('Base58', () => {
        test('should encode and decode correctly', () => {
            const data = Buffer.from('hello world');
            const encoded = encodeBase58(data);
            const decoded = decodeBase58(encoded);
            expect(Buffer.from(decoded).toString()).toBe('hello world');
        });
    });

    describe('Bech32', () => {
        test('matches the reference byte conversion for every padding length and final word', () => {
            for (let count = 1; count <= 8; count++) {
                const words = Array.from({ length: count }, (_, index) => (index * 11 + 1) & 31);
                for (let last = 0; last < 32; last++) {
                    words[count - 1] = last;
                    expect(wordsToBytes(words)).toEqual(bech32.fromWordsUnsafe(words) ?? null);
                }
            }
            expect(wordsToBytes([])).toEqual(new Uint8Array());
        });

        test.each([
            ['bech32', bech32, 'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4'],
            ['bech32m', bech32m, 'BC1P0XLXVLHEMJA6C4DQV22UAPCTQUPFHLXM9H8Z3K2E72Q4K9HCZ7VQZK5JJ0'],
        ] as const)('decodes the %s BIP-350 vector and rejects Unicode case folding', (encoding, codec, address) => {
            const { prefix, words } = codec.decode(address);
            expect(decodeBech32(address)).toEqual({ hrp: prefix, data: words, encoding });
            expect(decodeBech32(address.replace('K', '\u212a'))).toBeNull();
        });

        test('should return null for invalid bech32', () => {
            expect(decodeBech32('invalid')).toBeNull();
        });
    });

    describe('Keccak256', () => {
        test('should hash string correctly', () => {
            const hash = keccak256('test');
            expect(hash).toBe('9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658');
        });
    });

    describe('Sha256', () => {
        test('should hash buffer correctly', () => {
            // "test" -> 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
            const input = Buffer.from('test');
            const hash = sha256(input);
            expect(Buffer.from(hash).toString('hex')).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
        });
    });
});

describe('Keccak-256', () => {
    test.each([
        ['', 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'],
        ['abc', '4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45'],
    ])('matches the published digest of %j', (input, digest) => {
        expect(keccak256(input)).toBe(digest);
    });

    // 135, 136 and 137 bytes straddle the 136-byte rate; 271-273 straddle the second block.
    test.each([1, 40, 135, 136, 137, 271, 272, 273, 500])('matches @noble/hashes for %i-byte input', length => {
        const input = 'x'.repeat(length);
        expect(keccak256(input)).toBe(Buffer.from(keccak_256(new TextEncoder().encode(input))).toString('hex'));
    });
});
