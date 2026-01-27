import { keccak256 } from './src/utils/keccak256';

console.log('Empty:', keccak256(''));
console.log('Hello:', keccak256('hello'));

const input = 'd8da6bf26964af9d7eed9e03e53415d37aa96045';
const hash = keccak256(input);
console.log(`Input: ${input}`);
console.log(`Hash: ${hash}`);
// Expected: 535bdae9bb214b3cc583b53384464999f2f7f48625f160728c63e73e766ff71e
console.log(`Match? ${hash === '535bdae9bb214b3cc583b53384464999f2f7f48625f160728c63e73e766ff71e'}`);

// Check specific indices
console.log(`Hash[0] (d): ${hash[0]}`);
console.log(`Hash[1] (8): ${hash[1]}`);
console.log(`Hash[2] (d): ${hash[2]}`);
console.log(`Hash[3] (a): ${hash[3]}`);
