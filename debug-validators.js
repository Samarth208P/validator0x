"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("./src");
var keccak256_1 = require("./src/utils/keccak256");
console.log('--- Ethereum Debug ---');
var ethAddr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
console.log("Input: ".concat(ethAddr));
var ethRes = (0, src_1.validateAddress)(ethAddr, 'ethereum');
console.log("Result:", JSON.stringify(ethRes, null, 2));
var lower = ethAddr.toLowerCase();
var noPrefix = lower.slice(2);
var hash = (0, keccak256_1.keccak256)(noPrefix);
console.log("Hash of ".concat(noPrefix, ": ").concat(hash));
console.log('First 4 nibbles:', hash.substring(0, 4));
// Calculate checksum manually
var checksummed = '0x';
for (var i = 0; i < noPrefix.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
        checksummed += noPrefix[i].toUpperCase();
    }
    else {
        checksummed += noPrefix[i];
    }
}
console.log("Computed Checksum: ".concat(checksummed));
console.log("Match? ".concat(checksummed === ethAddr));
console.log('\n--- Solana Debug ---');
var solAddr = '11111111111111111111111111111111';
console.log("Input: ".concat(solAddr, " (Length: ").concat(solAddr.length, ")"));
var solRes = (0, src_1.validateAddress)(solAddr, 'solana');
console.log("Result:", JSON.stringify(solRes, null, 2));
