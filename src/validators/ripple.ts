import { AddressValidator } from './base';
import { ValidationResult, ValidationError } from '../types';
import { checkedPayload } from '../utils/base58check';
import { createBase58Decoder } from '../utils/base58';

const decodeRippleBase58 = createBase58Decoder('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz');

export class RippleValidator extends AddressValidator {
    protected validateImplementation(address: string): ValidationResult {
        // Ripple addresses always start with 'r'
        if (!address.startsWith('r')) {
            return { valid: false, error: 'Must start with r', details: { errorCode: ValidationError.INVALID_FORMAT } };
        }

        if (address.length < 25 || address.length > 35) {
            return { valid: false, error: 'Invalid length', details: { errorCode: ValidationError.INVALID_LENGTH } };
        }

        try {
            const decoded = decodeRippleBase58(address);
            if (decoded.length !== 25 || decoded[0] !== 0) {
                return { valid: false, error: 'Invalid decoded length', details: { errorCode: ValidationError.INVALID_LENGTH } };
            }

            if (!checkedPayload(decoded)) {
                return { valid: false, error: 'Invalid checksum', details: { errorCode: ValidationError.INVALID_CHECKSUM } };
            }

            return { valid: true, blockchain: 'ripple' };
        } catch {
            return { valid: false, error: 'Invalid characters', details: { errorCode: ValidationError.INVALID_CHARACTERS } };
        }
    }

}
