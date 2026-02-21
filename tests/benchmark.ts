import { validateAddress } from '../src';

console.log('Running Benchmarks...');

const iterations = 10000;
const ethAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
// Using a simpler Sol addr for speed valid check if needed, or just repeat check.

function benchmark(name: string, fn: () => void) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const duration = end - start;
    console.log(`${name}: ${duration.toFixed(2)}ms (${(iterations / (duration / 1000)).toFixed(0)} ops/s)`);
}

benchmark('Ethereum Validation', () => {
    validateAddress(ethAddress, 'ethereum');
});

benchmark('Bitcoin Validation', () => {
    validateAddress(btcAddress, 'bitcoin');
});

// Note: Ensure solAddress is actually valid or mock it relative to validator rules to avoid early exit costs skewing results vs success path
// benchmark('Solana Validation', () => {
//     validateAddress(solAddress, 'solana');
// });
