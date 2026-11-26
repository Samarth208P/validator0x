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
    test.each([...'0123456789abcdef'])('Aptos accepts and formats short and long forms of special address 0x%s', digit => {
        const canonical = '0x' + digit;
        for (const hex of new Set([digit, digit.toUpperCase()])) {
            for (const input of ['0x' + hex, '0x' + hex.padStart(64, '0')]) {
                expect(validateAddress(input, 'aptos').valid).toBe(true);
                expect(validateAddress(input, 'aptos', { strict: true }).valid).toBe(input === canonical);
                expect(formatAddress(' ' + input + ' ', 'aptos')).toBe(canonical);
            }
        }
    });
    test('Aptos keeps the first ordinary address full length and rejects padded short forms', () => {
        const firstOrdinary = '0x' + '10'.padStart(64, '0');
        expect(validateAddress(firstOrdinary, 'aptos', { strict: true }).valid).toBe(true);
        expect(formatAddress(firstOrdinary, 'aptos')).toBe(firstOrdinary);
        for (const input of ['0x10', '0x123', '0x0A', '0XA', 'A', '0xG']) {
            expect(validateAddress(input, 'aptos').valid).toBe(false);
            expect(() => formatAddress(input, 'aptos')).toThrow();
        }
        expect(validateAddress('0xa', 'sui').valid).toBe(false);
    });
    test('Aptos detection and formatting apply canonical case independently of Sui', () => {
        // AIP-40 LONG example with a significant leading zero digit.
        const canonical = '0x043ec2cb158e3569842d537740fd53403e992b9e7349cc5d3dfaa5aff8faaef2';
        const uppercase = '0x' + canonical.slice(2).toUpperCase();
        expect(detectBlockchain(uppercase)).toEqual(['sui', 'aptos']);
        expect(detectBlockchain(uppercase, { strict: true })).toBe('sui');
        expect(formatAddress(uppercase, 'aptos')).toBe(canonical);
        expect(detectBlockchain(canonical, { strict: true })).toEqual(['sui', 'aptos']);
        expect(detectBlockchain('0xA')).toBe('aptos');
        expect(detectBlockchain('0xA', { strict: true })).toBeNull();
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
