export const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export enum Bech32Encoding {
    BECH32 = 'bech32',
    BECH32M = 'bech32m',
}

const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
// Polymod uses the same five generator choices for each possible high-five-bit value.
const FEEDBACK = new Uint32Array(32);
for (let top = 1; top < FEEDBACK.length; top++) {
    for (let bit = 0; bit < GENERATOR.length; bit++) {
        if (top & (1 << bit)) FEEDBACK[top] ^= GENERATOR[bit];
    }
}

function polymodStep(checksum: number, word: number): number {
    return ((checksum & 0x1ffffff) << 5) ^ word ^ FEEDBACK[checksum >>> 25];
}

function hrpChecksum(hrp: string): number {
    let checksum = 1;
    for (let i = 0; i < hrp.length; i++) checksum = polymodStep(checksum, hrp.charCodeAt(i) >>> 5);
    checksum = polymodStep(checksum, 0);
    for (let i = 0; i < hrp.length; i++) checksum = polymodStep(checksum, hrp.charCodeAt(i) & 31);
    return checksum;
}

export interface Decoded {
    hrp: string;
    data: number[];
    encoding: Bech32Encoding;
}

export function decodeBech32(str: string, limit = 90, expectedHrp?: string): Decoded | null {
    if (str.length < 8 || str.length > limit) return null;
    const pos = str.lastIndexOf('1');
    if (pos < 1 || pos + 7 > str.length) return null;
    const hrp = str.slice(0, pos).toLowerCase();
    if (expectedHrp !== undefined && hrp !== expectedHrp) return null;
    if (/[^\x21-\x7E]/.test(str)) return null;
    const lower = str.toLowerCase();

    // Mixed case check
    if (str !== lower && str !== str.toUpperCase()) return null;

    const data: number[] = [];
    let checksum = hrpChecksum(hrp);
    for (let i = pos + 1; i < lower.length; i++) {
        const d = BECH32_ALPHABET.indexOf(lower[i]);
        if (d === -1) return null;
        checksum = polymodStep(checksum, d);
        if (i < lower.length - 6) data.push(d);
    }

    let encoding: Bech32Encoding;
    if (checksum === 1) encoding = Bech32Encoding.BECH32;
    else if (checksum === 0x2bc830a3) encoding = Bech32Encoding.BECH32M;
    else return null;
    return { hrp, data, encoding };
}

/** Convert Bech32 words to bytes, rejecting excess or nonzero padding (BIP-173). */
export function wordsToBytes(words: readonly number[]): Uint8Array | null {
    let acc = 0;
    let bits = 0;
    const bytes = new Uint8Array(Math.floor(words.length * 5 / 8));
    let offset = 0;
    for (const word of words) {
        if (!Number.isInteger(word) || word < 0 || word > 31) return null;
        acc = ((acc << 5) | word) & 0xffff;
        bits += 5;
        if (bits >= 8) {
            bits -= 8;
            bytes[offset++] = (acc >>> bits) & 255;
        }
    }
    if (bits >= 5 || ((acc << (8 - bits)) & 255) !== 0) return null;
    return bytes;
}
