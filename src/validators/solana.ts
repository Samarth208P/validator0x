import { AddressValidator } from './base';
import { ValidationResult, ValidationError } from '../types';
import { decodeBase58 } from '../utils/base58';

export class SolanaValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
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

        // A valid address can identify a program or PDA rather than a user-controlled wallet.
        if (address === '11111111111111111111111111111111') {
            return { valid: true, blockchain: 'solana', details: { format: 'System Program' } };
        }

        return {
            valid: true,
            blockchain: 'solana'
        };
    }

}
