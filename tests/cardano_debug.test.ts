import { decodeBech32 } from '../src/utils/bech32';

test('cardano debug', () => {
    const addr = 'addr1qxyxps5q8vquk0xyed9k4w0eunv3c8hsnmxgf7th8qf5lqy4xgj970e4e7h886g8e27csh0lssn35n9p2r8m0xptz8cs22gexj';
    const decoded = decodeBech32(addr);
    console.log('Decoded Cardano:', decoded);
    if (!decoded) {
        console.log('Is valid characters?', /^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/.test(addr.split('1')[1]));
    }
});
