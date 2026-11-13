import { validateAddress, detectBlockchain, formatAddress, SUPPORTED_CHAINS } from '../src';

describe('Additional chain families', () => {
    test('TRON accepts the published hex and Base58Check pair', () => {
        for (const address of ['418840E6C55B9ADA326D211D818C34A994AECED808', 'TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL']) {
            expect(validateAddress(address, 'tron').valid).toBe(true);
            expect(detectBlockchain(address)).toBe('tron');
        }
        for (const address of ['TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeM', '408840E6C55B9ADA326D211D818C34A994AECED808', '0x418840E6C55B9ADA326D211D818C34A994AECED808']) expect(validateAddress(address, 'tron').valid).toBe(false);
    });
    test('Sui and Aptos require full length for ordinary addresses and report ambiguity', () => {
        const address = '0x' + 'ab'.repeat(32);
        expect(validateAddress(address, 'sui').valid).toBe(true);
        expect(validateAddress(address, 'aptos').valid).toBe(true);
        expect(detectBlockchain(address)).toEqual(['sui', 'aptos']);
        for (const chain of ['sui', 'aptos'] as const) {
            expect(validateAddress('0x' + 'ab'.repeat(31), chain).valid).toBe(false);
            expect(validateAddress('0x' + 'ab'.repeat(33), chain).valid).toBe(false);
            expect(validateAddress('0x' + 'gg'.repeat(32), chain).valid).toBe(false);
        }
    });
    test('Aptos canonical special addresses follow AIP-40', () => {
        const long = '0x' + '0'.repeat(63) + 'a';
        expect(validateAddress('0xa', 'aptos', { strict: true }).valid).toBe(true);
        expect(validateAddress(long, 'aptos').valid).toBe(true);
        expect(validateAddress(long, 'aptos', { strict: true }).valid).toBe(false);
        expect(validateAddress('0x123', 'aptos').valid).toBe(false);
        expect(validateAddress('0xa', 'sui').valid).toBe(false);
        expect(formatAddress(long, 'aptos')).toBe('0xa');
    });
    test.each(['alice.near', 'sub.account.testnet', 'alice-bob_123.near', 'a'.repeat(64), '0x' + 'b'.repeat(40), 'root'])('validates NEAR account ID %s', address => {
        expect(validateAddress(address, 'near').valid).toBe(true);
        expect(validateAddress(address, 'near').details?.network).toBeUndefined();
    });
    test.each(['a', 'a'.repeat(65), 'Alice.near', '.alice', 'alice.', 'alice..near', 'alice-_near', 'alice@near'])('rejects malformed NEAR account ID %s', address => {
        expect(validateAddress(address, 'near').valid).toBe(false);
    });
    test('detection does not guess chains from plain names', () => {
        expect(detectBlockchain('root')).toBeNull();
        expect(detectBlockchain('alice.near')).toBe('near');
        expect(detectBlockchain('0x' + 'b'.repeat(40))).toEqual(expect.arrayContaining(['ethereum', 'near']));
    });
    test('recognizes current NEAR deterministic and universal formats', () => {
        const deterministic = '0sfa485e3a3e4d6c4ab18b2df9f26631f1485f13c0';
        const universal = '0uvjkhh8nsdtth98wq1k8hka97gw9e0yvga4a4th3vj0jqwa91y4yg';
        expect(validateAddress(deterministic, 'near').details?.format).toBe('deterministic');
        expect(validateAddress(universal, 'near').details?.format).toBe('universal');
        expect(detectBlockchain(deterministic)).toBe('near');
        expect(detectBlockchain(universal)).toBe('near');
    });
    test('every supported chain rejects empty and oversized inputs', () => {
        for (const chain of SUPPORTED_CHAINS) {
            expect(validateAddress('', chain).valid).toBe(false);
            expect(validateAddress('a'.repeat(257), chain).valid).toBe(false);
        }
    });
});
