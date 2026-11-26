import { decodeBase58 } from './base58';
import { sha256 } from './sha256';

export function checkedPayload(decoded: Uint8Array): Uint8Array | null {
    if (decoded.length < 5) return null;
    const payload = decoded.subarray(0, -4);
    const checksum = sha256(sha256(payload));
    for (let i = 0; i < 4; i++) {
        if (decoded[payload.length + i] !== checksum[i]) return null;
    }
    return payload;
}

export function decodeBase58Check(address: string): Uint8Array | null {
    try {
        return checkedPayload(decodeBase58(address));
    } catch {
        return null;
    }
}
