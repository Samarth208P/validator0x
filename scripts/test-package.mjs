import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { runInNewContext } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'validator0x-consumer-'));
const npm = process.env.npm_execpath;
assert.ok(npm, 'Run this check using npm run test:package');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const run = (file, args, cwd = temp) => execFileSync(file, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try {
    // Pack the existing build: prepack normally rebuilds it, but this check follows the build step.
    const [pack] = JSON.parse(run(process.execPath, [npm, 'pack', '--ignore-scripts', '--json', '--pack-destination', temp], root));
    assert.equal(pack.bundled.length, 0);
    assert.ok(pack.files.every(({ path }) => /^(dist\/|README\.md$|AGENTS\.md$|CHANGELOG\.md$|LICENSE$|package\.json$)/.test(path)));
    writeFileSync(join(temp, 'package.json'), JSON.stringify({ private: true }));
    run(process.execPath, [npm, 'install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', join(temp, pack.filename)]);
    const installed = join(temp, 'node_modules', 'validator0x');
    assert.ok(existsSync(join(installed, 'dist/index.mjs')));
    assert.ok(readFileSync(join(installed, 'AGENTS.md'), 'utf8').includes('## Integrating the npm package'));
    run(process.execPath, ['-e', "require('node:fs').accessSync(require.resolve('validator0x/AGENTS.md'))"]);
    assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0);
    const entrypoints = Object.keys(pkg.exports).filter(key => key !== './package.json' && key !== './AGENTS.md');
    const smoke = `
        const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        if (!api.validateAddress(address, 'ethereum', { strict: true }).valid) throw new Error('Checksum validation failed');
        if (!api.ValidationError.INVALID_CHECKSUM) throw new Error('Missing runtime enum');
        if (!api.validateAddress('TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL', 'tron').valid) throw new Error('TRON failed');
    `;
    writeFileSync(join(temp, 'consumer.cjs'), `const api = require('validator0x');\n${smoke}\n` + entrypoints.map(path => `if (!Object.keys(require(${JSON.stringify(path === '.' ? 'validator0x' : 'validator0x' + path.slice(1))})).length) throw new Error('Empty export');`).join('\n'));
    writeFileSync(join(temp, 'consumer.mjs'), `import * as api from 'validator0x';\n${smoke}\n` + entrypoints.map(path => `if (!Object.keys(await import(${JSON.stringify(path === '.' ? 'validator0x' : 'validator0x' + path.slice(1))})).length) throw new Error('Empty export');`).join('\n'));
    run(process.execPath, ['consumer.cjs']);
    run(process.execPath, ['consumer.mjs']);
    // Verify actual declaration resolution in CJS, native ESM, and bundler consumers, without @types/node.
    const types = `
        import { validateAddress, validateBatch, ValidationError, type AddressValidator, type BlockchainType, type ValidationResult } from 'validator0x';
        import { EthereumValidator } from 'validator0x/ethereum';
        import { CosmosValidator } from 'validator0x/cosmos';
        const chain: BlockchainType = 'tron';
        const result: ValidationResult = validateAddress('address', chain);
        const batch: ValidationResult[] = validateBatch(['address'] as const, chain);
        const error: ValidationError = ValidationError.INVALID_CHECKSUM;
        new EthereumValidator().validate('address', { strict: true });
        new CosmosValidator('osmosis').validate('address');
        const compatible: AddressValidator[] = [new EthereumValidator(), new CosmosValidator('osmosis')];
        void compatible;
        void [result, batch, error];
        // @ts-expect-error Unknown chains must remain a type error.
        validateAddress('address', 'made-up-chain');
    ` + entrypoints.map((path, index) => `\nimport * as entry${index} from ${JSON.stringify(path === '.' ? 'validator0x' : 'validator0x' + path.slice(1))}; void entry${index};`).join('');
    for (const extension of ['cts', 'mts', 'ts']) writeFileSync(join(temp, `consumer.${extension}`), types);
    for (const [module, resolution, files] of [
        ['NodeNext', 'NodeNext', ['consumer.cts', 'consumer.mts']],
        ['ESNext', 'Bundler', ['consumer.ts']],
        ['CommonJS', 'Node', ['consumer.ts']],
    ]) {
        writeFileSync(join(temp, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2020', module, moduleResolution: resolution, strict: true, noEmit: true, types: [], lib: ['ES2020', 'DOM'] }, files }));
        run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(temp, 'tsconfig.json')]);
    }
    const browser = { TextEncoder };
    runInNewContext(readFileSync(join(installed, 'dist/index.umd.js'), 'utf8'), browser);
    assert.ok(browser.validator0x.validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum').valid);
    assert.ok(browser.validator0x.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bitcoin').valid);
    const fullSize = gzipSync(readFileSync(join(installed, 'dist/index.mjs'))).length;
    const solanaSize = gzipSync(readFileSync(join(installed, 'dist/solana.mjs'))).length;
    assert.ok(fullSize < 12000, `Root ESM exceeded 12 kB gzip: ${fullSize}`);
    assert.ok(solanaSize < 3000, `Solana ESM exceeded 3 kB gzip: ${solanaSize}`);
    console.log(`Packed consumers passed: ${entrypoints.length} ESM/CJS exports, NodeNext/bundler/legacy TypeScript, browser-like UMD without Node globals.`);
    console.log(`Root ESM: ${fullSize} bytes gzip; Solana-only: ${solanaSize} bytes gzip; npm tarball: ${pack.size} bytes; unpacked: ${pack.unpackedSize} bytes.`);
} catch (error) {
    if (error.stdout) console.error(String(error.stdout));
    if (error.stderr) console.error(String(error.stderr));
    throw error;
} finally {
    assert.ok(resolve(temp).startsWith(resolve(tmpdir()) + '\\') || resolve(temp).startsWith(resolve(tmpdir()) + '/'));
    rmSync(temp, { recursive: true, force: true });
}
