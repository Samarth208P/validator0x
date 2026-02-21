import { validateAddress } from '../src/index';

describe('Dogecoin Validator', () => {
    it('validates correct dogecoin addresses', () => {
        // P2PKH usually start with D
        expect(validateAddress('D59T4ioHyHdJ6SDzpE8mdz7ssh3atQqjiG', 'dogecoin').valid).toBe(true);
        // P2SH usually start with 9 or A
        expect(validateAddress('9rSdBrQzHqvHYy7JcsUDkywaqez3BfbE25', 'dogecoin').valid).toBe(true);
    });

    it('rejects invalid dogecoin addresses', () => {
        expect(validateAddress('D7j12DqYc3vWfbdwTjFj9i7A1R1A4NUKsE', 'dogecoin').valid).toBe(false); // bad checksum
        expect(validateAddress('E7j12DqY', 'dogecoin').valid).toBe(false); // invalid format
        expect(validateAddress('D7', 'dogecoin').valid).toBe(false); // too short

        // Invalid decoded length (e.g. 33 '1's after 'D')
        expect(validateAddress('D11111111111111111111111111111111', 'dogecoin').valid).toBe(false);
    });

    it('formats dogecoin addresses', () => {
        const { DogecoinValidator } = require('../src/validators/dogecoin');
        const validator = new DogecoinValidator();
        const addr = 'D59T4ioHyHdJ6SDzpE8mdz7ssh3atQqjiG';
        expect(validator.format(addr)).toBe(addr);
        expect(validator.format(addr, { shorten: true })).toBe('D59T...qjiG');
    });
});
