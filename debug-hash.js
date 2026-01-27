"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var keccak256_1 = require("./src/utils/keccak256");
console.log('Empty:', (0, keccak256_1.keccak256)(''));
console.log('Hello:', (0, keccak256_1.keccak256)('hello'));
var input = 'd8da6bf26964af9d7eed9e03e53415d37aa96045';
var hash = (0, keccak256_1.keccak256)(input);
console.log("Input: ".concat(input));
console.log("Hash: ".concat(hash));
// Expected: 23315a676b744d084dd94808c1c463994301d0a520e557b7da7fba26e8346f3c
console.log("Match? ".concat(hash === '23315a676b744d084dd94808c1c463994301d0a520e557b7da7fba26e8346f3c'));
// Check specific indices
console.log("Hash[0] (d): ".concat(hash[0]));
console.log("Hash[1] (8): ".concat(hash[1]));
console.log("Hash[2] (d): ".concat(hash[2]));
console.log("Hash[3] (a): ".concat(hash[3]));
