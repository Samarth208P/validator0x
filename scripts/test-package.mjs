import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import { chromium } from 'playwright-core';
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
    for (const extension of ['cjs', 'mjs']) {
        const load = extension === 'cjs' ? 'require' : 'await import';
        const checks = entrypoints.filter(path => path !== '.').map(path => {
            const id = 'validator0x' + path.slice(1);
            return `{
                const entries = Object.entries(${load}('${id}'));
                if (!entries.length) throw new Error('Empty entrypoint: ${id}');
                for (const [name, value] of entries) {
                    if (api[name] !== value) throw new Error('Export identity mismatch: ' + name);
                }
            }`;
        });
        const script = join(temp, 'consumer.' + extension);
        writeFileSync(script, `const api = ${load}('validator0x');\n${smoke}\n` + checks.join('\n') + `
            const { ok, throws } = ${load}('node:assert/strict');
            ok(new api.BitcoinValidator() instanceof api.AddressValidator);
            for (const invalid of ['bitcoin', 'unknown']) {
                throws(() => new api.EvmValidator(invalid), RangeError);
                throws(() => new api.CosmosValidator(invalid), RangeError);
            }
        `);
    }
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
    for (const doc of ['README.md', 'AGENTS.md']) {
        const examples = readFileSync(join(installed, doc), 'utf8').matchAll(/```ts\r?\n([\s\S]*?)```/g);
        const recipient = Array.from(examples, match => match[1]).find(code => code.includes('function checkRecipient'));
        assert.ok(recipient, `Missing recipient example in ${doc}`);
        writeFileSync(join(temp, 'recipient.mts'), recipient);
        run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--module', 'NodeNext', '--target', 'ES2020', '--strict', 'recipient.mts']);
        run(process.execPath, ['--input-type=module', '-e', `
            import assert from 'node:assert/strict';
            import { checkRecipient } from './recipient.mjs';
            const evm = 'd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
            assert.equal(checkRecipient(evm, 'base').address, '0x' + evm);
            assert.equal(checkRecipient('bc1pfeessrawgf', 'bitcoin').ok, false);
            assert.equal(checkRecipient('stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw', 'cardano').ok, false);
            const btc = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
            assert.equal(checkRecipient(' ' + btc + ' ', 'bitcoin').address, btc);
        `]);
    }
    const browser = { TextEncoder };
    runInNewContext(readFileSync(join(installed, 'dist/index.umd.js'), 'utf8'), browser);
    assert.ok(browser.validator0x.validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum').valid);
    assert.ok(browser.validator0x.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bitcoin').valid);
    // Measure complete consumer bundles, including shared chunks.
    async function bundleEntry(id) {
        const url = run(process.execPath, ['--input-type=module', '-e', `console.log(import.meta.resolve('${id}'))`]).trim();
        const bundle = await rollup({ input: fileURLToPath(url) });
        try {
            const { output } = await bundle.generate({ format: 'es' });
            assert.equal(output.length, 1);
            return output[0].code;
        } finally {
            await bundle.close();
        }
    }
    const fullSize = gzipSync(await bundleEntry('validator0x')).length;
    const solanaModule = await bundleEntry('validator0x/solana');
    const solanaSize = gzipSync(solanaModule).length;
    const workerCode = `import { SolanaValidator } from './solana.mjs';
        postMessage(new SolanaValidator().validate('HN7cABqLq46Es1jh92dQQy4aWDtG751BHhP1K2HWT7k1').valid);`;
    const chrome = await chromium.launch({ channel: 'chrome' });
    const server = createServer((request, response) => {
        if (request.url === '/') {
            response.setHeader('Content-Type', 'text/html');
            response.end('<title>validator0x worker test</title>');
        } else {
            response.setHeader('Content-Type', 'text/javascript');
            response.end(request.url === '/worker.mjs' ? workerCode : solanaModule);
        }
    });
    try {
        server.listen(0, '127.0.0.1');
        await once(server, 'listening');
        const page = await chrome.newPage();
        await page.goto(`http://127.0.0.1:${server.address().port}/`);
        const valid = await page.evaluate(() => new Promise((resolve, reject) => {
            const worker = new Worker('/worker.mjs', { type: 'module' });
            const timer = setTimeout(() => reject(new Error('Worker did not respond')), 10000);
            worker.onmessage = event => {
                clearTimeout(timer);
                worker.terminate();
                resolve(event.data);
            };
            worker.onerror = event => reject(new Error(event.message));
        }));
        assert.equal(valid, true);
    } finally {
        await chrome.close();
        server.close();
    }
    assert.ok(fullSize < 12000, `Root ESM exceeded 12 kB gzip: ${fullSize}`);
    assert.ok(solanaSize < 3000, `Solana ESM exceeded 3 kB gzip: ${solanaSize}`);
    console.log(`Packed consumers passed: ${entrypoints.length} ESM/CJS exports, NodeNext/bundler/legacy TypeScript, UMD without Node globals, and a Chrome ESM worker.`);
    console.log(`Root ESM: ${fullSize} bytes gzip; Solana-only: ${solanaSize} bytes gzip; npm tarball: ${pack.size} bytes; unpacked: ${pack.unpackedSize} bytes.`);
} catch (error) {
    if (error.stdout) console.error(String(error.stdout));
    if (error.stderr) console.error(String(error.stderr));
    throw error;
} finally {
    assert.ok(resolve(temp).startsWith(resolve(tmpdir()) + '\\') || resolve(temp).startsWith(resolve(tmpdir()) + '/'));
    rmSync(temp, { recursive: true, force: true });
}
