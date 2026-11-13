import { UtxoValidator } from './utxo';

export class LitecoinValidator extends UtxoValidator {
    constructor() {
        super({ chain: 'litecoin', versions: { 48: 'mainnet', 50: 'mainnet', 5: 'mainnet', 111: 'testnet', 58: 'testnet', 196: 'testnet' }, hrps: { ltc: 'mainnet', tltc: 'testnet' } });
    }
}
