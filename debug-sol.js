"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var base58_1 = require("./src/utils/base58");
var input = '11111111111111111111111111111111'; // 32 '1's
var decoded = (0, base58_1.decodeBase58)(input);
console.log("Input length: ".concat(input.length));
console.log("Decoded length: ".concat(decoded.length));
console.log("Decoded bytes: [".concat(decoded.join(', '), "]"));
