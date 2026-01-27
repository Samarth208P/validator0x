import { BlockchainType } from '../types';
import { EthereumValidator } from '../validators/ethereum';
import { SolanaValidator } from '../validators/solana';
import { BitcoinValidator } from '../validators/bitcoin';

const validators = {
    ethereum: new EthereumValidator(),
    solana: new SolanaValidator(),
    bitcoin: new BitcoinValidator(),
};

export function detectBlockchain(address: string): BlockchainType | null {
    // 1. Ethereum/Polygon (0x...)
    if (address.startsWith('0x') && address.length === 42) {
        // Could be Eth or Polygon, default to Ethereum as base
        if (validators.ethereum.validate(address).valid) {
            return 'ethereum';
        }
    }

    // 2. Bitcoin (1, 3, bc1)
    if (address.startsWith('1') || address.startsWith('3') || address.toLowerCase().startsWith('bc1')) {
        if (validators.bitcoin.validate(address).valid) {
            return 'bitcoin';
        }
    }

    // 3. Solana (Base58, length 32-44)
    // Check characters - assume Base58 if mostly alphanumeric without 0, O, I, l
    if (validators.solana.validate(address).valid) {
        return 'solana';
    }

    return null;
}
