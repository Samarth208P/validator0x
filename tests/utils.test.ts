import { encodeBase58, decodeBase58 } from '../src/utils/base58';
import { isHex, stripHexPrefix, addHexPrefix } from '../src/utils/hex';
import { decodeBech32 } from '../src/utils/bech32';
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
        test('should decode correctly', () => {
            // Valid Bitcoin SegWit Address: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
            const address = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
            const decoded = decodeBech32(address);
            expect(decoded).not.toBeNull();
            expect(decoded?.hrp).toBe('bc');
            // Check data length or content if needed, but non-null structure check is enough for basic coverage
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

