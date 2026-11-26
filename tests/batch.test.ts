import { validateAddress, validateBatch, ValidationError } from '../src/index';

describe('Batch Validation', () => {
    const addresses = [
        '0x1111111111111111111111111111111111111111',
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Valid checksum
        '0xd8da6bf26964af9d7eed9e03e53415d37aa9604Z', // Invalid length/char
    ];

    it('returns an invalid result for every missing row', () => {
        const rows = new Array<unknown>(3);
        rows[1] = addresses[1];
        const results = validateBatch(rows, 'ethereum');
        expect(results.map(result => result.valid)).toEqual([false, true, false]);
        expect(results.every(result => result.valid)).toBe(false);
    });

    it('validates every array index even if a custom iterator skips rows', () => {
        class FilteredRows extends Array<string> {
            override [Symbol.iterator]() {
                return [this[1]].values();
            }
        }
        const rows = Object.freeze(new FilteredRows(addresses[2], addresses[1]));
        expect(validateBatch(rows, 'ethereum')).toEqual([
            validateAddress(rows[0], 'ethereum'), validateAddress(rows[1], 'ethereum'),
        ]);
    });

    it('treats an unfilled row as missing even when an array subclass supplies a default', () => {
        class DefaultRows extends Array<string> {}
        Object.defineProperty(DefaultRows.prototype, 0, { value: addresses[0] });
        const results = validateBatch(new DefaultRows(1), 'ethereum');
        expect(results[0].details?.errorCode).toBe(ValidationError.UNSAFE_INPUT);
    });

    it('preserves existing iterable behavior for JavaScript callers', () => {
        // @ts-expect-error The public TypeScript API takes readonly arrays.
        const results = validateBatch(new Set(addresses), 'ethereum');
        expect(results).toEqual(addresses.map(address => validateAddress(address, 'ethereum')));
    });

    it('keeps a result for each original index when reading a row changes the array length', () => {
        const rows = [addresses[0], addresses[1]];
        Object.defineProperty(rows, 0, { get() { rows.length = 1; return addresses[0]; } });
        const results = validateBatch(rows, 'ethereum');
        expect(results).toHaveLength(2);
        expect(results[0].valid).toBe(true);
        expect(results[1].details?.errorCode).toBe(ValidationError.UNSAFE_INPUT);
    });

    it('validates a batch of addresses', () => {
        const results = validateBatch(addresses, 'ethereum');
        expect(results.length).toBe(3);
        expect(results[0].valid).toBe(true);
        expect(results[1].valid).toBe(true);
        expect(results[2].valid).toBe(false);
    });
});
