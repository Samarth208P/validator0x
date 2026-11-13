const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE = 58;
const LEADER = ALPHABET.charAt(0);

const ALPHABET_MAP: { [key: string]: number } = {};
for (let i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
}

export function encodeBase58(source: Uint8Array): string {
    if (source.length === 0) return '';

    const digits = [0];

    for (let i = 0; i < source.length; i++) {
        for (let j = 0; j < digits.length; j++) {
            digits[j] <<= 8;
        }
        digits[0] += source[i];

        let carry = 0;
        for (let j = 0; j < digits.length; ++j) {
            digits[j] += carry;
            carry = (digits[j] / BASE) | 0;
            digits[j] %= BASE;
        }
        while (carry) {
            digits.push(carry % BASE);
            carry = (carry / BASE) | 0;
        }
    }

    for (let i = 0; i < source.length - 1 && source[i] === 0; i++) {
        digits.push(0);
    }

    return digits.reverse().map(d => ALPHABET[d]).join('');
}

export function decodeBase58(string: string): Uint8Array {
    if (string.length === 0) return new Uint8Array(0);

    let i = 0;
    while (i < string.length && string[i] === LEADER) {
        i++;
    }
    const leaders = i;

    const bytes = [0];

    for (; i < string.length; i++) {
        const char = string[i];
        const value = ALPHABET_MAP[char];
        if (value === undefined) {
            throw new Error(`Invalid Base58 character: ${char}`);
        }

        for (let j = 0; j < bytes.length; j++) {
            bytes[j] *= BASE;
        }
        bytes[0] += value;

        let carry = 0;
        for (let j = 0; j < bytes.length; ++j) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }
        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    const resultBytes = string.length === leaders ? [] : bytes.reverse();
    return Uint8Array.from([...new Array<number>(leaders).fill(0), ...resultBytes]);
}
