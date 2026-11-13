import { BlockchainType, EVM_CHAINS } from '../types';
import { EthereumValidator } from '../validators/ethereum';
import { formatPlainAddress } from '../validators/base';
import { InputSanitizer } from '../security/sanitizer';

export function shortenAddress(address: string, chars = 4): string {
    return formatPlainAddress(address, { shorten: true, shortenLength: chars });
}

export function normalizeAddress(address: string, blockchain: BlockchainType): string {
    const safe = InputSanitizer.sanitize(address);
    if ((EVM_CHAINS as readonly string[]).includes(blockchain) || blockchain === 'sui' || blockchain === 'aptos') return safe.toLowerCase();
    return safe;
}

export function addChecksum(address: string, blockchain: BlockchainType): string {
    if ((EVM_CHAINS as readonly string[]).includes(blockchain)) return new EthereumValidator().format(address, { checksum: true });
    return InputSanitizer.sanitize(address);
}
