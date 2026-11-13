import { performance } from 'node:perf_hooks';
import { validateAddress, detectBlockchain } from '../dist/index.mjs';

const iterations = 10000;
for (const [chain, address] of [
    ['ethereum', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
    ['bitcoin', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
    ['solana', 'HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k1'],
    ['tron', 'TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL'],
]) {
    if (!validateAddress(address, chain).valid) throw new Error(`Invalid benchmark fixture: ${chain}`);
    for (let warmup = 0; warmup < 500; warmup++) validateAddress(address, chain);
    const start = performance.now();
    for (let i = 0; i < iterations; i++) validateAddress(address, chain);
    const elapsed = performance.now() - start;
    console.log(`${chain}: ${(iterations / elapsed * 1000).toFixed(0)} validations/s (${elapsed.toFixed(1)}ms for ${iterations})`);
}
const start = performance.now();
for (let i = 0; i < 1000; i++) detectBlockchain('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
console.log(`EVM detection: ${(1000000 / (performance.now() - start)).toFixed(0)} detections/s`);
