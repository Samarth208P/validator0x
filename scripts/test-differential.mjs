import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { base58, bech32, bech32m } from '@scure/base';
import { validateAddress, detectBlockchain, addChecksum, COSMOS_CHAINS } from '../dist/index.mjs';

// Test the internal primitives independently without adding public API surface.
async function sourceModule(name) {
    const source = readFileSync(new URL(`../src/utils/${name}.ts`, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } });
    return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { keccak256 } = await sourceModule('keccak256');
const { sha256 } = await sourceModule('sha256');
const { encodeBase58, decodeBase58 } = await sourceModule('base58');
let checks = 0;
function equal(actual, expected, message) { assert.deepEqual(actual, expected, message); checks++; }
function bytes(length, seed = 0) { return Uint8Array.from({ length }, (_, i) => (i * 71 + seed * 37) & 255); }
function sha(data) { return createHash('sha256').update(data).digest(); }
function checked(data) { return base58.encode(Uint8Array.from([...data, ...sha(sha(data)).subarray(0, 4)])); }

for (let length = 0; length <= 300; length++) {
    const input = bytes(length);
    equal(Buffer.from(sha256(input)), sha(input), `SHA-256 length ${length}`);
    const text = 'a'.repeat(length);
    equal(keccak256(text), Buffer.from(keccak_256(new TextEncoder().encode(text))).toString('hex'), `Keccak length ${length}`);
    equal(encodeBase58(input), base58.encode(input), `Base58 encoding length ${length}`);
    equal(decodeBase58(base58.encode(input)), input, `Base58 decoding length ${length}`);
}
for (const text of ['é', '中文', '🙂', '\ud800', '🙂'.repeat(100)]) {
    equal(keccak256(text), Buffer.from(keccak_256(new TextEncoder().encode(text))).toString('hex'), 'Keccak UTF-8');
}
for (let seed = 0; seed < 100; seed++) {
    const lower = Buffer.from(bytes(20, seed)).toString('hex');
    const hash = Buffer.from(keccak_256(new TextEncoder().encode(lower))).toString('hex');
    const checksum = '0x' + [...lower].map((c, i) => parseInt(hash[i], 16) >= 8 ? c.toUpperCase() : c).join('');
    equal(addChecksum('0x' + lower, 'ethereum'), checksum, 'EIP-55 independent checksum');
    equal(validateAddress(checksum, 'ethereum', { strict: true }).valid, true, 'EIP-55 strict');
}

for (const [chain, hrp] of [['bitcoin', 'bc'], ['bitcoin', 'tb'], ['litecoin', 'ltc'], ['litecoin', 'tltc']]) {
    for (let version = 0; version <= 17; version++) {
        for (let length = 0; length <= 41; length++) {
            for (const codec of [bech32, bech32m]) {
                const address = codec.encode(hrp, [version, ...codec.toWords(bytes(length))]);
                const valid = version <= 16 && length >= 2 && length <= 40 &&
                    (version !== 0 || length === 20 || length === 32) && codec === (version === 0 ? bech32 : bech32m);
                equal(validateAddress(address, chain).valid, valid, `${chain} v${version} length ${length}`);
            }
        }
    }
}
const versions = { bitcoin: [0, 5, 111, 196], litecoin: [48, 50, 5, 111, 58, 196], dogecoin: [30, 22, 113, 196], tron: [65] };
for (let version = 0; version < 256; version++) {
    const address = checked(Uint8Array.from([version, ...bytes(20, 3)]));
    for (const [chain, allowed] of Object.entries(versions)) equal(validateAddress(address, chain).valid, allowed.includes(version), `${chain} Base58 version ${version}`);
}

const prefixes = { cosmos: 'cosmos', osmosis: 'osmo', celestia: 'celestia', injective: 'inj', sei: 'sei' };
for (const chain of COSMOS_CHAINS) {
    for (let length = 0; length <= 40; length++) {
        const address = bech32.encode(prefixes[chain], bech32.toWords(bytes(length)));
        const valid = length === 20 || (length === 32 && !['celestia', 'injective'].includes(chain));
        equal(validateAddress(address, chain).valid, valid, `${chain} length ${length}`);
        equal(validateAddress(bech32m.encode(prefixes[chain], bech32.toWords(bytes(length))), chain).valid, false, 'Reject Bech32m accounts');
        if (valid) {
            equal(detectBlockchain(address), chain, 'Cosmos detection');
            equal(validateAddress(address.toUpperCase(), chain).valid, true, 'Uppercase Bech32');
            equal(validateAddress(address, chain, { network: 'testnet' }).valid, true, 'Network not encoded');
            equal(validateAddress(address.slice(0, -1) + (address.endsWith('q') ? 'p' : 'q'), chain).valid, false, 'Checksum mutation');
        }
    }
    equal(validateAddress(bech32.encode(prefixes[chain] + 'valoper', bech32.toWords(bytes(20))), chain).valid, false, 'Reject operator prefix');
}

// Valid checksums must not make structurally impossible Cardano payloads pass.
for (let type = 0; type < 16; type++) {
    for (let length = 0; length <= 60; length++) {
        const payload = bytes(length);
        if (length) payload[0] = (type << 4) | 1;
        const hrp = type >= 14 ? 'stake' : 'addr';
        const address = bech32.encode(hrp, bech32.toWords(payload), 256);
        const valid = type <= 3 ? length === 57 : [6, 7, 14, 15].includes(type) && length === 29;
        // Pointers are tested using official CIP-19 vectors and explicit malformed encodings below.
        if (type !== 4 && type !== 5) equal(validateAddress(address, 'cardano').valid, valid, `Cardano type ${type} length ${length}`);
    }
}
for (const payload of [Uint8Array.from([0x61, ...bytes(28)]), Uint8Array.from([0x60, ...bytes(28)])]) {
    const wrongHrp = payload[0] === 0x61 ? 'addr_test' : 'addr';
    equal(validateAddress(bech32.encode(wrongHrp, bech32.toWords(payload)), 'cardano').valid, false, 'Cardano network/header mismatch');
    equal(validateAddress(bech32m.encode('addr', bech32.toWords(payload)), 'cardano').valid, false, 'Cardano Bech32m');
}
for (const pointer of [[0], [0, 0], [0, 0, 0, 0], [128, 0, 0, 0], [...new Array(11).fill(255), 0, 0, 0]]) {
    const payload = Uint8Array.from([0x41, ...bytes(28), ...pointer]);
    equal(validateAddress(bech32.encode('addr', bech32.toWords(payload), 256), 'cardano').valid, false, 'Malformed pointer');
}
console.log(`${checks} independent cryptographic, encoding, and structure comparisons passed.`);
