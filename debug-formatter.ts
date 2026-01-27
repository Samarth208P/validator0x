import { formatAddress } from './src';

const eth = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
const fmt = formatAddress(eth, 'ethereum', { checksum: true });
console.log(`ETH Checksummed: '${fmt}'`);
