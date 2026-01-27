import { validateAddress, formatAddress } from './src';
import { keccak256 } from './src/utils/keccak256';

console.log('--- Ethereum Debug ---');
const ethAddr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
console.log(`Input: ${ethAddr}`);
const ethRes = validateAddress(ethAddr, 'ethereum');
console.log(`Result:`, JSON.stringify(ethRes, null, 2));

const lower = ethAddr.toLowerCase();
const noPrefix = lower.slice(2);
const hash = keccak256(noPrefix);
console.log(`Hash of ${noPrefix}: ${hash}`);
console.log('First 4 nibbles:', hash.substring(0, 4));

// Calculate checksum manually
let checksummed = '0x';
for (let i = 0; i < noPrefix.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
        checksummed += noPrefix[i].toUpperCase();
    } else {
        checksummed += noPrefix[i];
    }
}
console.log(`Computed Checksum: ${checksummed}`);
console.log(`Match? ${checksummed === ethAddr}`);

console.log('\n--- Solana Debug ---');
const solAddr = '11111111111111111111111111111111';
console.log(`Input: ${solAddr} (Length: ${solAddr.length})`);
const solRes = validateAddress(solAddr, 'solana');
console.log(`Result:`, JSON.stringify(solRes, null, 2));
