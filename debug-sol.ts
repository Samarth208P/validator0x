import { decodeBase58 } from './src/utils/base58';

const input = '11111111111111111111111111111111'; // 32 '1's
const decoded = decodeBase58(input);

console.log(`Input length: ${input.length}`);
console.log(`Decoded length: ${decoded.length}`);
console.log(`Decoded bytes: [${decoded.join(', ')}]`);
