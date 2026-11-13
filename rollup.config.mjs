import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

const entries = {
    index: 'src/index.ts', ethereum: 'src/validators/ethereum.ts', evm: 'src/validators/evm.ts',
    bitcoin: 'src/validators/bitcoin.ts', litecoin: 'src/validators/litecoin.ts', dogecoin: 'src/validators/dogecoin.ts',
    solana: 'src/validators/solana.ts', ripple: 'src/validators/ripple.ts', cardano: 'src/validators/cardano.ts',
    tron: 'src/validators/tron.ts', cosmos: 'src/validators/cosmos.ts', move: 'src/validators/move.ts',
    near: 'src/validators/near.ts', formatters: 'src/formatters/index.ts',
};
export default Object.entries(entries).flatMap(([name, input]) => [
    {
        input,
        output: [
            { file: `dist/${name}.mjs`, format: 'es' },
            { file: `dist/${name}.cjs`, format: 'cjs', exports: 'named' },
            ...(name === 'index' ? [{ file: 'dist/index.umd.js', format: 'umd', name: 'validator0x' }] : []),
        ],
        plugins: [typescript({ declaration: false, declarationMap: false, sourceMap: false }), terser({ maxWorkers: 1 })],
    },
    ...(name === 'index' ? [{
        input,
        output: [
            { file: `dist/${name}.d.mts`, format: 'es' },
            { file: `dist/${name}.d.cts`, format: 'es' },
        ],
        plugins: [dts()],
    }] : []),
]);
