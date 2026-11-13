import { UtxoValidator } from './utxo';

export class DogecoinValidator extends UtxoValidator {
    constructor() {
        super({ chain: 'dogecoin', versions: { 30: 'mainnet', 22: 'mainnet', 113: 'testnet', 196: 'testnet' } });
    }
}
