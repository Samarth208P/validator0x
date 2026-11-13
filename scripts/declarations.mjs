import { writeFileSync } from 'node:fs';

// Share declaration identities across entrypoints, including protected members of validator classes.
const exports = {
    ethereum: ['EthereumValidator'],
    evm: ['EvmValidator', 'BscValidator', 'AvalancheValidator', 'ArbitrumValidator', 'OptimismValidator', 'BaseValidator'],
    bitcoin: ['BitcoinValidator'], litecoin: ['LitecoinValidator'], dogecoin: ['DogecoinValidator'],
    solana: ['SolanaValidator'], ripple: ['RippleValidator'], cardano: ['CardanoValidator'],
    tron: ['TronValidator'], cosmos: ['CosmosValidator'], move: ['SuiValidator', 'AptosValidator'],
    near: ['NearValidator'], formatters: ['shortenAddress', 'normalizeAddress', 'addChecksum'],
};
for (const [name, names] of Object.entries(exports)) {
    for (const [declaration, module] of [['mts', 'mjs'], ['cts', 'cjs']]) {
        writeFileSync(new URL(`../dist/${name}.d.${declaration}`, import.meta.url), `export { ${names.join(', ')} } from './index.${module}';\n`);
    }
}
