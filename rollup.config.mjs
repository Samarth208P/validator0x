import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
        },
        {
            file: pkg.browser,
            format: 'umd',
            name: 'validator0x',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript(),
        terser()
    ]
};
