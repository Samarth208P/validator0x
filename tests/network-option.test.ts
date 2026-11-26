import { validateAddress, validateBatch, detectBlockchain, BitcoinValidator, EthereumValidator, CardanoValidator, ValidationError } from '../src';

// BIP-173 testnet vector and the genesis-block mainnet address.
const testnet = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
const mainnet = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
const evm = '0x52908400098527886E0F7030069857D2E4169EE7';
const invalidNetworks = ['foo', 'Mainnet', 'main', '', 1, true, {}];

describe('network option', () => {
    test('rejects object values without calling their conversion methods', () => {
        for (const network of [Object.create(null), { toString() { throw new Error('Unexpected conversion'); } }]) {
            const options = { network } as never;
            expect(() => validateAddress(mainnet, 'bitcoin', options)).toThrow(RangeError);
            expect(() => validateBatch([], 'bitcoin', options)).toThrow(RangeError);
            expect(() => detectBlockchain(null, options)).toThrow(RangeError);
            expect(() => new BitcoinValidator().validate(null, options)).toThrow(RangeError);
        }
    });

    describe.each(invalidNetworks)('invalid value %j', network => {
        const options = { network } as never;

        test('throws from single-address validation on every chain family', () => {
            for (const [address, chain] of [[mainnet, 'bitcoin'], [testnet, 'bitcoin'], [evm, 'ethereum'], [evm, 'base']] as const) {
                expect(() => validateAddress(address, chain, options)).toThrow(RangeError);
            }
        });

        test('throws from direct validators', () => {
            expect(() => new BitcoinValidator().validate(mainnet, options)).toThrow(RangeError);
            expect(() => new EthereumValidator().validate(evm, options)).toThrow(RangeError);
            expect(() => new CardanoValidator().validate('', options)).toThrow(RangeError);
        });

        test('throws from batches, including an empty batch', () => {
            expect(() => validateBatch([mainnet, evm], 'bitcoin', options)).toThrow(RangeError);
            expect(() => validateBatch([], 'bitcoin', options)).toThrow(RangeError);
            expect(() => validateBatch([], 'ethereum', options)).toThrow(RangeError);
        });

        test('throws from detection, including empty, blank and unsafe input', () => {
            for (const input of [mainnet, evm, '', '   ', 'bad\x00input', null, undefined, 42]) {
                expect(() => detectBlockchain(input, options)).toThrow(RangeError);
            }
        });

        test('names the expected values', () => {
            expect(() => validateAddress(mainnet, 'bitcoin', options)).toThrow("expected 'mainnet', 'testnet' or 'auto'");
        });
    });

    test.each([undefined, null, 'auto', 'mainnet', 'testnet'] as const)('accepts %j without throwing on empty input', network => {
        const options = { network } as never;
        expect(validateBatch([], 'bitcoin', options)).toEqual([]);
        expect(detectBlockchain('', options)).toBeNull();
        expect(detectBlockchain(null, options)).toBeNull();
        expect(validateAddress('', 'bitcoin', options).valid).toBe(false);
    });

    test('a real network mismatch still reports NETWORK_MISMATCH with the decoded network', () => {
        expect(validateAddress(testnet, 'bitcoin', { network: 'mainnet' })).toEqual({
            valid: false,
            error: 'Address network does not match the requested network',
            details: { format: 'segwit', network: 'testnet', checksum: true, errorCode: ValidationError.NETWORK_MISMATCH },
        });
        expect(validateAddress(mainnet, 'bitcoin', { network: 'testnet' }).details).toMatchObject({ network: 'mainnet', errorCode: ValidationError.NETWORK_MISMATCH });
        expect(validateBatch([mainnet, testnet], 'bitcoin', { network: 'mainnet' }).map(result => result.details?.errorCode))
            .toEqual([undefined, ValidationError.NETWORK_MISMATCH]);
    });

    test('matching networks and network-less chains still pass', () => {
        expect(validateAddress(mainnet, 'bitcoin', { network: 'mainnet' }).valid).toBe(true);
        expect(validateAddress(testnet, 'bitcoin', { network: 'testnet' }).valid).toBe(true);
        expect(validateAddress(evm, 'ethereum', { network: 'testnet' }).valid).toBe(true);
    });
});
