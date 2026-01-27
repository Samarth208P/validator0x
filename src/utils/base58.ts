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

    for (let i = 0; i < source.length && source[i] === 0; i++) {
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

    // If there are no bytes (e.g. input was all '1's), bytes is [0]. 
    // We want to discard it if it was just the placeholder.
    // But if it was "all 1s", i reached end. loop didn't run. bytes=[0].
    // leaders > 0.
    // Result should be [0...0] (leaders count).
    // If loop DID run, bytes contains the number.
    // We should reverse bytes.
    // Leading zeros (high bytes) in `bytes` accumulator should usually not exist due to normalization?
    // `bytes` accumulator is little endian 256-base. [low, high].
    // If we have `bytes=[0]`, and loop ran?
    // If we entered loop, we added value.
    // If we added 0 (from char '1'), but we skipped leaders. So char != '1'.
    // So value > 0.
    // So bytes[0] += value > 0.
    // So `bytes` is not `[0]`.
    // So if loop ran, `bytes` is valid number bytes.

    // What if loop didn't run (all leaders)?
    // bytes is [0].
    // We should just use empty suffix.

    let resultBytes: number[];
    if (string.length === leaders) {
        resultBytes = [];
    } else {
        resultBytes = bytes.reverse();
        // Remove leading zero ONLY if it's the extra 0 from initialization?
        // Wait. `bytes` logic is `push` on carry.
        // If we initialized with `[0]`.
        // And we did math.
        // `bytes` usually doesn't have extra zeros at end (high) unless they were pushed?
        // But we started with `[0]`.
        // If result is `255`, `bytes=[255]`. Reverse `[255]`.
        // If result is `256`, `bytes=[0, 1]`. Reverse `[1, 0]`.
        // Does `bytes` ever have `[..., 0]`?
        // Only if `carry` pushed 0? Impossible. carry > 0.
        // Or if `bytes` remained `[0]` (handled by all-leaders check).

        // But wait. `bytes` started as `[0]`.
        // If we computed `256`. `bytes=[0]`.
        // `bytes[0]*58`.
        // ...
        // If we reversed `bytes`, and `bytes` was `[0, 1]`. -> `[1, 0]`. Matches.
        // What if `bytes` was `[0]`? -> `[0]`.
        // But we said loop implies value > 0.
        // So `bytes` != `[0]`.
        // BUT if we have code like `bytes[0]`...
        // Is it possible `bytes` has a high-order zero `[255, 0]`?
        // `bytes` grows only on carry.
        // If carry is pushed, it's non-zero (while(carry)).
        // So no high-order zeros.
        // EXCEPT the initial `0` if it wasn't overwritten or growing.
        // `bytes[0] += value`.
        // If `bytes.length == 1` and `bytes[0]` becomes non-zero, fine.
        // If `bytes` grows, `bytes[0]` might be 0.
        // High order is at `bytes[length-1]`.
        // Since push only happens on non-zero carry, the last element is non-zero.
        // So `bytes` is canonical.

        // So just `bytes.reverse()` is correct.
        // EXCEPT if `bytes` is `[0]` (loop ran but value is 0? Impossible).
    }

    // Prepend leaders
    for (let k = 0; k < leaders; k++) {
        resultBytes.unshift(0);
    }

    return new Uint8Array(resultBytes);
}
