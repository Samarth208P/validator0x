const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE = 58;

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

/** Build the digit lookup once for each supported alphabet. */
export function createBase58Decoder(alphabet: string): (input: string) => Uint8Array {
    const digits: Record<string, number> = Object.create(null);
    for (let i = 0; i < alphabet.length; i++) digits[alphabet[i]] = i;

    return (input: string): Uint8Array => {
        let leaders = 0;
        while (leaders < input.length && input[leaders] === alphabet[0]) leaders++;

        // Accumulate base-256 digits least significant first.
        const bytes: number[] = [];
        for (let i = leaders; i < input.length; i++) {
            let carry = digits[input[i]];
            if (carry === undefined) throw new Error(`Invalid Base58 character: ${input[i]}`);
            for (let j = 0; j < bytes.length; j++) {
                carry += bytes[j] * BASE;
                bytes[j] = carry & 0xff;
                carry >>>= 8;
            }
            while (carry > 0) {
                bytes.push(carry & 0xff);
                carry >>>= 8;
            }
        }
        const decoded = new Uint8Array(leaders + bytes.length);
        decoded.set(bytes.reverse(), leaders);
        return decoded;
    };
}

export const decodeBase58 = /* @__PURE__ */ createBase58Decoder(ALPHABET);
