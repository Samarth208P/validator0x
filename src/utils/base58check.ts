import { decodeBase58 } from './base58';
import { sha256 } from './sha256';

export function decodeBase58Check(address: string): Uint8Array | null {
    try {
        const decoded = decodeBase58(address);
        if (decoded.length < 5) return null;
        const payload = decoded.slice(0, -4);
        const checksum = sha256(sha256(payload));
        return decoded.slice(-4).every((byte, i) => byte === checksum[i]) ? payload : null;
    } catch {
        return null;
    }
}
