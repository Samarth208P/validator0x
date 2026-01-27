"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("./src");
var eth = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
var fmt = (0, src_1.formatAddress)(eth, 'ethereum', { checksum: true });
console.log("ETH Checksummed: '".concat(fmt, "'"));
