import { createHash } from 'node:crypto';
import { validateAddress, validateBatch, detectBlockchain, formatAddress, addChecksum, normalizeAddress, shortenAddress, EVM_CHAINS, SUPPORTED_CHAINS, isSupportedChain, ValidationError } from '../src';
import { sha256 } from '../src/utils/sha256';
import { encodeBase58, decodeBase58 } from '../src/utils/base58';
import { decodeBech32, wordsToBytes } from '../src/utils/bech32';
import vectors from './fixtures/protocol-vectors.json';
import { PolygonValidator, BscValidator, AvalancheValidator, ArbitrumValidator, OptimismValidator, BaseValidator, EvmValidator, CosmosValidator } from '../src';

describe('Protocol regressions', () => {
    test.each(vectors.bitcoinValid)('accepts BIP-350 vector %s', address => {
        expect(validateAddress(address, 'bitcoin').valid).toBe(true);
    });
    test.each(vectors.bitcoinInvalid)('rejects BIP-350 vector %s', address => {
        expect(validateAddress(address, 'bitcoin').valid).toBe(false);
    });
    test.each(vectors.cardano)('accepts CIP-19 vector %s', address => {
        expect(validateAddress(address, 'cardano').valid).toBe(true);
        expect(validateAddress(address.toUpperCase(), 'cardano').valid).toBe(true);
        expect(validateAddress(address.slice(0, -1) + (address.endsWith('q') ? 'p' : 'q'), 'cardano').valid).toBe(false);
    });
    test.each([0, 1, 20, 21, 32, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129, 255, 256, 1024])('SHA-256 matches Node at length %d', length => {
        const bytes = Uint8Array.from({ length }, (_, i) => i & 255);
        expect(Buffer.from(sha256(bytes)).toString('hex')).toBe(createHash('sha256').update(bytes).digest('hex'));
    });
    test.each([0, 1, 2, 20, 32])('round-trips %d zero bytes', length => {
        const bytes = new Uint8Array(length);
        expect(encodeBase58(bytes)).toBe('1'.repeat(length));
        expect(decodeBase58(encodeBase58(bytes))).toEqual(bytes);
    });
    test('rejects invalid Bech32 HRPs and padding', () => {
        for (const str of ['\x201xj0phk', '\x7f1g6xzxy', '\x801vctc34', 'an84characterslonghumanreadablepartthatcontainsthetheexcludedcharactersbioandnumber11d6pts4']) expect(decodeBech32(str)).toBeNull();
        expect(wordsToBytes([0])).toBeNull();
        expect(wordsToBytes([0, 1])).toBeNull();
        expect(wordsToBytes([32])).toBeNull();
    });
});

describe('Public API safety and options', () => {
    const eth = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    test.each([PolygonValidator, BscValidator, AvalancheValidator, ArbitrumValidator, OptimismValidator, BaseValidator, EvmValidator])('retains standalone validator behavior: %p', Constructor => {
        const validator = new Constructor();
        expect(validator.validate(eth, { strict: true }).valid).toBe(true);
        expect(validator.validate(eth.toLowerCase(), { strict: true }).valid).toBe(false);
        expect(validator.validate('not an address').valid).toBe(false);
    });
    test('constructs the default Cosmos Hub validator', () => {
        const validator = new CosmosValidator();
        expect(validator.validate('not an address').valid).toBe(false);
    });
    test.each(EVM_CHAINS)('enforces checksum options on %s', chain => {
        expect(validateAddress(eth, chain, { strict: true }).valid).toBe(true);
        expect(validateAddress(eth.toLowerCase(), chain, { strict: true }).details?.errorCode).toBe(ValidationError.INVALID_CHECKSUM);
        expect(validateAddress(eth.toLowerCase(), chain).valid).toBe(true);
        expect(validateAddress(eth, chain).blockchain).toBe(chain);
        expect(validateAddress(eth, chain).details?.network).toBeUndefined();
        expect(addChecksum(eth.toLowerCase(), chain)).toBe(eth);
        expect(normalizeAddress(eth, chain)).toBe(eth.toLowerCase());
    });
    test('strict mode accepts EIP-55 vectors that happen to be uniform case', () => {
        for (const address of ['0x52908400098527886E0F7030069857D2E4169EE7', '0xde709f2102306220921060314715629080e2fb77']) expect(validateAddress(address, 'ethereum', { strict: true }).valid).toBe(true);
    });
    test('network policy applies to individually encoded networks and batches', () => {
        const testnet = vectors.bitcoinValid[1];
        expect(validateAddress(testnet, 'bitcoin', { network: 'testnet' }).valid).toBe(true);
        expect(validateAddress(testnet, 'bitcoin', { network: 'mainnet' }).details?.errorCode).toBe(ValidationError.NETWORK_MISMATCH);
        expect(validateAddress(testnet, 'bitcoin', { allowTestnet: false }).valid).toBe(false);
        expect(validateAddress(testnet, 'bitcoin', { network: 'testnet', allowTestnet: false }).valid).toBe(false);
        expect(validateBatch([testnet, vectors.bitcoinValid[0]], 'bitcoin', { network: 'mainnet' }).map(r => r.valid)).toEqual([false, true]);
        expect(validateAddress(vectors.cardano[10], 'cardano', { allowTestnet: false }).valid).toBe(false);
        expect(validateAddress(eth, 'ethereum', { network: 'testnet' }).valid).toBe(true);
    });
    test.each([null, undefined, 42, {}, [], '', '\n' + eth, eth + '\u200b', '\ufeff' + eth, ' '.repeat(10000) + eth])('handles untrusted input without throwing: %p', value => {
        expect(validateAddress(value, 'ethereum').valid).toBe(false);
        expect(detectBlockchain(value)).toBeNull();
    });
    test('rejects prototype names as chain identifiers', () => {
        for (const name of ['__proto__', 'constructor', 'toString', 'unknown']) {
            expect(isSupportedChain(name)).toBe(false);
            // @ts-expect-error JavaScript consumers can pass arbitrary strings.
            expect(() => validateAddress(eth, name)).toThrow('Unsupported blockchain');
        }
        expect(SUPPORTED_CHAINS.every(isSupportedChain)).toBe(true);
        expect(Object.isFrozen(SUPPORTED_CHAINS)).toBe(true);
    });
    test('allows the EVM zero address only by opt-in', () => {
        const zero = '0x' + '0'.repeat(40);
        expect(validateAddress(zero, 'base').valid).toBe(false);
        expect(validateAddress(zero, 'base', { allowBurnAddress: true }).valid).toBe(true);
    });
    test('shortens safely and rejects invalid lengths', () => {
        expect(shortenAddress('abcdefghijklmno')).toBe('abcd...lmno');
        expect(shortenAddress('0x123')).toBe('0x123');
        for (const length of [0, -1, NaN, Infinity, 1.5]) expect(() => formatAddress(eth, 'ethereum', { shorten: true, shortenLength: length })).toThrow(RangeError);
        expect(() => addChecksum('0xxyz', 'ethereum')).toThrow();
    });
});
