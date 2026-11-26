import { bech32 } from '@scure/base';
import { validateAddress, CardanoValidator, ValidationError } from '../src';
import vectors from './fixtures/protocol-vectors.json';

// Published Byron example from CIP-19 (testnet).
const byron = '37btjrVyb4KDXBNC4haBVPCrro8AQPHwvCMp3RFhhSVWwfFmZ6wwzSK6JK1hY6wHNmtrpTf1kdbva8TCneM2YsiXT7mrzT21EacHnPpz5YyUdj64na';
describe('Cardano', () => {
    // Address0 through Address4 from the Byron ledger golden tests (see fixtures/README.md).
    test.each([
        ['Address0', '2RhQhCGqYPDpFgTsnBTbnvPvCwpqAkjwLqQkWpkqXbLRmNxd4xNd262nGsr8JiynyKRUeMLSJ9Ntho9i76uvBTrVXdJJG5yiNLb8frmUe5qX7E', 'mainnet'],
        ['Address1', 'Ae2tdPwUPEZDoUnyXuAgqzhkjNXNJeiZ5nqwprg9sArZmRNjySfJ5uz4FjB', 'mainnet'],
        ['Address2', '2RhQhCGqYPDpeh7hWZC5PsveBT6mdsT5TGN8RyWBGFECyke59YY6XfQPWK1wrPZVErkpS73P52oQG17DN7H72tgiwh8kzxcAzaqoANgRfWk7eX', 'mainnet'],
        ['Address3', 'EqGAuA8vHnP7SX5x2Hfg3RoZ1NBKMXmUD4Xb2cuCUXrUTsjygD2z1m2gqH424vMJqJVd2BjGNVMJPYsHDwyAAAbVhS8vgwxq7SakzaD3nMdx81mX1ftMN32', 'testnet'],
        ['Address4', '2cWKMJemoBajJUiNitJqprhZ3Ladi6QKWwAAnuvvQCmRFZU1xzpsPNCewNRp8zWu5jAm8', 'testnet'],
    ] as const)('decodes ledger fixture %s', (_fixture, address, network) => {
        expect(validateAddress(address, 'cardano', { network })).toMatchObject({
            valid: true, details: { format: 'byron', network, checksum: true },
        });
    });

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

// Re-encode a published CIP-19 vector with a different header byte, keeping its payload.
function withHeader(address: string, header: number): string {
    const { prefix, words } = bech32.decode(address as `${string}1${string}`, 256);
    const bytes = Uint8Array.from(bech32.fromWords(words));
    bytes[0] = header;
    return bech32.encode(prefix, bech32.toWords(bytes), 256);
}

describe('Cardano network tags and network options', () => {
    const mainnetBase = vectors.cardano[0];
    const testnetBase = vectors.cardano[10];

    test('re-encoding the vector with its own header is still valid (control)', () => {
        expect(validateAddress(withHeader(mainnetBase, 0x01), 'cardano').valid).toBe(true);
    });

    test.each([2, 3, 7, 14, 15])('rejects reserved network tag %i in a Shelley header', tag => {
        expect(validateAddress(withHeader(mainnetBase, tag), 'cardano')).toMatchObject({ valid: false, details: { errorCode: ValidationError.INVALID_FORMAT } });
    });

    test('NETWORK_MISMATCH keeps the decoded Cardano network and format', () => {
        expect(validateAddress(testnetBase, 'cardano', { network: 'mainnet' })).toEqual({
            valid: false,
            error: 'Address network does not match the requested network',
            details: { format: 'shelley', network: 'testnet', checksum: true, errorCode: ValidationError.NETWORK_MISMATCH },
        });
        expect(validateAddress(mainnetBase, 'cardano', { network: 'testnet' }).details).toMatchObject({ format: 'shelley', network: 'mainnet', errorCode: ValidationError.NETWORK_MISMATCH });
        expect(validateAddress(byron, 'cardano', { network: 'mainnet' }).details).toMatchObject({ format: 'byron', network: 'testnet', errorCode: ValidationError.NETWORK_MISMATCH });
    });

    test("an explicit network: 'auto' accepts both networks", () => {
        for (const address of [mainnetBase, testnetBase, byron]) {
            expect(validateAddress(address, 'cardano', { network: 'auto' }).valid).toBe(true);
        }
    });
});
