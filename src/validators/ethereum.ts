import { AddressValidator } from './base';
import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { isHex, stripHexPrefix, addHexPrefix } from '../utils/hex';
import { keccak256 } from '../utils/keccak256';

export class EthereumValidator extends AddressValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const cleanAddress = stripHexPrefix(address);
        // console.error(`DEBUG: Validating ${address} (clean: ${cleanAddress})`);

        // Check length
        if (cleanAddress.length !== 40) {
            // console.error(`DEBUG: Failed Length ${cleanAddress.length}`);
            return { valid: false, error: 'Invalid length', details: { errorCode: ValidationError.INVALID_LENGTH } };
        }

        // Check hex
        if (!isHex(cleanAddress)) {
            // console.error(`DEBUG: Failed Hex`);
            return { valid: false, error: 'Invalid hex characters', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
        }

        // Burn Address Check
        if (/^0+$/.test(cleanAddress)) {
            // console.error(`DEBUG: Failed Burn`);
            return { valid: false, error: 'Burn address detected', details: { errorCode: ValidationError.BURN_ADDRESS } };
        }

        // Checksum Validation
        if (options?.strict || (cleanAddress !== cleanAddress.toLowerCase() && cleanAddress !== cleanAddress.toUpperCase())) {
            if (!this.checkChecksum(cleanAddress)) {
                // console.error(`DEBUG: Failed Checksum: clean=${cleanAddress}`);
                return { valid: false, error: 'Invalid checksum', details: { errorCode: ValidationError.INVALID_CHECKSUM } };
            }
        }

        return {
            valid: true,
            blockchain: 'ethereum',
            details: {
                checksum: this.isChecksummed(address),
                network: 'mainnet' // Ethereum doesn't distinguish mainnet/testnet by address
            }
        };
    }

    format(address: string, options?: FormatOptions): string {
        let formatted = address.startsWith('0x') ? address : addHexPrefix(address);

        if (options?.checksum) {
            formatted = this.toChecksumAddress(formatted);
        }

        if (options?.shorten) {
            const len = options.shortenLength || 4;
            return `${formatted.slice(0, 2 + len)}...${formatted.slice(-len)}`;
        }

        return formatted;
    }

    private isChecksummed(address: string): boolean {
        const clean = stripHexPrefix(address);
        return addHexPrefix(clean) === this.toChecksumAddress(clean);
    }

    private checkChecksum(address: string): boolean {
        const clean = stripHexPrefix(address);

        // all lower or all upper → valid, no checksum claimed
        if (clean === clean.toLowerCase() || clean === clean.toUpperCase()) {
            return true;
        }

        // mixed case → must match EIP-55 checksum
        const checksummed = stripHexPrefix(this.toChecksumAddress(clean));
        return clean === checksummed;
    }

    private toChecksumAddress(address: string): string {
        try {
            if (!address) return '';
            const strip = stripHexPrefix(address).toLowerCase();
            const hash = keccak256(strip);
            let ret = '0x';

            for (let i = 0; i < strip.length; i++) {
                if (parseInt(hash[i], 16) >= 8) {
                    ret += strip[i].toUpperCase();
                } else {
                    ret += strip[i];
                }
            }
            return ret;
        } catch (error) {
            console.error('Checksum error:', error);
            return address;
        }
    }
}
