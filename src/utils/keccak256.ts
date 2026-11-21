// Keccak-f[1600], rate 1088, capacity 512; Ethereum uses suffix 0x01, not SHA3's 0x06.
// Each 64-bit lane is stored as two 32-bit halves (lo at 2i, hi at 2i + 1) so the
// permutation runs on plain integer arithmetic instead of BigInt.
const RATE = 136;
const ROTATIONS = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];
// Round constants as [lo, hi] pairs.
const ROUND_CONSTANTS = new Uint32Array([
    0x00000001, 0x00000000, 0x00008082, 0x00000000, 0x0000808a, 0x80000000, 0x80008000, 0x80000000,
    0x0000808b, 0x00000000, 0x80000001, 0x00000000, 0x80008081, 0x80000000, 0x00008009, 0x80000000,
    0x0000008a, 0x00000000, 0x00000088, 0x00000000, 0x80008009, 0x00000000, 0x8000000a, 0x00000000,
    0x8000808b, 0x00000000, 0x0000008b, 0x80000000, 0x00008089, 0x80000000, 0x00008003, 0x80000000,
    0x00008002, 0x80000000, 0x00000080, 0x80000000, 0x0000800a, 0x00000000, 0x8000000a, 0x80000000,
    0x80008081, 0x80000000, 0x00008080, 0x80000000, 0x80000001, 0x00000000, 0x80008008, 0x80000000,
]);
// Destination lane for rho/pi: lane x + 5y moves to y + 5((2x + 3y) % 5).
const PI = new Uint8Array(25);
for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) PI[x + 5 * y] = y + 5 * ((2 * x + 3 * y) % 5);

const C = new Uint32Array(10);
const B = new Uint32Array(50);

function permute(s: Uint32Array): void {
    for (let round = 0; round < 48; round += 2) {
        // Theta
        for (let x = 0; x < 10; x++) C[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
        for (let x = 0; x < 5; x++) {
            const p = ((x + 4) % 5) * 2;
            const n = ((x + 1) % 5) * 2;
            const lo = C[p] ^ ((C[n] << 1) | (C[n + 1] >>> 31));
            const hi = C[p + 1] ^ ((C[n + 1] << 1) | (C[n] >>> 31));
            for (let y = 0; y < 50; y += 10) {
                s[2 * x + y] ^= lo;
                s[2 * x + y + 1] ^= hi;
            }
        }
        // Rho and Pi
        for (let i = 0; i < 25; i++) {
            const lo = s[2 * i];
            const hi = s[2 * i + 1];
            const r = ROTATIONS[i];
            const d = PI[i] * 2;
            if (r === 0) {
                B[d] = lo;
                B[d + 1] = hi;
            } else if (r < 32) {
                B[d] = (lo << r) | (hi >>> (32 - r));
                B[d + 1] = (hi << r) | (lo >>> (32 - r));
            } else if (r === 32) {
                B[d] = hi;
                B[d + 1] = lo;
            } else {
                const m = r - 32;
                B[d] = (hi << m) | (lo >>> (32 - m));
                B[d + 1] = (lo << m) | (hi >>> (32 - m));
            }
        }
        // Chi
        for (let y = 0; y < 50; y += 10) {
            for (let x = 0; x < 5; x++) {
                const i = y + 2 * x;
                const a = y + 2 * ((x + 1) % 5);
                const b = y + 2 * ((x + 2) % 5);
                s[i] = B[i] ^ (~B[a] & B[b]);
                s[i + 1] = B[i + 1] ^ (~B[a + 1] & B[b + 1]);
            }
        }
        // Iota
        s[0] ^= ROUND_CONSTANTS[round];
        s[1] ^= ROUND_CONSTANTS[round + 1];
    }
}

const encoder = new TextEncoder();
const HEX = '0123456789abcdef';

export function keccak256(input: string): string {
    const bytes = encoder.encode(input);
    const padded = new Uint8Array((Math.floor(bytes.length / RATE) + 1) * RATE);
    padded.set(bytes);
    padded[bytes.length] = 1;
    padded[padded.length - 1] |= 128;
    const state = new Uint32Array(50);
    for (let offset = 0; offset < padded.length; offset += RATE) {
        // Lanes are little-endian: byte i lands in half-word i >> 2 at bit (i & 3) * 8.
        for (let i = 0; i < RATE; i++) state[i >> 2] ^= padded[offset + i] << ((i & 3) * 8);
        permute(state);
    }
    let result = '';
    for (let i = 0; i < 32; i++) {
        const byte = (state[i >> 2] >>> ((i & 3) * 8)) & 255;
        result += HEX[byte >> 4] + HEX[byte & 15];
    }
    return result;
}
