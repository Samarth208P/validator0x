const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

export function sha256(input: Uint8Array): Uint8Array {
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

    // Reserve one marker byte and an eight-byte big-endian bit count.
    const paddedLength = Math.ceil((input.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(input);
    padded[input.length] = 0x80;
    const bitLength = input.length * 8;
    writeWord(padded, paddedLength - 8, Math.floor(bitLength / 0x100000000));
    writeWord(padded, paddedLength - 4, bitLength);

    const W = new Array<number>(64);

    for (let i = 0; i < paddedLength; i += 64) {
        // Prepare message schedule
        for (let t = 0; t < 16; t++) {
            const offset = i + t * 4;
            W[t] = (padded[offset] << 24) | (padded[offset + 1] << 16) | (padded[offset + 2] << 8) | padded[offset + 3];
        }
        for (let t = 16; t < 64; t++) {
            const s1 = rro(W[t - 2], 17) ^ rro(W[t - 2], 19) ^ (W[t - 2] >>> 10);
            const s0 = rro(W[t - 15], 7) ^ rro(W[t - 15], 18) ^ (W[t - 15] >>> 3);
            W[t] = (s1 + W[t - 7] + s0 + W[t - 16]) | 0;
        }

        let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

        for (let t = 0; t < 64; t++) {
            const S1 = rro(e, 6) ^ rro(e, 11) ^ rro(e, 25);
            const ch = (e & f) ^ ((~e) & g);
            const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
            const S0 = rro(a, 2) ^ rro(a, 13) ^ rro(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) | 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }

        H[0] = (H[0] + a) | 0;
        H[1] = (H[1] + b) | 0;
        H[2] = (H[2] + c) | 0;
        H[3] = (H[3] + d) | 0;
        H[4] = (H[4] + e) | 0;
        H[5] = (H[5] + f) | 0;
        H[6] = (H[6] + g) | 0;
        H[7] = (H[7] + h) | 0;
    }

    const digest = new Uint8Array(32);
    for (let i = 0; i < H.length; i++) writeWord(digest, i * 4, H[i]);
    return digest;
}

function writeWord(output: Uint8Array, offset: number, value: number): void {
    output[offset] = value >>> 24;
    output[offset + 1] = value >>> 16;
    output[offset + 2] = value >>> 8;
    output[offset + 3] = value;
}

function rro(val: number, bits: number) {
    return (val >>> bits) | (val << (32 - bits));
}
