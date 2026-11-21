import { detectBlockchain, EVM_CHAINS, validateAddress, validateBatch } from '../src';

describe('EVM address prefixes', () => {
    // After stripping one prefix, the remaining 40 characters still contain an x.
    const repeatedPrefix = '0x0x' + '1'.repeat(38);
    const checksummed = '0x52908400098527886E0F7030069857D2E4169EE7';

    test.each(EVM_CHAINS)('%s rejects a repeated prefix with default options', chain => {
        expect(validateAddress(repeatedPrefix, chain).valid).toBe(false);
    });

    test('detection finds no candidate for the repeated prefix', () => {
        expect(detectBlockchain(repeatedPrefix)).toBeNull();
    });

    test('batch validation accepts either supported spelling and rejects a repeated prefix', () => {
        const inputs = [checksummed, repeatedPrefix, checksummed.slice(2)];
        for (const options of [undefined, { strict: true }]) {
            expect(validateBatch(inputs, 'ethereum', options).map(result => result.valid))
                .toEqual([true, false, true]);
        }
    });
});
