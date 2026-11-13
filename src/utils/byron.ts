/** Minimal bounded CBOR reader for the Byron address envelope, not a general CBOR API. */
class Reader {
    offset = 0;
    constructor(readonly data: Uint8Array) {}
    head(major: number): number {
        if (this.offset >= this.data.length) throw new Error('Truncated CBOR');
        const initial = this.data[this.offset++];
        if (initial >>> 5 !== major) throw new Error('Invalid CBOR type');
        const additional = initial & 31;
        if (additional < 24) return additional;
        if (additional > 26) throw new Error('Unsupported CBOR length');
        const size = 1 << (additional - 24);
        if (this.offset + size > this.data.length) throw new Error('Truncated CBOR');
        let value = 0;
        for (let i = 0; i < size; i++) value = value * 256 + this.data[this.offset++];
        return value;
    }
    bytes(): Uint8Array {
        const length = this.head(2);
        if (this.offset + length > this.data.length) throw new Error('Truncated bytes');
        const value = this.data.slice(this.offset, this.offset + length);
        this.offset += length;
        return value;
    }
    end(): void {
        if (this.offset !== this.data.length) throw new Error('Trailing CBOR data');
    }
}

function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (const byte of data) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

export function byronNetwork(data: Uint8Array): 'mainnet' | 'testnet' | null {
    try {
        const envelope = new Reader(data);
        if (envelope.head(4) !== 2 || envelope.head(6) !== 24) return null;
        const payload = envelope.bytes();
        if (envelope.head(0) !== crc32(payload)) return null;
        envelope.end();
        const inner = new Reader(payload);
        if (inner.head(4) !== 3 || inner.bytes().length !== 28) return null;
        const count = inner.head(5);
        if (count > payload.length) return null;
        const seen = new Set<number>();
        let network: 'mainnet' | 'testnet' = 'mainnet';
        for (let i = 0; i < count; i++) {
            const key = inner.head(0);
            if (seen.has(key) || key > 255) return null;
            seen.add(key);
            const value = inner.bytes();
            if (key === 1) {
                const path = new Reader(value);
                if (path.bytes().length !== 28) return null;
                path.end();
            }
            if (key === 2) {
                const magic = new Reader(value);
                magic.head(0);
                magic.end();
                network = 'testnet';
            }
        }
        const type = inner.head(0);
        if (type !== 0 && type !== 2) return null;
        inner.end();
        return network;
    } catch {
        return null;
    }
}
