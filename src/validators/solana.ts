import { AddressValidator } from './base';
import { ValidationResult, ValidationOptions, FormatOptions, ValidationError } from '../types';
import { decodeBase58 } from '../utils/base58';

export class SolanaValidator extends AddressValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        if (address.length < 32 || address.length > 44) {
            return { valid: false, error: 'Invalid length', details: { errorCode: ValidationError.INVALID_LENGTH } };
        }

        try {
            const decoded = decodeBase58(address);
            if (decoded.length !== 32) {
                return { valid: false, error: 'Invalid public key length', details: { errorCode: ValidationError.INVALID_LENGTH } };
            }
        } catch {
            return { valid: false, error: 'Invalid Base58 characters', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }

        // Burn check? Solana burn addresses aren't as standard '0x00', but 1111111... is system program
        // System Program: 11111111111111111111111111111111
        if (/^1+$/.test(address)) {
            // Technically valid system account, but maybe warn if it's strictly user wallets?
            // For now, let's treat it as valid but maybe note it? 
            // User asked for "burn address detection". System program is effectively special.
            // Let's flag "11111111111111111111111111111111" specifically if needed.
            if (address === '11111111111111111111111111111111') {
                return { valid: true, blockchain: 'solana', details: { format: 'System Program' } };
            }
        }

        return {
            valid: true,
            blockchain: 'solana'
        };
    }

    format(address: string, options?: FormatOptions): string {
        if (options?.shorten) {
            const len = options.shortenLength || 4;
            return `${address.slice(0, len)}...${address.slice(-len)}`;
        }
        return address;
    }
}
