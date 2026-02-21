import { validateAddress } from '../src/index';

describe('Litecoin Validator', () => {
    it('validates correct legacy and P2SH addresses', () => {
        // Legacy (L)
        expect(validateAddress('LVg2kJoFNg45Nbpy53h7Fe1wKyeXVRhMH9', 'litecoin').valid).toBe(true);
        // P2SH (M)
        expect(validateAddress('M7uWktm4AttpT71jJco9LVZcTnCT77yGzp', 'litecoin').valid).toBe(true);
    });

    it('validates correct segwit addresses', () => {
        // Segwit (ltc1)
        expect(validateAddress('ltc1qqqgjyv6y24n80zye42aueh0wluqpzg3nfcsa0q', 'litecoin').valid).toBe(true);
    });

    it('rejects invalid litecoin addresses', () => {
        expect(validateAddress('LVg2kJoFNg45Nbpy53h7Fe1wKyeXVRhMH8', 'litecoin').valid).toBe(false); // bad checksum
        expect(validateAddress('ltc1qcxkpm2z7k62h9v2f7qx4p4s8v5c7v5h9y2q4h1', 'litecoin').valid).toBe(false); // bad bech32 checksum
        expect(validateAddress('LV', 'litecoin').valid).toBe(false); // too short
        expect(validateAddress('L11111111111111111111111111111111', 'litecoin').valid).toBe(false); // invalid dec length
        expect(validateAddress('ltc1qcxkpm2z7k62h9v2f7q', 'litecoin').valid).toBe(false); // invalid segwit length

        // V1 (Taproot) requires Bech32m, if we pass Bech32 it fails encoding check
        // We just test format
    });

    it('formats litecoin addresses', () => {
        const { LitecoinValidator } = require('../src/validators/litecoin');
        const validator = new LitecoinValidator();
        const addr = 'LVg2kJoFNg45Nbpy53h7Fe1wKyeXVRhMH9';
        expect(validator.format(addr)).toBe(addr);
        expect(validator.format(addr, { shorten: true, shortenLength: 4 })).toBe('LVg2...hMH9');
    });
});
