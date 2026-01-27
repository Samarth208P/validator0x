export function sha256(input: Uint8Array): Uint8Array {
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

    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

    const len = input.length * 8;
    const lenByte = input.length;

    // Padding
    const k = (len + 1 + 64) % 512 <= 448 ? 448 - (len + 1) % 512 : 960 - (len + 1) % 512;
    const padding = new Uint8Array((k + 1 + 64) / 8);
    padding[0] = 0x80;

    // Length in bits (Big Endian 64 bit)
    // Javascript numbers are doubles limited to 53 bits integer precision.
    // For small inputs it's fine.
    const l = len;
    const high = Math.floor(l / 4294967296);
    const low = l % 4294967296;

    const pLen = padding.length;
    padding[pLen - 4] = (low >>> 24) & 0xff;
    padding[pLen - 3] = (low >>> 16) & 0xff;
    padding[pLen - 2] = (low >>> 8) & 0xff;
    padding[pLen - 1] = low & 0xff;

    padding[pLen - 8] = (high >>> 24) & 0xff;
    padding[pLen - 7] = (high >>> 16) & 0xff;
    padding[pLen - 6] = (high >>> 8) & 0xff;
    padding[pLen - 5] = high & 0xff;

    const msg = new Uint8Array(lenByte + padding.length);
    msg.set(input);
    msg.set(padding, lenByte);

    const W = new Uint32Array(64);

    for (let i = 0; i < msg.length; i += 64) {
        // Prepare message schedule
        for (let t = 0; t < 16; t++) {
            W[t] = (msg[i + t * 4] << 24) | (msg[i + t * 4 + 1] << 16) | (msg[i + t * 4 + 2] << 8) | (msg[i + t * 4 + 3]);
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

    const res = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
        res[i * 4] = (H[i] >>> 24) & 0xff;
        res[i * 4 + 1] = (H[i] >>> 16) & 0xff;
        res[i * 4 + 2] = (H[i] >>> 8) & 0xff;
        res[i * 4 + 3] = H[i] & 0xff;
    }
    return res;
}

function rro(val: number, bits: number) {
    return (val >>> bits) | (val << (32 - bits));
}
