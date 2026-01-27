import { BlockchainType, FormatOptions } from '../types';
import { EthereumValidator } from '../validators/ethereum';
import { stripHexPrefix, addHexPrefix } from '../utils/hex';

export function shortenAddress(address: string, chars = 4): string {
    if (!address || address.length < chars * 2 + 2) return address;
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function normalizeAddress(address: string, blockchain: BlockchainType): string {
    if (blockchain === 'ethereum' || blockchain === 'polygon') {
        return address.toLowerCase();
    }
    // Solana and Bitcoin are case sensitive
    return address;
}

export function addChecksum(address: string, blockchain: BlockchainType): string {
    if (blockchain === 'ethereum' || blockchain === 'polygon') {
        // Use Ethereum validator's logic exposed or duplicated?
        // Since it's utils, we can instantiate or just duplicate the simple logic.
        // Better to use the class to ensure consistency.
        const validator = new EthereumValidator();
        return validator.format(address, { checksum: true });
    }
    return address;
}
