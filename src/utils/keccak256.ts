// Keccak-f[1600], rate 1088, capacity 512; Ethereum uses suffix 0x01, not SHA3's 0x06.
const MASK = (1n << 64n) - 1n;
const ROTATIONS = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];
const ROUND_CONSTANTS = [
    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
    0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
    0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
    0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
function rotate(value: bigint, bits: number): bigint {
    return ((value << BigInt(bits)) | (value >> BigInt(64 - bits))) & MASK;
}
function permute(state: bigint[]): void {
    const c = new Array<bigint>(5);
    const b = new Array<bigint>(25);
    for (const rc of ROUND_CONSTANTS) {
        for (let x = 0; x < 5; x++) c[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
        for (let x = 0; x < 5; x++) {
            const d = c[(x + 4) % 5] ^ rotate(c[(x + 1) % 5], 1);
            for (let y = 0; y < 5; y++) state[x + 5 * y] ^= d;
        }
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) b[y + 5 * ((2 * x + 3 * y) % 5)] = rotate(state[x + 5 * y], ROTATIONS[x + 5 * y]);
        }
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) state[x + 5 * y] = b[x + 5 * y] ^ ((~b[(x + 1) % 5 + 5 * y]) & b[(x + 2) % 5 + 5 * y]);
        }
        state[0] ^= rc;
    }
}
export function keccak256(input: string): string {
    const bytes = new TextEncoder().encode(input);
    const padded = new Uint8Array((Math.floor(bytes.length / 136) + 1) * 136);
    padded.set(bytes);
    padded[bytes.length] = 1;
    padded[padded.length - 1] |= 128;
    const state = new Array<bigint>(25).fill(0n);
    for (let offset = 0; offset < padded.length; offset += 136) {
        for (let i = 0; i < 136; i++) state[i >> 3] ^= BigInt(padded[offset + i]) << BigInt((i & 7) * 8);
        permute(state);
    }
    let result = '';
    for (let i = 0; i < 32; i++) result += Number((state[i >> 3] >> BigInt((i & 7) * 8)) & 255n).toString(16).padStart(2, '0');
    return result;
}
