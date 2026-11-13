import { decodeBech32 } from '../src/utils/bech32';

test('rejects the historical invalid Cardano checksum fixture', () => {
    expect(decodeBech32('addr1qxyxps5q8vquk0xyed9k4w0eunv3c8hsnmxgf7th8qf5lqy4xgj970e4e7h886g8e27csh0lssn35n9p2r8m0xptz8cs22gexj', 256)).toBeNull();
});
