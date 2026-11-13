import { UtxoValidator } from './utxo';

export class BitcoinValidator extends UtxoValidator {
    constructor() {
        super({ chain: 'bitcoin', versions: { 0: 'mainnet', 5: 'mainnet', 111: 'testnet', 196: 'testnet' }, hrps: { bc: 'mainnet', tb: 'testnet' } });
    }
}
