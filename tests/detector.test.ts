import { validateAddress, detectBlockchain, EVM_CHAINS } from '../src';
import { base58, bech32, createBase58check } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';

describe('Polygon Validator', () => {
    test('should validate Polygon address', () => {
        const result = validateAddress('0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 'polygon');
        expect(result.valid).toBe(true);
        expect(result.blockchain).toBe('polygon');
    });
});

describe('Chain Detector', () => {
    test('retains every matching format when an Osmosis account also encodes a Solana key', () => {
        const accountId = Buffer.from('2c624232cdd221771294dfbb310aca000a0df6ac', 'hex');
        const address = bech32.encode('osmo', bech32.toWords(accountId));
        expect(base58.decode(address)).toHaveLength(32);
        expect(detectBlockchain(' ' + address + ' ')).toEqual(['osmosis', 'solana']);
        expect(detectBlockchain(address.toUpperCase())).toBe('osmosis');

        const badChecksum = address.slice(0, -1) + '7';
        expect(base58.decode(badChecksum)).toHaveLength(32);
        expect(detectBlockchain(badChecksum)).toBe('solana');
    });

    test('applies network policy across all chains sharing a legacy version', () => {
        const codec = createBase58check(sha256);
        const payload = new Uint8Array(21);
        payload[0] = 5;
        expect(detectBlockchain(codec.encode(payload), { network: 'mainnet' })).toEqual(['bitcoin', 'litecoin']);
        payload[0] = 196;
        const testnet = codec.encode(payload);
        expect(detectBlockchain(testnet, { network: 'testnet' })).toEqual(['bitcoin', 'litecoin', 'dogecoin']);
        expect(detectBlockchain(testnet, { network: 'mainnet' })).toBeNull();
        expect(detectBlockchain(testnet, { allowTestnet: false })).toBeNull();
    });

    test('should detect Ethereum and EVM chains', () => {
        expect(detectBlockchain('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toEqual(EVM_CHAINS);
    });

    test('should detect Solana', () => {
        expect(detectBlockchain('HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k1')).toBe('solana');
    });

    test('should detect Bitcoin Legacy', () => {
        expect(detectBlockchain('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe('bitcoin');
    });

    test('should detect Bitcoin SegWit', () => {
        expect(detectBlockchain('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe('bitcoin');
    });

    test('should detect Ripple', () => {
        expect(detectBlockchain('rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn')).toBe('ripple');
    });

    test('should detect Cardano', () => {
        expect(detectBlockchain('addr1vx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzers66hrl8')).toBe('cardano');
    });

    test('should detect Litecoin', () => {
        expect(detectBlockchain('LVg2kJoFNg45Nbpy53h7Fe1wKyeXVRhMH9')).toBe('litecoin');
    });

    test('should detect Dogecoin', () => {
        expect(detectBlockchain('D59T4ioHyHdJ6SDzpE8mdz7ssh3atQqjiG')).toBe('dogecoin');
    });

    test('should return null for unknown', () => {
        expect(detectBlockchain('invalid-address-string')).toBe(null);
    });
});
