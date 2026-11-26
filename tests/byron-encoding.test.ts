import { crc32 } from 'node:zlib';
import { base58 } from '@scure/base';
import { validateAddress, ValidationError } from '../src';

// Keep the 28-byte root from the ledger's Address1 fixture. Recompute the CRC for
// each encoding so the public validator reaches the field under test.
function byronWithFields(attributes: number[], addressType: number[] = [0]): string {
    const root = Buffer.from('aa5372095aaa680d19d4ca496983a145709c3be18b0d4c83cb7bdc5e', 'hex');
    const payload = Buffer.from([0x83, 0x58, root.length, ...root, ...attributes, ...addressType]);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc32(payload));
    return base58.encode(Uint8Array.from([0x82, 0xd8, 0x18, 0x58, payload.length, ...payload, 0x1a, ...checksum]));
}

function byronWithNetworkMagic(encoding: readonly number[]): string {
    return byronWithFields([0xa1, 2, 0x40 + encoding.length, ...encoding]);
}

describe('Byron canonical field encodings', () => {
    test.each([0, 2])('requires a one-byte encoding for address type %i', type => {
        expect(validateAddress(byronWithFields([0xa0], [type]), 'cardano').valid).toBe(true);
        expect(validateAddress(byronWithFields([0xa0], [0x18, type]), 'cardano')).toMatchObject({
            valid: false, details: { errorCode: ValidationError.INVALID_FORMAT },
        });
    });

    test.each([
        [23, [23], [0x18, 23]],
        [24, [0x18, 24], [0x19, 0, 24]],
        [255, [0x18, 255], [0x19, 0, 255]],
        [256, [0x19, 1, 0], [0x1a, 0, 0, 1, 0]],
        [65535, [0x19, 255, 255], [0x1a, 0, 0, 255, 255]],
    ] as const)('requires the shortest encoding for network magic %i', (_value, canonical, overlong) => {
        expect(validateAddress(byronWithNetworkMagic(canonical), 'cardano')).toMatchObject({
            valid: true, details: { network: 'testnet' },
        });
        expect(validateAddress(byronWithNetworkMagic(overlong), 'cardano')).toMatchObject({
            valid: false, details: { errorCode: ValidationError.INVALID_FORMAT },
        });
    });

    test('accepts the first and last canonical four-byte network magic values', () => {
        for (const bytes of [[0, 1, 0, 0], [255, 255, 255, 255]]) {
            const address = byronWithNetworkMagic([0x1a, ...bytes]);
            expect(validateAddress(address, 'cardano')).toMatchObject({ valid: true, details: { network: 'testnet' } });
        }
    });

    test('requires a canonical byte-string length inside the encrypted path attribute', () => {
        expect(validateAddress(byronWithFields([0xa1, 1, 0x42, 0x41, 0xab]), 'cardano').valid).toBe(true);
        expect(validateAddress(byronWithFields([0xa1, 1, 0x43, 0x58, 1, 0xab]), 'cardano').valid).toBe(false);
    });
});
