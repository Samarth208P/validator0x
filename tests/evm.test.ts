import { validateAddress } from '../src/index';

describe('EVM Alias Validators', () => {
    const validAddress = '0x1111111111111111111111111111111111111111';

    it('validates across all EVM aliases', () => {
        expect(validateAddress(validAddress, 'bsc').valid).toBe(true);
        expect(validateAddress(validAddress, 'avalanche').valid).toBe(true);
        expect(validateAddress(validAddress, 'arbitrum').valid).toBe(true);
        expect(validateAddress(validAddress, 'optimism').valid).toBe(true);
        expect(validateAddress(validAddress, 'base').valid).toBe(true);
    });

    it('returns the correct blockchain name in results', () => {
        expect(validateAddress(validAddress, 'bsc').blockchain).toBe('bsc');
        expect(validateAddress(validAddress, 'avalanche').blockchain).toBe('avalanche');
        expect(validateAddress(validAddress, 'arbitrum').blockchain).toBe('arbitrum');
        expect(validateAddress(validAddress, 'optimism').blockchain).toBe('optimism');
        expect(validateAddress(validAddress, 'base').blockchain).toBe('base');
    });
});
