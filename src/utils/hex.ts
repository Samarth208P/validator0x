export function isHex(str: string, length?: number): boolean {
    if (typeof str !== 'string') return false;

    // Remove 0x prefix if present
    const cleanStr = str.startsWith('0x') ? str.slice(2) : str;

    // Check length if specified
    if (length !== undefined && cleanStr.length !== length) {
        return false;
    }

    // Check for valid hex characters
    return /^[0-9a-fA-F]*$/.test(cleanStr);
}

export function stripHexPrefix(str: string): string {
    return str.startsWith('0x') ? str.slice(2) : str;
}

export function addHexPrefix(str: string): string {
    return str.startsWith('0x') ? str : `0x${str}`;
}
