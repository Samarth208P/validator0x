import { validateAddress, RippleValidator } from '../src/index';

describe('Ripple Validator', () => {
    it('validates correct ripple address', () => {
        // Valid ripple addresses
        expect(validateAddress('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', 'ripple').valid).toBe(true);
        expect(validateAddress('rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn', 'ripple').valid).toBe(true);
    });

    it('rejects invalid ripple address', () => {
        // Missing 'r'
        expect(validateAddress('G1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn', 'ripple').valid).toBe(false);
        // Invalid length
        expect(validateAddress('rPEPPER7kfTD9w2To4', 'ripple').valid).toBe(false);
        // Invalid characters (Ripple base58 doesn't have 0, l, I, O)
        expect(validateAddress('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GD0', 'ripple').valid).toBe(false);
        // Bad checksum (changed last char)
        expect(validateAddress('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDZ', 'ripple').valid).toBe(false);
        // Invalid decoded length (valid ripple chars, passes string length, but wrong byte size)
        expect(validateAddress('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', 'ripple').valid).toBe(false);
    });

    test('formats address correctly', () => {
        const validator = new RippleValidator();
        expect(validator.format('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY')).toBe('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY');
        expect(validator.format('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', { shorten: true })).toBe('rPEP...6GDY');
    });
});
