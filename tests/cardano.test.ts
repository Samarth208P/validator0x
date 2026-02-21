import { validateAddress } from '../src/index';

import { Bech32Encoding } from '../src/utils/bech32';
const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polymod(values: number[]): number {
    let chk = 1;
    const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    for (const v of values) {
        const top = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ v;
        for (let i = 0; i < 5; i++) {
            if ((top >> i) & 1) chk ^= GENERATOR[i];
        }
    }
    return chk;
}
function hrpExpand(hrp: string): number[] {
    const ret: number[] = [];
    for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
    ret.push(0);
    for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
    return ret;
}
function createBech32(hrp: string, programHex: string) {
    const program = [];
    for (let i = 0; i < programHex.length; i += 2) program.push(parseInt(programHex.slice(i, i + 2), 16));
    let val = 0;
    let bits = 0;
    const data5: number[] = [];
    for (let i = 0; i < program.length; i++) {
        val = (val << 8) | program[i];
        bits += 8;
        while (bits >= 5) {
            bits -= 5;
            data5.push((val >> bits) & 31);
        }
    }
    if (bits > 0) {
        data5.push((val << (5 - bits)) & 31);
    }
    const enc = 1; // BECH32
    const values = hrpExpand(hrp).concat(data5).concat([0, 0, 0, 0, 0, 0]);
    const mod = polymod(values) ^ enc;
    const result = [...data5];
    for (let i = 0; i < 6; i++) {
        result.push((mod >> (5 * (5 - i))) & 31);
    }
    return hrp + '1' + result.map(d => BECH32_ALPHABET[d]).join('');
}

const dummyPayload = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011';
const validMainnet = createBech32('addr', dummyPayload);
const validTestnet = createBech32('addr_test', dummyPayload);

describe('Cardano Validator', () => {
    it('validates Shelley addresses', () => {
        // mainnet
        expect(validateAddress(validMainnet, 'cardano').valid).toBe(true);
        // testnet
        expect(validateAddress(validTestnet, 'cardano').valid).toBe(true);
    });

    it('validates Byron addresses', () => {
        expect(validateAddress('Ae2tdPwUPEZGvXJ3ebp4LDgBhbxekAH2kqx8Q4Y5aWq9kL2y5X3v7D2GzU5', 'cardano').valid).toBe(true);
        expect(validateAddress('DdzFFzCqrhtCSZq831x1r9aFh5H1xSZeFzY1HZeZ1R1ZQ9ZeFzY1HZejq831x1r9aFh5H1xSZeFzY1HZeZ1R1ZQ9', 'cardano').valid).toBe(true);
    });

    it('rejects invalid cardano addresses', () => {
        expect(validateAddress('addr1qxyxps5q8vquk0xyed9k4w0eunv3c8hsnmxgf7th8qf5lqy4xgj970e4e7h886g8e27csh0lssn35n9p2r8m0xptz8cs22gexk', 'cardano').valid).toBe(false); // bad checksum / chars
        expect(validateAddress('Ae2tdPwUPEZGvXJ3ebp', 'cardano').valid).toBe(false); // too short for Byron
    });
});
