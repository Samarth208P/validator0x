export const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export enum Bech32Encoding {
    BECH32 = 'bech32',
    BECH32M = 'bech32m',
}

const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values: number[]): number {
    let chk = 1;
    for (const v of values) {
        const top = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ v;
        for (let i = 0; i < 5; i++) {
            if ((top >> i) & 1) {
                chk ^= GENERATOR[i];
            }
        }
    }
    return chk;
}

function hrpExpand(hrp: string): number[] {
    const ret: number[] = [];
    for (let i = 0; i < hrp.length; i++) {
        ret.push(hrp.charCodeAt(i) >> 5);
    }
    ret.push(0);
    for (let i = 0; i < hrp.length; i++) {
        ret.push(hrp.charCodeAt(i) & 31);
    }
    return ret;
}

function verifyChecksum(hrp: string, data: number[], encoding: Bech32Encoding): boolean {
    const constValue = encoding === Bech32Encoding.BECH32M ? 0x2bc830a3 : 1;
    return polymod(hrpExpand(hrp).concat(data)) === constValue;
}

export interface Decoded {
    hrp: string;
    data: number[];
    encoding: Bech32Encoding;
}

export function decodeBech32(str: string): Decoded | null {
    if (str.length < 8 || str.length > 90) return null;
    const lower = str.toLowerCase();

    // Mixed case check
    if (str !== lower && str !== str.toUpperCase()) return null;

    const pos = lower.lastIndexOf('1');
    if (pos < 1 || pos + 7 > lower.length) return null;

    const hrp = lower.substring(0, pos);

    const data: number[] = [];
    for (let i = pos + 1; i < lower.length; i++) {
        const d = BECH32_ALPHABET.indexOf(lower[i]);
        if (d === -1) return null;
        data.push(d);
    }

    // Try Bech32
    if (verifyChecksum(hrp, data, Bech32Encoding.BECH32)) {
        return { hrp, data: data.slice(0, data.length - 6), encoding: Bech32Encoding.BECH32 };
    }

    // Try Bech32m
    if (verifyChecksum(hrp, data, Bech32Encoding.BECH32M)) {
        return { hrp, data: data.slice(0, data.length - 6), encoding: Bech32Encoding.BECH32M };
    }

    return null;
}
