import { BlockchainType } from '../types';
import { EthereumValidator } from '../validators/ethereum';
import { SolanaValidator } from '../validators/solana';
import { BitcoinValidator } from '../validators/bitcoin';
import { LitecoinValidator } from '../validators/litecoin';
import { DogecoinValidator } from '../validators/dogecoin';
import { CardanoValidator } from '../validators/cardano';
import { RippleValidator } from '../validators/ripple';

const validators = {
    ethereum: new EthereumValidator(),
    solana: new SolanaValidator(),
    bitcoin: new BitcoinValidator(),
    litecoin: new LitecoinValidator(),
    dogecoin: new DogecoinValidator(),
    cardano: new CardanoValidator(),
    ripple: new RippleValidator(),
};

/**
 * Auto-detects the blockchain for an address.
 * Because EVM chains share identical formats, if it matches Ethereum,
 * it returns an array of possible matching chains.
 */
export function detectBlockchain(address: string): BlockchainType | BlockchainType[] | null {
    // 1. Ethereum / EVM Compatible (0x...)
    if (address.startsWith('0x') && address.length === 42) {
        if (validators.ethereum.validate(address).valid) {
            // EVM ambiguity: same address is valid across all EVM networks
            return ['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism', 'base'];
        }
    }

    // 2. Ripple (starts with r)
    if (address.startsWith('r') && address.length >= 25) {
        if (validators.ripple.validate(address).valid) {
            return 'ripple';
        }
    }

    // 3. Cardano (addr1, Ae2, etc)
    if (address.startsWith('addr') || address.startsWith('stake') || address.startsWith('A') || address.startsWith('D')) {
        if (validators.cardano.validate(address).valid) {
            return 'cardano';
        }
    }

    // 4. Bitcoin (1, 3, bc1)
    if (address.startsWith('1') || address.startsWith('3') || address.toLowerCase().startsWith('bc1')) {
        if (validators.bitcoin.validate(address).valid) {
            return 'bitcoin';
        }
    }

    // 5. Litecoin (L, M, ltc1)
    if (address.startsWith('L') || address.startsWith('M') || address.toLowerCase().startsWith('ltc1')) {
        if (validators.litecoin.validate(address).valid) {
            return 'litecoin';
        }
    }

    // 6. Dogecoin (D, 9, A)
    // Note: D might conflict with Cardano Byron (D), but Cardano is length > 30 usually, Dogecoin is 34.
    if (address.startsWith('D') || address.startsWith('9') || address.startsWith('A')) {
        // Since both DOGE and ADA might start with D / A, check Doge first if base58 length is ~25 bytes.
        if (validators.dogecoin.validate(address).valid) {
            return 'dogecoin';
        }
    }

    // 7. Solana (Base58, length 32-44)
    if (validators.solana.validate(address).valid) {
        return 'solana';
    }

    return null;
}
